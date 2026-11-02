// Upload or replace a ZIP submission for an open assignment.
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Row } from '../../components/ui/Row';
import { SelectRow } from '../../components/ui/SelectRow';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { InfoBanner } from '../../components/ui/InfoBanner';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { useToast } from '../../context/ToastContext';
import { listAssignments, getAssignment } from '../../api/assignments';
import {
  createSubmission,
  listSubmissions,
  replaceSubmission,
} from '../../api/submissions';
import { FILES, COMMON, SUBMISSIONS } from '../../constants/strings';
import { formatFileSize, pickZipFile } from '../../utils/files';
import { formatDate, isPast } from '../../utils/dates';
import { getErrorMessage } from '../../utils/errors';
import { getId } from '../../utils/ids';
import { colors, spacing } from '../../constants/theme';

export function SubmissionUploadScreen({ route, navigation }) {
  const { user } = useAuth();
  const toast = useToast();
  const canUpload =
    user?.role === 'student' &&
    hasPermission(user, PERMISSIONS.SUBMISSIONS_VIEW);
  const [assignmentId, setAssignmentId] = useState(route.params?.assignmentId || '');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const assignments = useApiData(() => listAssignments({ limit: 100 }), [], {
    enabled: canUpload,
  });
  const assignment = useApiData(() => getAssignment(assignmentId), [assignmentId], {
    enabled: canUpload && Boolean(assignmentId),
  });
  const submissions = useApiData(
    () => listSubmissions({ assignmentId, limit: 100 }),
    [assignmentId],
    { enabled: canUpload && Boolean(assignmentId) }
  );

  useEffect(() => {
    setFile(null);
    setError('');
  }, [assignmentId]);

  if (!canUpload) return <Screen><PermissionState /></Screen>;

  const current = assignment.data;
  const mine = (submissions.data?.items || []).find(
    (item) => getId(item.student) === getId(user)
  );
  const open = current && current.active !== false && !isPast(current.dueDate);
  const blocked = mine && current?.resubmissionPolicy !== 'allowed';
  const submissionsUnavailable = submissions.loading || Boolean(submissions.error);
  const options = (assignments.data?.items || []).map((item) => ({
    value: item._id,
    label: item.title,
  }));
  const selected = options.find((item) => item.value === assignmentId);

  async function onPick() {
    setError('');
    try {
      const picked = await pickZipFile();
      if (picked) setFile(picked);
    } catch (pickError) {
      setError(getErrorMessage(pickError));
    }
  }

  async function onSubmit() {
    if (!assignmentId) return setError(SUBMISSIONS.chooseAssignment);
    if (!file) return setError(SUBMISSIONS.chooseFile);
    if (!open) return setError(SUBMISSIONS.closedMessage);
    if (blocked) return setError(SUBMISSIONS.resubmissionBlocked);
    if (submissionsUnavailable) {
      return setError(SUBMISSIONS.submissionCheckFailed);
    }

    setBusy(true);
    setError('');
    try {
      if (mine) await replaceSubmission(mine._id, file);
      else await createSubmission(assignmentId, file);
      toast(SUBMISSIONS.uploaded);
      navigation.goBack();
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      {assignments.error ? <InfoBanner tone="danger" text={assignments.error} /> : null}
      {!route.params?.assignmentId ? (
        <SelectRow
          label={SUBMISSIONS.assignmentLabel}
          value={assignmentId}
          valueLabel={selected?.label}
          options={options}
          onChange={setAssignmentId}
        />
      ) : null}

      {assignmentId && assignment.loading ? <LoadingState /> : null}
      {assignment.error ? (
        <ErrorState message={assignment.error} onRetry={assignment.retry} />
      ) : null}
      {submissions.error ? (
        <InfoBanner tone="danger" text={submissions.error} />
      ) : null}

      {current ? (
        <Card>
          <AppText variant="subtitle">{current.title}</AppText>
          <Row label={COMMON.batch} value={current.batch?.name} />
          <Row label={COMMON.dueDate} value={formatDate(current.dueDate)} />
          <Row
            label={COMMON.file}
            value={SUBMISSIONS.fileMeta(
              COMMON.fileSizeHint(current.maxFileSizeMb)
            )}
          />
        </Card>
      ) : null}

      {!open && current ? (
        <InfoBanner tone="warning" text={SUBMISSIONS.closedMessage} />
      ) : null}
      {blocked ? <InfoBanner tone="warning" text={SUBMISSIONS.resubmissionBlocked} /> : null}
      {mine && !blocked ? (
        <InfoBanner tone="warning" text={SUBMISSIONS.replacementWarning} />
      ) : null}

      <Card>
        <AppText variant="subtitle">{SUBMISSIONS.fileLabel}</AppText>
        <AppText variant="small">{SUBMISSIONS.uploadSubtitle}</AppText>
        {file ? (
          <View style={styles.file}>
            <AppText variant="body">{file.name}</AppText>
            <AppText variant="caption">{formatFileSize(file.size)}</AppText>
          </View>
        ) : (
          <AppText variant="caption">{COMMON.noFile}</AppText>
        )}
        <Button
          title={file ? FILES.replace : SUBMISSIONS.submitWithFile}
          variant="secondary"
          onPress={onPick}
          disabled={busy || blocked}
        />
      </Card>

      <FormError message={error} />
      <Button
        title={
          busy
            ? SUBMISSIONS.uploading
            : mine
              ? SUBMISSIONS.replace
              : SUBMISSIONS.upload
        }
        onPress={onSubmit}
        loading={busy}
        disabled={!assignmentId || !open || blocked || submissionsUnavailable}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  file: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.sm,
    gap: 2,
  },
});
