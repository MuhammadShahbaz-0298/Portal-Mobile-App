// Assignment detail with student submission controls and staff management actions.
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Row } from '../../components/ui/Row';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { InfoBanner } from '../../components/ui/InfoBanner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useToast } from '../../context/ToastContext';
import { archiveAssignment, getAssignment } from '../../api/assignments';
import { listSubmissions } from '../../api/submissions';
import { downloadSubmission } from '../../services/download';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { ASSIGNMENTS, COMMON, FILES, SUBMISSIONS } from '../../constants/strings';
import {
  DEFAULT_MAX_FILE_MB,
  SUBMISSION_STATUSES,
} from '../../constants/options';
import { ROUTES } from '../../constants/app';
import { formatDateTime, isPast } from '../../utils/dates';
import { formatFileSize } from '../../utils/files';
import { getErrorMessage } from '../../utils/errors';
import { getId } from '../../utils/ids';
import { spacing } from '../../constants/theme';

export function AssignmentDetailScreen({ route, navigation }) {
  const id = route.params?.id || route.params?.assignmentId;
  const { user } = useAuth();
  const toast = useToast();
  const canView = hasPermission(user, PERMISSIONS.ASSIGNMENTS_VIEW);
  const canEdit = hasPermission(user, PERMISSIONS.ASSIGNMENTS_UPDATE);
  const canArchive = hasPermission(user, PERMISSIONS.ASSIGNMENTS_DELETE);
  const canSubmissions = hasPermission(user, PERMISSIONS.SUBMISSIONS_VIEW);
  const isStudent = user?.role === 'student';
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const detail = useApiData(() => getAssignment(id), [id], { enabled: canView });
  const submissions = useApiData(
    () => listSubmissions({ assignmentId: id, limit: 100 }),
    [id],
    { enabled: canSubmissions && isStudent }
  );

  useFocusEffect(
    useCallback(() => {
      if (canView) detail.refresh();
      if (canSubmissions && isStudent) submissions.refresh();
    }, [id])
  );

  if (!canView) return <Screen><PermissionState /></Screen>;
  if (detail.loading) return <Screen><LoadingState /></Screen>;
  if (detail.error && !detail.data) {
    return <Screen><ErrorState message={detail.error} onRetry={detail.retry} /></Screen>;
  }

  const assignment = detail.data;
  if (!assignment) return <Screen><ErrorState message={COMMON.noResults} /></Screen>;
  const mine = (submissions.data?.items || []).find(
    (item) => getId(item.student) === getId(user)
  );
  const open = assignment.active !== false && !isPast(assignment.dueDate);
  const canReplace = mine && assignment.resubmissionPolicy === 'allowed';
  const canUpload = isStudent && canSubmissions && open && (!mine || canReplace);

  async function onArchive() {
    setBusy(true);
    try {
      await archiveAssignment(id);
      toast(ASSIGNMENTS.archivedSuccess);
      setConfirm(false);
      navigation.goBack();
    } catch (error) {
      toast(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onDownload() {
    if (!mine) return;
    setBusy(true);
    try {
      await downloadSubmission(mine);
      toast(FILES.downloadComplete);
    } catch (error) {
      toast(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function onRefresh() {
    detail.refresh();
    if (isStudent) submissions.refresh();
  }

  return (
    <Screen
      refreshing={detail.refreshing || submissions.refreshing}
      onRefresh={onRefresh}
    >
      {detail.error ? <InfoBanner tone="danger" text={detail.error} /> : null}
      {!open ? (
        <InfoBanner tone="warning" text={ASSIGNMENTS.statusClosed} />
      ) : null}
      <View style={styles.heading}>
        <AppText variant="title">{assignment.title}</AppText>
        <View style={styles.badges}>
          <Badge label={open ? COMMON.statusOpen : COMMON.statusClosed} status={open ? 'active' : 'archived'} />
          <Badge label={assignment.batch?.name || ASSIGNMENTS.noBatch} tone="brand" />
        </View>
      </View>

      {assignment.description ? (
        <Card>
          <AppText variant="label">{ASSIGNMENTS.instructions}</AppText>
          <AppText variant="body">{assignment.description}</AppText>
        </Card>
      ) : null}

      <Card>
        <Row label={COMMON.dueDate} value={formatDateTime(assignment.dueDate)} />
        <Row label={COMMON.batch} value={assignment.batch?.name} />
        <Row label={ASSIGNMENTS.createdBy} value={assignment.createdBy?.name} />
        <Row
          label={ASSIGNMENTS.maxSizeLabel}
          value={COMMON.fileSizeValue(
            assignment.maxFileSizeMb || DEFAULT_MAX_FILE_MB
          )}
        />
        <Row
          label={ASSIGNMENTS.resubmissionLabel}
          value={
            assignment.resubmissionPolicy === 'allowed'
              ? ASSIGNMENTS.resubmissionAllowed
              : ASSIGNMENTS.resubmissionDisabled
          }
        />
      </Card>

      {isStudent ? (
        <Card>
          <AppText variant="subtitle">{SUBMISSIONS.currentFile}</AppText>
          {mine ? (
            <>
              <Row label={COMMON.file} value={mine.fileName} />
              <Row
                label={COMMON.fileSizeLabel}
                value={formatFileSize(mine.fileSize)}
              />
              <Row label={SUBMISSIONS.submittedOn} value={formatDateTime(mine.submittedAt)} />
              <Row
                label={COMMON.status}
                value={
                  SUBMISSION_STATUSES.find((item) => item.value === mine.status)
                    ?.label || mine.status
                }
              />
              <Row label={COMMON.grade} value={mine.grade} />
              <Row label={SUBMISSIONS.feedback} value={mine.feedback} />
              <View style={styles.actions}>
                <Button title={COMMON.download} variant="secondary" onPress={onDownload} loading={busy} compact />
                {canUpload ? (
                  <Button
                    title={SUBMISSIONS.replace}
                    compact
                    onPress={() =>
                      navigation.navigate(ROUTES.submissionUpload, {
                        assignmentId: id,
                        submissionId: mine._id,
                        title: assignment.title,
                        maxFileSizeMb: assignment.maxFileSizeMb,
                      })
                    }
                  />
                ) : null}
              </View>
            </>
          ) : (
            <AppText variant="small">{SUBMISSIONS.studentEmpty}</AppText>
          )}
          {mine && !canReplace ? (
            <InfoBanner tone="warning" text={SUBMISSIONS.resubmissionBlocked} />
          ) : null}
          {!mine && canUpload ? (
            <Button
              title={SUBMISSIONS.uploadTitle}
              onPress={() =>
                navigation.navigate(ROUTES.submissionUpload, {
                  assignmentId: id,
                  title: assignment.title,
                  maxFileSizeMb: assignment.maxFileSizeMb,
                })
              }
            />
          ) : null}
        </Card>
      ) : null}

      {!isStudent ? (
        <View style={styles.actions}>
          {canEdit ? (
            <Button
              title={COMMON.edit}
              variant="secondary"
              onPress={() => navigation.navigate(ROUTES.assignmentForm, { id })}
              compact
            />
          ) : null}
          {canArchive && assignment.active !== false ? (
            <Button title={COMMON.archive} variant="danger" onPress={() => setConfirm(true)} compact />
          ) : null}
        </View>
      ) : null}

      <ConfirmDialog
        visible={confirm}
        title={ASSIGNMENTS.archiveTitle}
        body={ASSIGNMENTS.archiveBody}
        confirmLabel={COMMON.archive}
        danger
        loading={busy}
        onCancel={() => setConfirm(false)}
        onConfirm={onArchive}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.sm },
  badges: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
