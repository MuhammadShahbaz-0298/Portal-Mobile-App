// User directory with server-side search, optional role filter, and account actions.
// Teachers see only students in their own batches (enforced by the backend).
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchBar } from '../../components/ui/SearchBar';
import { SelectRow } from '../../components/ui/SelectRow';
import { Button } from '../../components/ui/Button';
import { ListFooter } from '../../components/lists/ListFooter';
import { UserCard } from '../../components/lists/UserCard';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { InfoBanner } from '../../components/ui/InfoBanner';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { useRoleOptions } from '../../hooks/useRoleOptions';
import { listUsers } from '../../api/users';
import { listRoles } from '../../api/roles';
import {
  PERMISSIONS,
  hasPermission,
} from '../../constants/permissions';
import { USERS, COMMON } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { spacing } from '../../constants/theme';

export function UsersScreen({ navigation }) {
  const { user } = useAuth();
  const canView = hasPermission(user, PERMISSIONS.STUDENTS_VIEW);
  const canCreate = hasPermission(user, PERMISSIONS.STUDENTS_CREATE);
  const canManage = hasPermission(user, PERMISSIONS.USERS_MANAGE);
  const canFilterRoles = hasPermission(user, PERMISSIONS.ROLES_MANAGE);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const debounced = useDebouncedValue(search);
  const list = usePaginatedList(
    listUsers,
    { role, search: debounced },
    { enabled: canView }
  );
  const roles = useApiData(() => listRoles(), { enabled: canFilterRoles });
  const roleOptions = useRoleOptions(roles.data?.roles || [], true);

  const refresh = list.refresh;
  useFocusEffect(
    useCallback(() => {
      if (canView) refresh();
      // Refresh only when the screen gains focus or the permission changes.
    }, [canView, refresh])
  );

  if (!canView) return <Screen><PermissionState /></Screen>;

  const header = (
    <View style={styles.header}>
      <PageHeader
        title={USERS.title}
        subtitle={USERS.subtitle}
        action={
          canCreate ? (
            <Button
              title={USERS.newTitle}
              icon="person-add-outline"
              compact
              onPress={() => navigation.navigate(ROUTES.userCreate)}
            />
          ) : null
        }
      />
      <SearchBar value={search} onChangeText={setSearch} />
      {canFilterRoles ? (
        <SelectRow
          label={USERS.roleLabel}
          value={role}
          valueLabel={roleOptions.find((item) => item.value === role)?.label}
          options={roleOptions}
          onChange={setRole}
        />
      ) : null}
      {list.error && list.items.length ? (
        <InfoBanner tone="danger" text={list.error} />
      ) : null}
    </View>
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
              onAction={
                canCreate ? () => navigation.navigate(ROUTES.userCreate) : undefined
              }
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
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { gap: spacing.md, marginBottom: spacing.lg },
  gap: { height: spacing.md },
});
