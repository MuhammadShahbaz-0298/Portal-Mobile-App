// Assignment list with search, class filter, pagination, and role-aware actions.
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { SelectRow } from '../../components/ui/SelectRow';
import { ListFooter } from '../../components/lists/ListFooter';
import { AssignmentCard } from '../../components/lists/AssignmentCard';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { InfoBanner } from '../../components/ui/InfoBanner';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { listAssignments } from '../../api/assignments';
import { listBatches } from '../../api/batches';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { ASSIGNMENTS, COMMON } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { colors, spacing } from '../../constants/theme';

export function AssignmentsScreen({ navigation }) {
  const { user } = useAuth();
  const canView = hasPermission(user, PERMISSIONS.ASSIGNMENTS_VIEW);
  const canCreate = hasPermission(user, PERMISSIONS.ASSIGNMENTS_CREATE);
  const canBatches = hasPermission(user, PERMISSIONS.BATCHES_VIEW);
  const [search, setSearch] = useState('');
  const [batchId, setBatchId] = useState('');
  const debounced = useDebouncedValue(search);
  const batches = useApiData(() => listBatches({ limit: 100 }), [canBatches], {
    enabled: canBatches,
  });
  const list = usePaginatedList(
    listAssignments,
    { search: debounced, batchId },
    { enabled: canView }
  );

  if (!canView) return <Screen><PermissionState /></Screen>;

  const batchOptions = [
    { value: '', label: COMMON.allClasses },
    ...(batches.data?.items || []).map((batch) => ({
      value: batch._id,
      label: batch.name,
    })),
  ];
  const selectedBatch = batchOptions.find((option) => option.value === batchId);

  const header = (
    <View style={styles.header}>
      <PageHeader
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
      />
      <SearchBar value={search} onChangeText={setSearch} />
      {canBatches ? (
        <SelectRow
          label={ASSIGNMENTS.batchFilter}
          value={batchId}
          valueLabel={selectedBatch?.label || COMMON.allClasses}
          options={batchOptions}
          onChange={setBatchId}
        />
      ) : null}
      {list.error && list.items.length ? (
        <InfoBanner tone="danger" text={list.error} />
      ) : null}
    </View>
  );

  return (
    <Screen
      edges={['top', 'left', 'right']}
      scroll={false}
      contentStyle={styles.screen}
    >
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
            showCreator={!hasPermission(user, PERMISSIONS.ASSIGNMENTS_CREATE)}
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
              message={
                canCreate ? ASSIGNMENTS.emptyHint : ASSIGNMENTS.studentHint
              }
              actionLabel={canCreate ? ASSIGNMENTS.newTitle : undefined}
              onAction={
                canCreate
                  ? () => navigation.navigate(ROUTES.assignmentForm)
                  : undefined
              }
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
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { gap: spacing.md, marginBottom: spacing.lg },
  gap: { height: spacing.md },
  empty: { color: colors.muted },
});
