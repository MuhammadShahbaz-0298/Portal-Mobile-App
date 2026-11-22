// Assignment detail: the brief, the student's single submission, and staff actions.
// A 410 response renders the closed state (no upload controls); a 404 shows not found.
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import { EmptyState } from '../../components/states/EmptyState';
import { PermissionState } from '../../components/states/PermissionState';
import { AssignmentInfoCard } from '../../components/lists/AssignmentInfoCard';
import { StudentSubmissionCard } from '../../components/lists/StudentSubmissionCard';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useToast } from '../../context/ToastContext';
import { archiveAssignment, getAssignment } from '../../api/assignments';
import { listSubmissions } from '../../api/submissions';
import { downloadSubmission } from '../../services/download';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import {
  ASSIGNMENTS,
  COMMON,
  FILES,
  RESOURCES,
} from '../../constants/strings';
import { QUERY_LIMIT } from '../../constants/options';
import { ROUTES } from '../../constants/app';
import { isPast } from '../../utils/dates';
import { getErrorMessage } from '../../utils/errors';
import { getId, getBatchName } from '../../utils/ids';
import { isStudentRole } from '../../utils/access';
import { spacing } from '../../constants/theme';

export function AssignmentDetailScreen({ route, navigation }) {
  const id = route.params?.id;
  const { user } = useAuth();
  const toast = useToast();
  const canView = can(user, PERMISSIONS.ASSIGNMENTS_VIEW, ROLE_SETS.LEARNING);
  const canEdit = can(user, PERMISSIONS.ASSIGNMENTS_UPDATE, ROLE_SETS.STAFF);
  const canArchive = can(user, PERMISSIONS.ASSIGNMENTS_DELETE, ROLE_SETS.STAFF);
  const canSubmissions = can(user, PERMISSIONS.SUBMISSIONS_VIEW, ROLE_SETS.LEARNING);
  const canResources = can(
    user,
    PERMISSIONS.ASSIGNMENTS_RESOURCES_VIEW,
    ROLE_SETS.LEARNING
  );
  const student = isStudentRole(user);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const detail = useApiData(() => getAssignment(id), { enabled: canView, reloadKey: id });
  const submissions = useApiData(
    () => listSubmissions({ assignmentId: id, limit: QUERY_LIMIT }),
    { enabled: canSubmissions && student, reloadKey: id }
  );

  const detailRefresh = detail.refresh;
  const submissionsRefresh = submissions.refresh;
  useFocusEffect(
    useCallback(() => {
      if (canView) detailRefresh();
      if (canSubmissions && student) submissionsRefresh();
      // Refresh only when the screen gains focus.
    }, [canView, canSubmissions, student, detailRefresh, submissionsRefresh])
  );

  if (!canView) return <Screen><PermissionState /></Screen>;
  if (detail.loading) return <Screen><LoadingState /></Screen>;

  if (detail.error?.status === 410) {
    return (
      <Screen>
        <Card>
          <AppText variant="subtitle">{ASSIGNMENTS.closedStatus}</AppText>
        </Card>
      </Screen>
    );
  }
  if (detail.error?.status === 404) {
    return (
      <Screen>
        <EmptyState
          title={ASSIGNMENTS.notFound}
          message={ASSIGNMENTS.notFoundHint}
          icon="document-text-outline"
        />
      </Screen>
    );
  }
  if (detail.error && !detail.data) {
    return <Screen><ErrorState message={detail.error} onRetry={detail.retry} /></Screen>;
  }

  const assignment = detail.data;
  if (!assignment) {
    return <Screen><EmptyState title={COMMON.noResults} icon="document-text-outline" /></Screen>;
  }

  const mine = (submissions.data?.items || []).find(
    (item) => getId(item.student) === getId(user)
  );
  const open = assignment.active !== false && !isPast(assignment.dueDate);
  const canReplace = mine && assignment.resubmissionPolicy === 'allowed';
  const canUpload = student && canSubmissions && open && (!mine || canReplace);

  async function onArchive() {
    setBusy(true);
    try {
      await archiveAssignment(id);
      toast(ASSIGNMENTS.archived);
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

  function openUpload() {
    navigation.navigate(ROUTES.submissionUpload, {
      assignmentId: id,
      title: assignment.title,
      maxFileSizeMb: assignment.maxFileSizeMb,
    });
  }

  return (
    <Screen
      refreshing={detail.refreshing || submissions.refreshing}
      onRefresh={() => {
        detailRefresh();
        if (student) submissionsRefresh();
      }}
    >
      <View style={styles.heading}>
        <AppText variant="title">{assignment.title}</AppText>
        <View style={styles.badges}>
          <Badge
            label={open ? COMMON.statusOpen : COMMON.statusClosed}
            status={open ? 'active' : 'archived'}
          />
          <Badge label={getBatchName(assignment.batch)} tone="brand" />
        </View>
      </View>

      {assignment.description ? (
        <Card>
          <AppText variant="label">{ASSIGNMENTS.instructions}</AppText>
          <AppText variant="body">{assignment.description}</AppText>
        </Card>
      ) : null}

      <AssignmentInfoCard assignment={assignment} />

      {canResources ? (
        <Button
          title={RESOURCES.title}
          variant="secondary"
          compact
          onPress={() =>
            navigation.navigate(ROUTES.assignmentResources, {
              assignmentId: id,
              title: assignment.title,
            })
          }
        />
      ) : null}

      {student ? (
        <StudentSubmissionCard
          mine={mine}
          open={open}
          canUpload={canUpload}
          busy={busy}
          onUpload={openUpload}
          onReplace={openUpload}
          onDownload={onDownload}
          onDetails={
            mine && canSubmissions
              ? () => navigation.navigate(ROUTES.submissionDetail, { submission: mine })
              : undefined
          }
        />
      ) : (
        <View style={styles.actions}>
          {canEdit ? (
            <Button
              title={COMMON.edit}
              variant="secondary"
              compact
              onPress={() => navigation.navigate(ROUTES.assignmentForm, { id })}
            />
          ) : null}
          {canArchive && assignment.active !== false ? (
            <Button
              title={COMMON.archive}
              variant="danger"
              compact
              onPress={() => setConfirm(true)}
            />
          ) : null}
        </View>
      )}

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
