// Role catalogue with permission counts and custom role creation.
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchBar } from '../../components/ui/SearchBar';
import { Button } from '../../components/ui/Button';
import { RoleCard } from '../../components/lists/RoleCard';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { listRoles } from '../../api/roles';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { ROLES } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { spacing } from '../../constants/theme';

export function RolesScreen({ navigation }) {
  const { user } = useAuth();
  const canManage = hasPermission(user, PERMISSIONS.ROLES_MANAGE);
  const [search, setSearch] = useState('');
  const roles = useApiData(() => listRoles(), [], { enabled: canManage });

  useFocusEffect(
    useCallback(() => {
      if (canManage) roles.refresh();
    }, [canManage])
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const items = roles.data?.roles || [];
    if (!query) return items;
    return items.filter((item) =>
      [item.name, item.label]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [roles.data, search]);

  if (!canManage) return <Screen><PermissionState /></Screen>;

  const header = (
    <View style={styles.header}>
      <PageHeader
        title={ROLES.title}
        subtitle={ROLES.subtitle}
        action={
          <Button
            title={ROLES.newTitle}
            icon="add-outline"
            compact
            onPress={() => navigation.navigate(ROUTES.roleForm)}
          />
        }
      />
      <SearchBar value={search} onChangeText={setSearch} />
    </View>
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
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { gap: spacing.md, marginBottom: spacing.lg },
  gap: { height: spacing.md },
});
