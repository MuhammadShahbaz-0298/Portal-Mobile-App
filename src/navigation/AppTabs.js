// Bottom tabs built from the shared NAV_ITEMS config + a More overflow tab.
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DashboardScreen } from "../screens/DashboardScreen";
import { AssignmentsScreen } from "../screens/assignments/AssignmentsScreen";
import { SubmissionsScreen } from "../screens/submissions/SubmissionsScreen";
import { AttendanceScreen } from "../screens/attendance/AttendanceScreen";
import { QuizListScreen } from "../screens/quizzes/QuizListScreen";
import { ChatScreen } from "../screens/chat/ChatScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { MoreScreen } from "../screens/MoreScreen";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../context/NotificationsContext";
import { primaryTabItems, ROUTES } from "../constants/app";
import { MORE } from "../constants/strings";
import { radius, spacing } from "../constants/theme";
import { useThemeColors } from "../hooks/useThemeColors";

const Tab = createBottomTabNavigator();
const SCREENS = {
  [ROUTES.dashboard]: DashboardScreen,
  [ROUTES.assignments]: AssignmentsScreen,
  [ROUTES.submissions]: SubmissionsScreen,
  [ROUTES.attendance]: AttendanceScreen,
  [ROUTES.quizList]: QuizListScreen,
  [ROUTES.chat]: ChatScreen,
  [ROUTES.notifications]: NotificationsScreen,
};
const TAB_LABELS = {
  [ROUTES.dashboard]: "Home",
  [ROUTES.assignments]: "Tasks",
  [ROUTES.submissions]: "Submit",
  [ROUTES.attendance]: "Attend",
  [ROUTES.quizList]: "Quizzes",
  [ROUTES.chat]: "AI Chat",
  [ROUTES.notifications]: "Alerts",
  [ROUTES.more]: "More",
};

export function AppTabs() {
  const { user } = useAuth();
  const { unread } = useNotifications();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const tabs = primaryTabItems(user);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // Tab screens have no header, so keep their content clear of the status bar.
        sceneStyle: {
          paddingTop: insets.top + spacing.md,
          backgroundColor: colors.canvas,
        },
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarActiveBackgroundColor: colors.brandSoft,
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          minHeight: 62 + insets.bottom,
          paddingTop: spacing.xs,
          paddingBottom: Math.max(insets.bottom, spacing.xs),
        },
      }}
    >
      {tabs.map((item) => (
        <Tab.Screen
          key={item.name}
          name={item.name}
          component={SCREENS[item.name]}
          options={{
            title: item.title,
            tabBarLabel: TAB_LABELS[item.name] || item.title,
            tabBarAccessibilityLabel: item.title,
            tabBarBadge:
              item.name === ROUTES.notifications && unread
                ? unread > 99
                  ? "99+"
                  : unread
                : undefined,
            tabBarIcon: ({ color }) => (
              <View style={styles.iconFrame}>
                <Ionicons name={item.icon} size={23} color={color} />
              </View>
            ),
            tabBarBadgeStyle: styles.badge,
          }}
        />
      ))}
      <Tab.Screen
        name={ROUTES.more}
        component={MoreScreen}
        options={{
          title: MORE.title,
          tabBarLabel: TAB_LABELS[ROUTES.more],
          tabBarAccessibilityLabel: MORE.title,
          tabBarIcon: ({ color }) => (
            <View style={styles.iconFrame}>
              <Ionicons
                name="ellipsis-horizontal-circle-outline"
                size={23}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarItem: {
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xs,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  iconFrame: {
    width: 40,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  tabLabel: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 1,
  },
  badge: {
    fontSize: 9,
    lineHeight: 13,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 3,
    marginTop: 1,
  },
});
