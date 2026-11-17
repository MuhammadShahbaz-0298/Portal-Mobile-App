// Batch list with server-side search. Tap a batch to open its roster and actions.
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { ListHeader } from '../../components/lists/ListHeader';
import { ListFooter } from '../../components/lists/ListFooter';
import { BatchCard } from '../../components/lists/BatchCard';
import { ListState } from '../../components/states/ListState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { listBatches } from '../../api/batches';
import { PERMISSIONS, can } from '../../constants/permissions';
import { isStaffRole } from '../../utils/access';
import { BATCHES, COMMON } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { layout, spacing } from '../../constants/theme';

export function BatchesScreen({ navigation }) {
  const { user } = useAuth();
  const canView = can(user, PERMISSIONS.BATCHES_VIEW, ['admin', 'teacher']);
  const canCreate = can(user, PERMISSIONS.BATCHES_CREATE, ['admin', 'teacher']);
  const staff = isStaffRole(user);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search);
  const list = usePaginatedList(listBatches, { search: debounced }, { enabled: canView });
  const refresh = list.refresh;

  useFocusEffect(
    useCallback(() => {
      if (canView) refresh();
    }, [canView, refresh])
  );

  if (!canView) return <Screen><PermissionState /></Screen>;

  const header = (
    <ListHeader
      title={BATCHES.title}
      subtitle={BATCHES.subtitle}
      action={
        canCreate ? (
          <Button
            title={COMMON.create}
            icon="add-outline"
            compact
            onPress={() => navigation.navigate(ROUTES.batchForm)}
          />
        ) : null
      }
      search={search}
      onSearchChange={setSearch}
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
          <BatchCard
            batch={item}
            onPress={
              staff
                ? () => navigation.navigate(ROUTES.batchRoster, { batchId: item._id })
                : undefined
            }
          />
        )}
        ListEmptyComponent={
          <ListState
            loading={list.loading}
            error={list.error}
            onRetry={list.retry}
            title={BATCHES.empty}
            message={BATCHES.emptyHint}
            actionLabel={canCreate ? BATCHES.newTitle : undefined}
            onAction={canCreate ? () => navigation.navigate(ROUTES.batchForm) : undefined}
            icon="people-circle-outline"
          />
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
