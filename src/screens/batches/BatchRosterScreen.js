// Batch detail: summary card, enroll a student, and the roster list.
// Backend limits this screen to admins and the owning teacher.
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { AppText } from '../../components/ui/AppText';
import { SelectRow } from '../../components/ui/SelectRow';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FormError } from '../../components/ui/FormError';
import { ListFooter } from '../../components/lists/ListFooter';
import { BatchSummaryCard } from '../../components/lists/BatchSummaryCard';
import { RosterRow } from '../../components/lists/RosterRow';
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
import { PERMISSIONS, can } from '../../constants/permissions';
import { isStaffRole } from '../../utils/access';
import { BATCHES, COMMON } from '../../constants/strings';
import { QUERY_LIMIT } from '../../constants/options';
import { ROUTES } from '../../constants/app';
import { getErrorMessage } from '../../utils/errors';
import { getId } from '../../utils/ids';
import { layout, spacing } from '../../constants/theme';

export function BatchRosterScreen({ route, navigation }) {
  const batchId = route.params?.batchId;
  const { user } = useAuth();
  const toast = useToast();
  const canView = can(user, PERMISSIONS.BATCHES_VIEW, ['admin', 'teacher']);
  const staff = isStaffRole(user);
  const canUpdate = can(user, PERMISSIONS.BATCHES_UPDATE, ['admin', 'teacher']);
  const canDelete = can(user, PERMISSIONS.BATCHES_DELETE, ['admin', 'teacher']);
  const canEnroll = can(user, PERMISSIONS.BATCHES_ENROLL, ['admin', 'teacher']);
  const canViewStudents = can(user, PERMISSIONS.STUDENTS_VIEW, ['admin', 'teacher']);
  const [studentId, setStudentId] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const batches = useApiData(() => listBatches({ page: 1, limit: QUERY_LIMIT }), {
    enabled: canView && staff && Boolean(batchId),
  });
  const roster = usePaginatedList(
    (params) =>
      getBatchStudents(params.batchId, { page: params.page, limit: params.limit }),
    { batchId },
    { enabled: canView && staff && Boolean(batchId) }
  );
  const students = useApiData(() => listUsers({ role: 'student', limit: QUERY_LIMIT }), {
    enabled: canEnroll && staff && canViewStudents,
  });

  if (!canView || !staff) return <Screen><PermissionState /></Screen>;

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
        <BatchSummaryCard
          batch={batch}
          editable={canUpdate}
          archivable={canDelete}
          deletable={canDelete}
          onEdit={() => navigation.navigate(ROUTES.batchForm, { batch })}
          onArchive={() => setConfirm('archive')}
          onDelete={() => setConfirm('delete')}
        />
      ) : null}

      {canEnroll && canViewStudents && batch && batch.active !== false ? (
        <Card>
          <AppText variant="subtitle">{BATCHES.enrollTitle}</AppText>
          <SelectRow
            label={BATCHES.pickStudent}
            value={studentId}
            valueLabel={
              studentOptions.find((item) => item.value === studentId)?.label
            }
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
      {error ? <FormError message={error} /> : null}
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
        renderItem={({ item }) => <RosterRow student={item} />}
        ListEmptyComponent={
          roster.loading ? (
            <LoadingState />
          ) : roster.error ? (
            <ErrorState message={roster.error} onRetry={roster.retry} />
          ) : (
            <EmptyState
              title={BATCHES.noStudents}
              message={BATCHES.noStudentsHint}
              icon="people-outline"
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
  list: { padding: spacing.lg, paddingBottom: layout.listBottomSpacing },
  header: { gap: spacing.md, marginBottom: spacing.lg },
  gap: { height: spacing.sm },
});
