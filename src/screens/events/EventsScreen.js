// Events: upcoming dates, an add action for managers, and the calendar feed export.
import { useCallback, useState } from 'react';
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
import { useToast } from '../../context/ToastContext';
import { listEvents } from '../../api/events';
import { downloadCalendar } from '../../services/download';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { EVENTS } from '../../constants/strings';
import { ROUTES } from '../../constants/app';
import { formatDate } from '../../utils/dates';
import { getBatchName } from '../../utils/ids';
import { getErrorMessage } from '../../utils/errors';
import { layout, spacing } from '../../constants/theme';

export function EventsScreen({ navigation }) {
  const { user } = useAuth();
  const toast = useToast();
  const canView = can(user, PERMISSIONS.EVENTS_VIEW, ROLE_SETS.LEARNING);
  const canManage = can(user, PERMISSIONS.EVENTS_MANAGE, ROLE_SETS.STAFF);
  const canCalendar = can(user, PERMISSIONS.CALENDAR_VIEW, ROLE_SETS.LEARNING);
  const [downloading, setDownloading] = useState(false);
  const list = usePaginatedList(listEvents, {}, { enabled: canView });
  const refresh = list.refresh;

  useFocusEffect(
    useCallback(() => {
      if (canView) refresh();
    }, [canView, refresh])
  );

  if (!canView) return <Screen><PermissionState /></Screen>;

  async function onDownloadCalendar() {
    setDownloading(true);
    try {
      await downloadCalendar(EVENTS.downloadTitle);
    } catch (error) {
      toast(getErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  }

  function eventDates(event) {
    if (!event.endDate) return formatDate(event.date);
    return `${formatDate(event.date)} – ${formatDate(event.endDate)}`;
  }

  const header = (
    <PageHeader
      title={EVENTS.title}
      subtitle={EVENTS.subtitle}
      action={
        <View style={styles.actions}>
          {canCalendar ? (
            <Button
              title={EVENTS.calendar}
              variant="secondary"
              compact
              loading={downloading}
              onPress={onDownloadCalendar}
            />
          ) : null}
          {canManage ? (
            <Button
              title={EVENTS.add}
              icon="add-outline"
              compact
              onPress={() => navigation.navigate(ROUTES.eventForm)}
            />
          ) : null}
        </View>
      }
    />
  );

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <FlatList
        data={list.items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={list.refreshing}
        onRefresh={list.refresh}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <Card>
            <AppText variant="subtitle">{item.title}</AppText>
            <AppText variant="small">{eventDates(item)}</AppText>
            {item.description ? <AppText variant="body">{item.description}</AppText> : null}
            <Badge
              label={item.batch ? getBatchName(item.batch) : EVENTS.schoolWide}
              tone="brand"
            />
          </Card>
        )}
        ListEmptyComponent={
          <ListState
            loading={list.loading}
            error={list.error}
            onRetry={list.retry}
            title={EVENTS.empty}
            message={EVENTS.emptyHint}
            icon="calendar-clear-outline"
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
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
