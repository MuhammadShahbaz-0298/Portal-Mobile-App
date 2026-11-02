// Batch details, roster, enrollment, and archive/delete actions.
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Row } from '../../components/ui/Row';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SelectRow } from '../../components/ui/SelectRow';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { InfoBanner } from '../../components/ui/InfoBanner';
import { ListFooter } from '../../components/lists/ListFooter';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { useToast } from '../../context/ToastContext';
import {
  archiveBatch,
  deleteBatch,
  enrollStudent,
  getBatchStudents,
  listBatches,
} from '../../api/batches';
import { listUsers } from '../../api/users';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { BATCHES, COMMON } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { getErrorMessage } from '../../utils/errors';
import { getId } from '../../utils/ids';
import { spacing } from '../../constants/theme';

export function BatchRosterScreen({ route, navigation }) {
  const batchId = route.params?.batchId;
  const { user } = useAuth();
  const toast = useToast();
  const canView = hasPermission(user, PERMISSIONS.BATCHES_VIEW);
  const canUpdate = hasPermission(user, PERMISSIONS.BATCHES_UPDATE);
  const canDelete = hasPermission(user, PERMISSIONS.BATCHES_DELETE);
  const canEnroll = hasPermission(user, PERMISSIONS.BATCHES_ENROLL);
  const canRoster =
    canView && (user?.role === 'admin' || user?.role === 'teacher');
  const [studentId, setStudentId] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const batches = useApiData(() => listBatches({ limit: 100 }), [batchId], {
    enabled: canRoster && Boolean(batchId),
  });
  const roster = usePaginatedList(
    (params) =>
      getBatchStudents(params.batchId, { page: params.page, limit: params.limit }),
    { batchId },
    { enabled: canRoster && Boolean(batchId) }
  );
  const students = useApiData(() => listUsers({ role: 'student', limit: 100 }), [], {
    enabled: canEnroll && canRoster,
  });

  if (!canRoster) {
    return <Screen><PermissionState /></Screen>;
  }

  const batch = (batches.data?.items || []).find((item) => item._id === batchId);
  const enrolledIds = new Set(roster.items.map((item) => getId(item)));
  const studentOptions = (students.data?.items || [])
    .filter((item) => !enrolledIds.has(getId(item)))
    .map((item) => ({ value: item._id, label: `${item.name} (${item.email})` }));

  async function onEnroll() {
    if (!studentId) return setError(BATCHES.pickStudent);
    setBusy(true);
    setError('');
    try {
      await enrollStudent(batchId, studentId);
      setStudentId('');
      toast(BATCHES.enrolled);
      roster.refresh();
      batches.refresh();
    } catch (enrollError) {
      setError(getErrorMessage(enrollError));
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm() {
    setBusy(true);
    setError('');
    try {
      if (confirm === 'archive') {
        await archiveBatch(batchId);
        toast(BATCHES.archivedSuccess);
      } else {
        await deleteBatch(batchId);
        toast(BATCHES.deleted);
      }
      setConfirm('');
      navigation.goBack();
    } catch (actionError) {
      setError(getErrorMessage(actionError));
      setConfirm('');
    } finally {
      setBusy(false);
    }
  }

  const header = (
    <View style={styles.header}>
      {batches.loading && !batch ? <LoadingState /> : null}
      {batches.error ? (
        <ErrorState message={batches.error} onRetry={batches.retry} />
      ) : null}
      {!batches.loading && !batches.error && !batch ? (
        <ErrorState message={BATCHES.notFound} onRetry={batches.retry} />
      ) : null}
      {batch ? (
        <Card>
          <View style={styles.title}>
            <AppText variant="title">{batch.name}</AppText>
            <Badge
              label={batch.active === false ? BATCHES.archived : BATCHES.active}
              status={batch.active === false ? 'archived' : 'active'}
            />
          </View>
          <Row label={COMMON.teacher} value={batch.teacher?.name} />
          <Row label={COMMON.email} value={batch.teacher?.email} />
          <Row label={BATCHES.studentCount} value={batch.studentCount ?? 0} />
          <View style={styles.actions}>
            {canUpdate ? (
              <Button
                title={COMMON.edit}
                variant="secondary"
                compact
                onPress={() => navigation.navigate(ROUTES.batchForm, { batch })}
                style={styles.action}
              />
            ) : null}
            {canDelete && batch.active !== false ? (
              <Button
                title={COMMON.archive}
                variant="secondary"
                compact
                onPress={() => setConfirm('archive')}
                style={styles.action}
              />
            ) : null}
            {canDelete ? (
              <Button
                title={COMMON.delete}
                variant="danger"
                compact
                onPress={() => setConfirm('delete')}
                style={styles.action}
              />
            ) : null}
          </View>
        </Card>
      ) : null}

      {canEnroll && batch && batch.active !== false ? (
        <Card>
          <AppText variant="subtitle">{BATCHES.enrollTitle}</AppText>
          <SelectRow
            label={BATCHES.pickStudent}
            value={studentId}
            valueLabel={studentOptions.find((item) => item.value === studentId)?.label}
            options={studentOptions}
            onChange={setStudentId}
          />
          <Button
            title={busy ? COMMON.saving : BATCHES.enroll}
            onPress={onEnroll}
            loading={busy}
            disabled={!studentOptions.length}
          />
        </Card>
      ) : null}

      <InfoBanner tone="info" text={BATCHES.noRemoveHint} />
      {error ? <InfoBanner tone="danger" text={error} /> : null}
      <AppText variant="subtitle">{BATCHES.rosterTitle}</AppText>
    </View>
  );

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <FlatList
        data={roster.items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={roster.refreshing}
        onRefresh={roster.refresh}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.student}>
              <Avatar name={item.name} />
              <View style={styles.studentText}>
                <AppText variant="body">{item.name}</AppText>
                <AppText variant="caption">{item.email}</AppText>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          roster.loading ? (
            <LoadingState />
          ) : roster.error ? (
            <ErrorState message={roster.error} onRetry={roster.retry} />
          ) : (
            <EmptyState
              title={BATCHES.noStudents}
              message={BATCHES.noStudentsHint}
              icon="person-add-outline"
            />
          )
        }
        ListFooterComponent={
          <ListFooter
            loaded={roster.items.length}
            total={roster.meta.total}
            loading={roster.loadingMore}
            onLoadMore={roster.loadMore}
          />
        }
      />
      <ConfirmDialog
        visible={confirm === 'archive'}
        title={BATCHES.archiveTitle}
        body={BATCHES.archiveBody}
        confirmLabel={COMMON.archive}
        loading={busy}
        onCancel={() => setConfirm('')}
        onConfirm={onConfirm}
      />
      <ConfirmDialog
        visible={confirm === 'delete'}
        title={BATCHES.deleteTitle}
        body={BATCHES.deleteBody}
        confirmLabel={COMMON.delete}
        danger
        loading={busy}
        onCancel={() => setConfirm('')}
        onConfirm={onConfirm}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { gap: spacing.md, marginBottom: spacing.lg },
  title: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: { flexGrow: 1 },
  gap: { height: spacing.sm },
  student: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  studentText: { flex: 1, gap: 2 },
});
