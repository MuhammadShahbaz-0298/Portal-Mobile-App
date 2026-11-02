// Batches list with server-side search and create/action shortcuts.
// Teachers see only their own batches (enforced by the backend).
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchBar } from '../../components/ui/SearchBar';
import { Button } from '../../components/ui/Button';
import { ListFooter } from '../../components/lists/ListFooter';
import { BatchCard } from '../../components/lists/BatchCard';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { InfoBanner } from '../../components/ui/InfoBanner';
import { useAuth } from '../../hooks/useAuth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { listBatches } from '../../api/batches';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { hasStaffBatchAccess } from '../../utils/access';
import { BATCHES } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { spacing } from '../../constants/theme';

export function BatchesScreen({ navigation }) {
  const { user } = useAuth();
  const canView = hasPermission(user, PERMISSIONS.BATCHES_VIEW);
  const canCreate = hasPermission(user, PERMISSIONS.BATCHES_CREATE);
  const canManage =
    hasPermission(user, PERMISSIONS.BATCHES_UPDATE) ||
    hasPermission(user, PERMISSIONS.BATCHES_DELETE) ||
    hasPermission(user, PERMISSIONS.BATCHES_ENROLL);
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
    <View style={styles.header}>
      <PageHeader
        title={BATCHES.title}
        subtitle={BATCHES.subtitle}
        action={
          canCreate ? (
            <Button
              title={BATCHES.newTitle}
              icon="add-outline"
              compact
              onPress={() => navigation.navigate(ROUTES.batchForm)}
            />
          ) : null
        }
      />
      <SearchBar value={search} onChangeText={setSearch} />
      {list.error && list.items.length ? (
        <InfoBanner tone="danger" text={list.error} />
      ) : null}
    </View>
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
              canManage
                ? () => navigation.navigate(ROUTES.batchRoster, { batchId: item._id })
                : undefined
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
              title={BATCHES.empty}
              message={BATCHES.emptyHint}
              actionLabel={canCreate ? BATCHES.newTitle : undefined}
              onAction={canCreate ? () => navigation.navigate(ROUTES.batchForm) : undefined}
              icon="people-circle-outline"
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
});
