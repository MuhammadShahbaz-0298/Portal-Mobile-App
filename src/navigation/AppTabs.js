// Bottom tabs built from the shared NAV_ITEMS config + a More overflow tab.
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AssignmentsScreen } from '../screens/assignments/AssignmentsScreen';
import { SubmissionsScreen } from '../screens/submissions/SubmissionsScreen';
import { AttendanceScreen } from '../screens/attendance/AttendanceScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { useAuth } from '../hooks/useAuth';
import { primaryTabItems, ROUTES } from '../constants/app';
import { MORE } from '../constants/strings';
import { colors, fontSize } from '../constants/theme';

const Tab = createBottomTabNavigator();
const SCREENS = {
  [ROUTES.dashboard]: DashboardScreen,
  [ROUTES.assignments]: AssignmentsScreen,
  [ROUTES.submissions]: SubmissionsScreen,
  [ROUTES.attendance]: AttendanceScreen,
};

export function AppTabs() {
  const { user } = useAuth();
  const tabs = primaryTabItems(user);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: fontSize.xs },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
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
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={item.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
      <Tab.Screen
        name={ROUTES.more}
        component={MoreScreen}
        options={{
          title: MORE.title,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
