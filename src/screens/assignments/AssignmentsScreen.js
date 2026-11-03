// Assignment list with server-side search, optional class filter, pagination.
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { ListHeader } from '../../components/lists/ListHeader';
import { ListFooter } from '../../components/lists/ListFooter';
import { AssignmentCard } from '../../components/lists/AssignmentCard';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useApiData } from '../../hooks/useApiData';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { listAssignments } from '../../api/assignments';
import { listBatches } from '../../api/batches';
import { PERMISSIONS, can } from '../../constants/permissions';
import { ASSIGNMENTS, COMMON } from '../../constants/strings';
import { QUERY_LIMIT } from '../../constants/options';
import { ROUTES } from '../../constants/app';
import { layout, spacing } from '../../constants/theme';

export function AssignmentsScreen({ navigation }) {
  const { user } = useAuth();
  const canView = can(user, PERMISSIONS.ASSIGNMENTS_VIEW, ['admin', 'teacher', 'student']);
  const canCreate = can(user, PERMISSIONS.ASSIGNMENTS_CREATE, ['admin', 'teacher']);
  const canBatches = can(user, PERMISSIONS.BATCHES_VIEW, ['admin', 'teacher']);
  const [search, setSearch] = useState('');
  const [batchId, setBatchId] = useState('');
  const debounced = useDebouncedValue(search);
  const batches = useApiData(() => listBatches({ limit: QUERY_LIMIT }), {
    enabled: canBatches,
  });
  const list = usePaginatedList(
    listAssignments,
    { search: debounced, batchId },
    { enabled: canView }
  );
  const refresh = list.refresh;

  useFocusEffect(
    useCallback(() => {
      if (canView) refresh();
    }, [canView, refresh])
  );

  if (!canView) return <Screen><PermissionState /></Screen>;

  const batchOptions = canBatches
    ? [
        { value: '', label: COMMON.all },
        ...(batches.data?.items || []).map((batch) => ({
          value: batch._id,
          label: batch.name,
        })),
      ]
    : undefined;

  const header = (
    <ListHeader
      title={ASSIGNMENTS.title}
      subtitle={ASSIGNMENTS.subtitle}
      action={
        canCreate ? (
          <Button
            title={COMMON.create}
            icon="add"
            compact
            onPress={() => navigation.navigate(ROUTES.assignmentForm)}
          />
        ) : null
      }
      search={search}
      onSearchChange={setSearch}
      filterLabel={ASSIGNMENTS.batchFilter}
      filterValue={batchId}
      options={batchOptions}
      onFilterChange={setBatchId}
    />
  );

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <FlatList
        data={list.items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshing={list.refreshing}
        onRefresh={list.refresh}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <AssignmentCard
            assignment={item}
            onPress={() =>
              navigation.navigate(ROUTES.assignmentDetail, { id: item._id })
            }
          />
        )}
        ListEmptyComponent={
          list.loading ? (
            <LoadingState />
          ) : list.error ? (
            <ErrorState message={list.error} onRetry={list.retry} />
          ) : (
            <EmptyState
              title={ASSIGNMENTS.empty}
              message={canCreate ? ASSIGNMENTS.emptyHint : ASSIGNMENTS.studentHint}
              actionLabel={canCreate ? ASSIGNMENTS.newTitle : undefined}
              onAction={canCreate ? () => navigation.navigate(ROUTES.assignmentForm) : undefined}
              icon="document-text-outline"
            />
          )
        }
        ListFooterComponent={
          <ListFooter
            loaded={list.items.length}
            total={list.meta.total}
            loading={list.loadingMore}
            onLoadMore={list.loadMore}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  list: { padding: spacing.lg, paddingBottom: layout.listBottomSpacing },
  gap: { height: spacing.md },
});
