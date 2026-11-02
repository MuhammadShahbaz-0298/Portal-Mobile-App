// User directory with search, role filters, and account actions.
import { useCallback, useMemo, useState } from 'react';
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
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { listUsers } from '../../api/users';
import { listRoles } from '../../api/roles';
import {
  PERMISSIONS,
  ROLE_LABELS,
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
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const list = usePaginatedList(listUsers, { role }, { enabled: canView });
  const roles = useApiData(() => listRoles(), [], {
    enabled: hasPermission(user, PERMISSIONS.ROLES_MANAGE),
  });

  useFocusEffect(
    useCallback(() => {
      if (canView) list.refresh();
    }, [canView])
  );

  const roleOptions = useMemo(() => {
    const custom = (roles.data?.roles || []).map((item) => ({
      value: item.name,
      label: item.label || item.name,
    }));
    const core = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));
    const seen = new Set();
    return [{ value: '', label: COMMON.all }, ...core, ...custom].filter((item) => {
      if (seen.has(item.value)) return false;
      seen.add(item.value);
      return true;
    });
  }, [roles.data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return list.items;
    return list.items.filter((item) =>
      [item.name, item.email, ROLE_LABELS[item.role] || item.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [list.items, search]);

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
      <SelectRow
        label={USERS.roleLabel}
        value={role}
        valueLabel={roleOptions.find((item) => item.value === role)?.label}
        options={roleOptions}
        onChange={setRole}
      />
      {list.error && list.items.length ? (
        <InfoBanner tone="danger" text={list.error} />
      ) : null}
    </View>
  );

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <FlatList
        data={filtered}
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
