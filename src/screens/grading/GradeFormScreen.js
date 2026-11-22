// Grade a single submission. Numeric marks between 0 and 100, plus feedback.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Row } from '../../components/ui/Row';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { AiDraftCard } from '../../components/grading/AiDraftCard';
import { PermissionState } from '../../components/states/PermissionState';
import { ErrorState } from '../../components/states/ErrorState';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import {
  gradeSubmission,
  listSubmissions,
  regenerateAiDraft,
  discardAiDraft,
} from '../../api/submissions';
import { downloadSubmission } from '../../services/download';
import { GRADING, COMMON, FILES, ERRORS } from '../../constants/strings';
import {
  DRAFT_POLL_INTERVAL_MS,
  DRAFT_POLL_MAX_MS,
  FEEDBACK_MAX_LENGTH,
  GRADE_MAX,
  GRADE_MIN,
} from '../../constants/options';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { formatDateTime } from '../../utils/dates';
import { getErrorMessage } from '../../utils/errors';
import { getDisplayName, getId } from '../../utils/ids';

export function GradeFormScreen({ route, navigation }) {
  const submission = route.params?.submission;
  const { user } = useAuth();
  const toast = useToast();
  const canGrade = can(user, PERMISSIONS.SUBMISSIONS_GRADE, ROLE_SETS.STAFF);
  const canView = can(user, PERMISSIONS.SUBMISSIONS_VIEW, ROLE_SETS.STAFF);
  const [grade, setGrade] = useState(
    submission?.grade != null && submission.grade !== '' ? String(submission.grade) : ''
  );
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [draft, setDraft] = useState(submission?.aiDraft || null);
  const [draftBusy, setDraftBusy] = useState('');
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const submissionId = getId(submission);
  const mountedRef = useRef(true);
  const pollIntervalRef = useRef(null);
  const pollStartRef = useRef(0);
  // route.params never updates, so this screen always shows the same submission.
  const shownIdRef = useRef(submissionId);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Only update draft state if this screen is still open on the same submission.
  const canUpdateDraft = useCallback(() => {
    return mountedRef.current && shownIdRef.current === submissionId;
  }, [submissionId]);

  // Quietly re-read the draft from the submission list. Never touches grade or
  // feedback, and only updates state if this screen is still on the same item.
  const refreshDraftFromList = useCallback(async () => {
    if (!canUpdateDraft()) return;
    const assignmentId = getId(submission.assignment);
    if (!assignmentId) return;
    try {
      const { items } = await listSubmissions({ assignmentId });
      if (!canUpdateDraft()) return;
      const found = (items || []).find((item) => getId(item) === submissionId);
      if (found?.aiDraft) setDraft(found.aiDraft);
    } catch {
      // Quiet: never surface draft-refresh failures to the user.
    }
  }, [submission, submissionId, canUpdateDraft]);

  // While the draft is pending, quietly re-check every 2 seconds. Stops when
  // the status is no longer pending, on unmount, or after ~3 minutes.
  useEffect(() => {
    const isPending = draft?.status === 'pending';
    clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = null;

    if (!isPending || !submissionId) {
      pollStartRef.current = 0;
      return;
    }

    const tick = async () => {
      if (!canUpdateDraft()) return;
      await refreshDraftFromList();

      const elapsed = Date.now() - pollStartRef.current;
      if (elapsed >= DRAFT_POLL_MAX_MS) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        pollStartRef.current = 0;
        if (canUpdateDraft()) {
          setError(GRADING.aiStillDrafting);
        }
      }
    };

    pollStartRef.current = Date.now();
    tick();
    pollIntervalRef.current = setInterval(tick, DRAFT_POLL_INTERVAL_MS);

    return () => {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      pollStartRef.current = 0;
    };
  }, [draft?.status, submissionId, canUpdateDraft, refreshDraftFromList]);

  if (!canGrade || !canView) {
    return <Screen><PermissionState /></Screen>;
  }
  if (!submission) {
    return <Screen><ErrorState message={COMMON.noResults} /></Screen>;
  }

  async function onDownload() {
    setDownloading(true);
    setError('');
    try {
      await downloadSubmission(submission);
      toast(FILES.downloadComplete);
    } catch (downloadError) {
      setError(getErrorMessage(downloadError));
    } finally {
      setDownloading(false);
    }
  }

  // Re-read the submission from the list so polling never touches the form.
  async function onRefreshDraft() {
    const assignmentId = getId(submission.assignment);
    if (!assignmentId || draftBusy) return;

    setDraftBusy('refresh');
    setError('');
    try {
      const { items } = await listSubmissions({ assignmentId });
      if (!canUpdateDraft()) return;
      const found = (items || []).find((item) => getId(item) === submissionId);
      // If it is not on this page, keep the draft we already have.
      if (found?.aiDraft) setDraft(found.aiDraft);
    } catch (refreshError) {
      if (canUpdateDraft()) setError(getErrorMessage(refreshError));
    } finally {
      if (canUpdateDraft()) setDraftBusy('');
    }
  }

  async function onGenerateDraft() {
    if (!submissionId || draftBusy) return;

    setDraftBusy('generate');
    setError('');
    try {
      const updated = await regenerateAiDraft(submissionId);
      if (!canUpdateDraft()) return;
      if (updated?.aiDraft) setDraft(updated.aiDraft);
    } catch (generateError) {
      if (canUpdateDraft()) {
        setError(
          generateError.status === 404
            ? (generateError.message || ERRORS.notFound)
            : getErrorMessage(generateError)
        );
        refreshDraftFromList();
      }
    } finally {
      if (canUpdateDraft()) setDraftBusy('');
    }
  }

  async function onDiscardDraft() {
    if (!submissionId || draftBusy) return;

    setDraftBusy('discard');
    setError('');
    try {
      const updated = await discardAiDraft(submissionId);
      if (!canUpdateDraft()) return;
      if (updated?.aiDraft) setDraft(updated.aiDraft);
    } catch (discardError) {
      if (canUpdateDraft()) {
        setError(
          discardError.status === 404
            ? (discardError.message || ERRORS.notFound)
            : getErrorMessage(discardError)
        );
        refreshDraftFromList();
      }
    } finally {
      if (canUpdateDraft()) setDraftBusy('');
    }
  }

  // Copy the draft into the form boxes. This never saves anything.
  function applyDraft() {
    const marks = draft?.suggestedMarks;
    if (typeof marks === 'number' && Number.isFinite(marks)) {
      const clamped = Math.min(GRADE_MAX, Math.max(GRADE_MIN, marks));
      setGrade(String(Math.round(clamped * 100) / 100));
    }
    if (typeof draft?.feedback === 'string') {
      setFeedback(draft.feedback);
    }
    setConfirmReplace(false);
  }

  function onUseDraft() {
    // Do not overwrite typing without asking first.
    if (feedback.trim()) {
      setConfirmReplace(true);
      return;
    }
    applyDraft();
  }

  async function onSubmit() {
    const value = grade.trim();
    const numeric = Number(value);
    if (!value || Number.isNaN(numeric) || numeric < GRADE_MIN || numeric > GRADE_MAX) {
      setError(GRADING.numericHint);
      return;
    }

    setBusy(true);
    setError('');
    try {
      await gradeSubmission(getId(submission), {
        grade: String(numeric),
        feedback: feedback.trim(),
        status: 'graded',
      });
      toast(GRADING.graded);
      navigation.goBack();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Card>
        <AppText variant="subtitle">{getDisplayName(submission.student)}</AppText>
        <Row label={COMMON.assignment} value={submission.assignment?.title} />
        <Row label={COMMON.batch} value={submission.batch?.name} />
        <Row label={COMMON.file} value={submission.fileName} />
        <Row label={COMMON.status} value={submission.status} />
        <Row label={COMMON.submittedAt} value={formatDateTime(submission.submittedAt)} />
        <Button
          title={COMMON.download}
          variant="secondary"
          onPress={onDownload}
          loading={downloading}
        />
      </Card>

      <Input
        label={GRADING.gradeLabel}
        value={grade}
        onChangeText={setGrade}
        placeholder={GRADING.gradePlaceholder}
        keyboardType="decimal-pad"
        maxLength={6}
        hint={GRADING.gradeHint}
      />
      <AiDraftCard
        draft={draft}
        busy={draftBusy}
        onUse={onUseDraft}
        onDiscard={onDiscardDraft}
        onRefresh={onRefreshDraft}
        onGenerate={onGenerateDraft}
      />
      <Input
        label={GRADING.feedbackLabel}
        value={feedback}
        onChangeText={setFeedback}
        placeholder={GRADING.feedbackPlaceholder}
        multiline
        maxLength={FEEDBACK_MAX_LENGTH}
      />
      <FormError message={error} />
      <Button
        title={busy ? COMMON.saving : GRADING.saveGrade}
        onPress={onSubmit}
        loading={busy}
      />
      <ConfirmDialog
        visible={confirmReplace}
        title={GRADING.aiReplaceTitle}
        body={GRADING.aiReplaceBody}
        confirmLabel={GRADING.aiReplaceConfirm}
        onConfirm={applyDraft}
        onCancel={() => setConfirmReplace(false)}
      />
    </Screen>
  );
}
