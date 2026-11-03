// Grade a single submission. Numeric marks between 0 and 100, plus feedback.
import { useState } from 'react';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Row } from '../../components/ui/Row';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { PermissionState } from '../../components/states/PermissionState';
import { ErrorState } from '../../components/states/ErrorState';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { gradeSubmission } from '../../api/submissions';
import { downloadSubmission } from '../../services/download';
import { GRADING, COMMON, FILES } from '../../constants/strings';
import { GRADE_MAX, GRADE_MIN } from '../../constants/options';
import { PERMISSIONS, can } from '../../constants/permissions';
import { formatDateTime } from '../../utils/dates';
import { getErrorMessage } from '../../utils/errors';
import { getDisplayName, getId } from '../../utils/ids';

export function GradeFormScreen({ route, navigation }) {
  const submission = route.params?.submission;
  const { user } = useAuth();
  const toast = useToast();
  const canGrade = can(user, PERMISSIONS.SUBMISSIONS_GRADE, ['admin', 'teacher']);
  const canView = can(user, PERMISSIONS.SUBMISSIONS_VIEW, ['admin', 'teacher']);
  const [grade, setGrade] = useState(
    submission?.grade != null && submission.grade !== '' ? String(submission.grade) : ''
  );
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);

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
      <Input
        label={GRADING.feedbackLabel}
        value={feedback}
        onChangeText={setFeedback}
        placeholder={GRADING.feedbackPlaceholder}
        multiline
        maxLength={2000}
      />
      <FormError message={error} />
      <Button
        title={busy ? COMMON.saving : GRADING.saveGrade}
        onPress={onSubmit}
        loading={busy}
      />
    </Screen>
  );
}
