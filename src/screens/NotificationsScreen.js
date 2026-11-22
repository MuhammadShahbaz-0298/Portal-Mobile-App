import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../components/ui/Screen";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { AppText } from "../components/ui/AppText";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ListState } from "../components/states/ListState";
import { PermissionState } from "../components/states/PermissionState";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../context/NotificationsContext";
import { PERMISSIONS, ROLE_SETS, can } from "../constants/permissions";
import { COMMON, NOTIFICATIONS } from "../constants/strings";
import { ROUTES } from "../constants/app";
import { formatDateTime } from "../utils/dates";
import { isStudentRole } from "../utils/access";
import { layout, spacing } from "../constants/theme";

function notificationDestination(item, student) {
  const link = String(item.link || "");
  if (link.startsWith("/assignments/")) {
    return {
      name: ROUTES.assignmentDetail,
      params: { id: link.split("/")[2] },
    };
  }
  if (link.startsWith("/quizzes/")) {
    return student
      ? { name: ROUTES.quizTake, params: { id: link.split("/")[2] } }
      : { name: ROUTES.quizList };
  }
  if (link.startsWith("/announcements")) return { name: ROUTES.announcements };
  if (link.startsWith("/events")) return { name: ROUTES.events };
  if (link.startsWith("/auth/change-password")) return { name: ROUTES.profile };
  if (link.startsWith("/submissions/")) {
    return { name: student ? ROUTES.submissions : ROUTES.grading };
  }
  return null;
}

export function NotificationsScreen({ navigation }) {
  const { user } = useAuth();
  const notifications = useNotifications();
  const { refresh } = notifications;
  const canView = can(user, PERMISSIONS.NOTIFICATIONS_VIEW, ROLE_SETS.LEARNING);
  const student = isStudentRole(user);
  const [confirmClear, setConfirmClear] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (canView) refresh();
    }, [canView, refresh]),
  );

  if (!canView)
    return (
      <Screen>
        <PermissionState />
      </Screen>
    );

  async function openNotification(item) {
    const id = item._id || item.id;
    if (!item.read && !(await notifications.markRead(id))) return;
    const destination = notificationDestination(item, student);
    if (destination) navigation.navigate(destination.name, destination.params);
  }

  async function onClearAll() {
    await notifications.clearAll();
    setConfirmClear(false);
  }

  const header = (
    <View style={styles.header}>
      <PageHeader
        title={NOTIFICATIONS.title}
        subtitle={NOTIFICATIONS.subtitle}
      />
      {notifications.error ? (
        <AppText variant="error">{notifications.error}</AppText>
      ) : null}
      <View style={styles.actions}>
        {notifications.unread ? (
          <Button
            title={NOTIFICATIONS.markAllRead}
            variant="secondary"
            compact
            onPress={notifications.markAllRead}
          />
        ) : null}
        {notifications.items.length ? (
          <Button
            title={NOTIFICATIONS.clearAll}
            variant="secondary"
            compact
            onPress={() => setConfirmClear(true)}
          />
        ) : null}
      </View>
    </View>
  );

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <FlatList
        data={notifications.items}
        keyExtractor={(item) => String(item._id || item.id)}
        contentContainerStyle={styles.list}
        refreshing={notifications.refreshing}
        onRefresh={notifications.refresh}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <Card
            onPress={() => openNotification(item)}
            accessibilityLabel={item.message}
            style={item.read ? styles.readCard : undefined}
          >
            <View style={styles.row}>
              <AppText variant="subtitle" style={styles.type}>
                {String(item.type || NOTIFICATIONS.newNotification).replace(
                  /[._]/g,
                  " ",
                )}
              </AppText>
              {!item.read ? (
                <Badge label={NOTIFICATIONS.newNotification} tone="brand" />
              ) : null}
            </View>
            <AppText variant="body">{item.message}</AppText>
            {item.createdAt ? (
              <AppText variant="caption">
                {formatDateTime(item.createdAt)}
              </AppText>
            ) : null}
          </Card>
        )}
        ListEmptyComponent={
          <ListState
            loading={notifications.loading}
            error={notifications.error}
            onRetry={notifications.refresh}
            title={NOTIFICATIONS.empty}
            message={NOTIFICATIONS.emptyHint}
            icon="notifications-outline"
          />
        }
      />
      <ConfirmDialog
        visible={confirmClear}
        title={NOTIFICATIONS.clearTitle}
        body={NOTIFICATIONS.clearBody}
        confirmLabel={NOTIFICATIONS.clearAll}
        cancelLabel={COMMON.cancel}
        loading={notifications.clearing}
        danger
        onCancel={() => setConfirmClear(false)}
        onConfirm={onClearAll}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  list: { padding: spacing.lg, paddingBottom: layout.listBottomSpacing },
  header: { gap: spacing.sm, marginBottom: spacing.lg },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  gap: { height: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  type: { flex: 1, textTransform: "capitalize" },
  readCard: { opacity: 0.8 },
});
