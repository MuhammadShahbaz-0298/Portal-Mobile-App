// Grade a single submission. Accepts numeric or short letter grades.
import { useState } from 'react';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Row } from '../../components/ui/Row';
import { Input } from '../../components/ui/Input';
import { SelectRow } from '../../components/ui/SelectRow';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { PermissionState } from '../../components/states/PermissionState';
import { ErrorState } from '../../components/states/ErrorState';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { gradeSubmission } from '../../api/submissions';
import { downloadSubmission } from '../../services/download';
import { GRADING, COMMON, FILES } from '../../constants/strings';
import { GRADING_STATUSES } from '../../constants/options';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { formatDateTime } from '../../utils/dates';
import { getErrorMessage } from '../../utils/errors';
import { getDisplayName, getId } from '../../utils/ids';
import { required } from '../../utils/validators';

export function GradeFormScreen({ route, navigation }) {
  const submission = route.params?.submission;
  const { user } = useAuth();
  const toast = useToast();
  const canGrade = hasPermission(user, PERMISSIONS.SUBMISSIONS_GRADE);
  const canView = hasPermission(user, PERMISSIONS.SUBMISSIONS_VIEW);
  const [grade, setGrade] = useState(submission?.grade || '');
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [status, setStatus] = useState(
    submission?.status === 'rejected' ? 'rejected' : 'graded'
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
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
    setSubmitError('');
    try {
      await downloadSubmission(submission);
      toast(FILES.downloadComplete);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  }

  async function onSubmit() {
    const value = grade.trim();
    const numeric = Number(value);
    const gradeError = required(value, GRADING.gradeLabel);
    const rangeError =
      value && Number.isFinite(numeric) && (numeric < 0 || numeric > 100)
        ? GRADING.numericHint
        : '';
    const nextErrors = {
      grade: gradeError || rangeError || (value.length > 10 ? GRADING.gradeHint : ''),
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (nextErrors.grade) return;

    setBusy(true);
    try {
      await gradeSubmission(getId(submission), {
        grade: value,
        feedback: feedback.trim(),
        status,
      });
      toast(status === 'rejected' ? GRADING.rejected : GRADING.graded);
      navigation.goBack();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
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
        <Row
          label={COMMON.status}
          value={
            GRADING_STATUSES.find((item) => item.value === submission.status)
              ?.label || submission.status
          }
        />
        <Row label={COMMON.grade} value={submission.grade} />
        <Row label={COMMON.submittedAt} value={formatDateTime(submission.submittedAt)} />
        {canView ? (
          <Button
            title={COMMON.download}
            variant="secondary"
            onPress={onDownload}
            loading={downloading}
          />
        ) : null}
      </Card>

      <Input
        label={GRADING.gradeLabel}
        value={grade}
        onChangeText={setGrade}
        placeholder={GRADING.gradePlaceholder}
        maxLength={10}
        error={errors.grade}
        hint={GRADING.gradeHint}
      />
      <SelectRow
        label={GRADING.statusLabel}
        value={status}
        valueLabel={GRADING_STATUSES.find((item) => item.value === status)?.label}
        options={GRADING_STATUSES}
        onChange={setStatus}
      />
      <Input
        label={GRADING.feedbackLabel}
        value={feedback}
        onChangeText={setFeedback}
        placeholder={GRADING.feedbackPlaceholder}
        multiline
        maxLength={2000}
      />
      <FormError message={submitError} />
      <Button
        title={busy ? COMMON.saving : GRADING.saveGrade}
        onPress={onSubmit}
        loading={busy}
      />
    </Screen>
  );
}
