// Permission-aware bottom tabs. Hidden tabs are never registered for the role.
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AssignmentsScreen } from '../screens/assignments/AssignmentsScreen';
import { SubmissionsScreen } from '../screens/submissions/SubmissionsScreen';
import { AttendanceScreen } from '../screens/attendance/AttendanceScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { useAuth } from '../hooks/useAuth';
import { PERMISSIONS, hasPermission } from '../constants/permissions';
import { DASHBOARD, ASSIGNMENTS, SUBMISSIONS, ATTENDANCE, MORE } from '../constants/strings';
import { ROUTES } from '../constants/app';
import { colors, fontSize } from '../constants/theme';

const Tab = createBottomTabNavigator();

const icons = {
  [ROUTES.dashboard]: 'home-outline',
  [ROUTES.assignments]: 'document-text-outline',
  [ROUTES.submissions]: 'cloud-upload-outline',
  [ROUTES.attendance]: 'calendar-outline',
  [ROUTES.more]: 'ellipsis-horizontal-circle-outline',
};

export function AppTabs() {
  const { user } = useAuth();
  const can = (permission) => hasPermission(user, permission);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: fontSize.xs },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name]} size={size} color={color} />
        ),
      })}
    >
      {can(PERMISSIONS.DASHBOARD_VIEW) ? (
        <Tab.Screen
          name={ROUTES.dashboard}
          component={DashboardScreen}
          options={{ title: DASHBOARD.title }}
        />
      ) : null}
      {can(PERMISSIONS.ASSIGNMENTS_VIEW) ? (
        <Tab.Screen
          name={ROUTES.assignments}
          component={AssignmentsScreen}
          options={{ title: ASSIGNMENTS.title }}
        />
      ) : null}
      {can(PERMISSIONS.SUBMISSIONS_VIEW) ? (
        <Tab.Screen
          name={ROUTES.submissions}
          component={SubmissionsScreen}
          options={{ title: SUBMISSIONS.title }}
        />
      ) : null}
      {can(PERMISSIONS.ATTENDANCE_VIEW) ? (
        <Tab.Screen
          name={ROUTES.attendance}
          component={AttendanceScreen}
          options={{ title: ATTENDANCE.title }}
        />
      ) : null}
      <Tab.Screen
        name={ROUTES.more}
        component={MoreScreen}
        options={{ title: MORE.title }}
      />
    </Tab.Navigator>
  );
}
