// Role catalogue: search by name, label, or permission. Admins manage custom roles here.
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { ListHeader } from '../../components/lists/ListHeader';
import { RoleCard } from '../../components/lists/RoleCard';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { listRoles } from '../../api/roles';
import {
  PERMISSIONS,
  PERMISSION_LABELS,
  ROLE_SETS,
  can,
} from '../../constants/permissions';
import { ROLES, COMMON } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { layout, spacing } from '../../constants/theme';

export function RolesScreen({ navigation }) {
  const { user } = useAuth();
  const canManage = can(user, PERMISSIONS.ROLES_MANAGE, ROLE_SETS.ADMIN);
  const [search, setSearch] = useState('');
  const roles = useApiData(() => listRoles(), { enabled: canManage });
  const refresh = roles.refresh;

  useFocusEffect(
    useCallback(() => {
      if (canManage) refresh();
    }, [canManage, refresh])
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const items = roles.data?.roles || [];
    if (!query) return items;
    return items.filter((item) => {
      const permissionText = (item.permissions || [])
        .map((permission) => PERMISSION_LABELS[permission] || permission)
        .join(' ');
      return [item.name, item.label, permissionText]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [roles.data, search]);

  if (!canManage) return <Screen><PermissionState /></Screen>;

  const header = (
    <ListHeader
      title={ROLES.title}
      subtitle={ROLES.subtitle}
      action={
        <Button
          title={COMMON.create}
          icon="add-outline"
          compact
          onPress={() => navigation.navigate(ROUTES.roleForm)}
        />
      }
      search={search}
      onSearchChange={setSearch}
    />
  );

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={roles.refreshing}
        onRefresh={roles.refresh}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <RoleCard
            role={item}
            onPress={() => navigation.navigate(ROUTES.roleForm, { role: item })}
          />
        )}
        ListEmptyComponent={
          roles.loading ? (
            <LoadingState />
          ) : roles.error ? (
            <ErrorState message={roles.error} onRetry={roles.retry} />
          ) : (
            <EmptyState
              title={ROLES.empty}
              message={ROLES.emptyHint}
              actionLabel={ROLES.newTitle}
              onAction={() => navigation.navigate(ROUTES.roleForm)}
              icon="shield-outline"
            />
          )
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
