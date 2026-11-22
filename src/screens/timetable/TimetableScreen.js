// Timetable: weekly entries visible to the user's batch. Managers can add entries.
import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { AppText } from '../../components/ui/AppText';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { ListFooter } from '../../components/lists/ListFooter';
import { ListState } from '../../components/states/ListState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { listTimetable } from '../../api/timetable';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { TIMETABLE } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { getBatchName } from '../../utils/ids';
import { formatTimeInput } from '../../utils/dates';
import { layout, spacing } from '../../constants/theme';

export function TimetableScreen({ navigation }) {
  const { user } = useAuth();
  const canView = can(user, PERMISSIONS.TIMETABLE_VIEW, ROLE_SETS.LEARNING);
  const canManage = can(user, PERMISSIONS.TIMETABLE_MANAGE, ROLE_SETS.STAFF);
  const list = usePaginatedList(listTimetable, {}, { enabled: canView });
  const refresh = list.refresh;

  useFocusEffect(
    useCallback(() => {
      if (canView) refresh();
    }, [canView, refresh])
  );

  if (!canView) return <Screen><PermissionState /></Screen>;

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <FlatList
        data={list.items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={list.refreshing}
        onRefresh={list.refresh}
        ListHeaderComponent={
          <PageHeader
            title={TIMETABLE.title}
            subtitle={TIMETABLE.subtitle}
            action={
              canManage ? (
                <Button
                  title={TIMETABLE.add}
                  icon="add-outline"
                  compact
                  onPress={() => navigation.navigate(ROUTES.timetableForm)}
                />
              ) : null
            }
          />
        }
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <Card>
            <AppText variant="subtitle">{item.subject}</AppText>
            <AppText variant="body">
              {TIMETABLE.days[item.dayOfWeek] || item.dayOfWeek}
            </AppText>
            <AppText variant="caption">
              {formatTimeInput(item.startTime)} – {formatTimeInput(item.endTime)}
            </AppText>
            <Badge label={getBatchName(item.batch)} tone="brand" />
          </Card>
        )}
        ListEmptyComponent={
          <ListState
            loading={list.loading}
            error={list.error}
            onRetry={list.retry}
            title={TIMETABLE.empty}
            message={TIMETABLE.emptyHint}
            icon="grid-outline"
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
