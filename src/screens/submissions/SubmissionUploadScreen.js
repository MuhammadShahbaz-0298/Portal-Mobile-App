// Upload or replace a ZIP submission for an open assignment.
// Device checks: ZIP extension, MIME type, 50 MB cap, assignment maxFileSizeMb.
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { SelectRow } from '../../components/ui/SelectRow';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { isStudentRole } from '../../utils/access';
import { useToast } from '../../context/ToastContext';
import { listAssignments, getAssignment } from '../../api/assignments';
import {
  createSubmission,
  listSubmissions,
  replaceSubmission,
} from '../../api/submissions';
import { FILES, SUBMISSIONS, COMMON, VALIDATION } from '../../constants/strings';
import { QUERY_LIMIT, MAX_FILE_MB } from '../../constants/options';
import { formatFileSize, pickZipFile } from '../../utils/files';
import { isPast } from '../../utils/dates';
import { getErrorMessage } from '../../utils/errors';
import { getId } from '../../utils/ids';
import { spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function SubmissionUploadScreen({ route, navigation }) {
  const { user } = useAuth();
  const colors = useThemeColors();
  const toast = useToast();
  const student = isStudentRole(user);
  const canUpload = student && can(user, PERMISSIONS.SUBMISSIONS_VIEW, ROLE_SETS.LEARNING);
  const [assignmentId, setAssignmentId] = useState(route.params?.assignmentId || '');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const assignments = useApiData(() => listAssignments({ limit: QUERY_LIMIT }), {
    enabled: canUpload && !route.params?.assignmentId,
  });
  const assignment = useApiData(() => getAssignment(assignmentId), {
    enabled: canUpload && Boolean(assignmentId),
    reloadKey: assignmentId,
  });
  const submissions = useApiData(
    () => listSubmissions({ assignmentId, limit: QUERY_LIMIT }),
    { enabled: canUpload && Boolean(assignmentId), reloadKey: assignmentId }
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
  const submissionsFailed = submissions.loading || Boolean(submissions.error);

  const options = (assignments.data?.items || []).map((item) => ({
    value: item._id,
    label: item.title,
  }));

  async function onPick() {
    setError('');
    try {
      const picked = await pickZipFile();
      if (!picked) return;
      // Enforce the assignment's own size cap before upload when known.
      const capMb = current?.maxFileSizeMb || MAX_FILE_MB;
      if (picked.size && picked.size > capMb * 1024 * 1024) {
        setError(VALIDATION.fileSize(capMb));
        return;
      }
      setFile(picked);
    } catch (pickError) {
      setError(getErrorMessage(pickError));
    }
  }

  async function onSubmit() {
    if (!assignmentId) return setError(SUBMISSIONS.chooseAssignment);
    if (!file) return setError(SUBMISSIONS.chooseFile);
    if (!open) return setError(SUBMISSIONS.closedMessage);
    if (blocked) return setError(SUBMISSIONS.resubmissionBlocked);
    if (submissionsFailed) return setError(SUBMISSIONS.submissionCheckFailed);

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
      {!route.params?.assignmentId ? (
        <SelectRow
          label={SUBMISSIONS.assignmentLabel}
          value={assignmentId}
          valueLabel={options.find((item) => item.value === assignmentId)?.label}
          options={options}
          onChange={setAssignmentId}
        />
      ) : null}

      {assignment.loading ? <LoadingState /> : null}
      {assignment.error ? (
        <ErrorState message={assignment.error} onRetry={assignment.retry} />
      ) : null}

      {current ? (
        <Card>
          <AppText variant="subtitle">{current.title}</AppText>
          <AppText variant="caption">{COMMON.fileSize}: {current.maxFileSizeMb || MAX_FILE_MB} MB</AppText>
        </Card>
      ) : null}

      <Card>
        <AppText variant="subtitle">{SUBMISSIONS.fileLabel}</AppText>
        {file ? (
          <View style={[styles.file, { borderTopColor: colors.line }]}>
            <AppText variant="body" numberOfLines={1}>{file.name}</AppText>
            <AppText variant="caption">{formatFileSize(file.size)}</AppText>
          </View>
        ) : (
          <AppText variant="caption">{COMMON.noFile}</AppText>
        )}
        <Button
          title={file ? FILES.replace : SUBMISSIONS.uploadTitle}
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
        disabled={!assignmentId || !open || blocked || submissionsFailed}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  file: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    gap: 2,
  },
});
