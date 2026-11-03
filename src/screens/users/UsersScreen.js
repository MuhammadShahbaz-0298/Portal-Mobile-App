// User directory: server-side search, create, and per-account management.
// Teachers see only students in their own batches (enforced by the backend).
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { ListHeader } from '../../components/lists/ListHeader';
import { ListFooter } from '../../components/lists/ListFooter';
import { UserCard } from '../../components/lists/UserCard';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { listUsers } from '../../api/users';
import { PERMISSIONS, can } from '../../constants/permissions';
import { USERS, COMMON } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { layout, spacing } from '../../constants/theme';

export function UsersScreen({ navigation }) {
  const { user } = useAuth();
  const canView = can(user, PERMISSIONS.STUDENTS_VIEW, ['admin', 'teacher']);
  const canCreate = can(user, PERMISSIONS.STUDENTS_CREATE, ['admin', 'teacher']);
  const canManage = can(user, PERMISSIONS.USERS_MANAGE, ['admin']);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search);
  const list = usePaginatedList(listUsers, { search: debounced }, { enabled: canView });
  const refresh = list.refresh;

  useFocusEffect(
    useCallback(() => {
      if (canView) refresh();
    }, [canView, refresh])
  );

  if (!canView) return <Screen><PermissionState /></Screen>;

  const header = (
    <ListHeader
      title={USERS.title}
      subtitle={USERS.subtitle}
      action={
        canCreate ? (
          <Button
            title={COMMON.create}
            icon="person-add-outline"
            compact
            onPress={() => navigation.navigate(ROUTES.userCreate)}
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
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshing={list.refreshing}
        onRefresh={list.refresh}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onPress={
              canManage
                ? () => navigation.navigate(ROUTES.userEdit, { account: item })
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
              title={USERS.empty}
              message={USERS.emptyHint}
              actionLabel={canCreate ? USERS.newTitle : undefined}
              onAction={canCreate ? () => navigation.navigate(ROUTES.userCreate) : undefined}
              icon="people-outline"
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
