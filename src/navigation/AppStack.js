// Signed-in stack: tabs plus every detail/form/management screen.
// Extracted from RootNavigator so both files stay under the limit.
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppTabs } from './AppTabs';
import { AssignmentDetailScreen } from '../screens/assignments/AssignmentDetailScreen';
import { AssignmentFormScreen } from '../screens/assignments/AssignmentFormScreen';
import { SubmissionUploadScreen } from '../screens/submissions/SubmissionUploadScreen';
import { GradingScreen } from '../screens/grading/GradingScreen';
import { GradeFormScreen } from '../screens/grading/GradeFormScreen';
import { BatchesScreen } from '../screens/batches/BatchesScreen';
import { BatchFormScreen } from '../screens/batches/BatchFormScreen';
import { BatchRosterScreen } from '../screens/batches/BatchRosterScreen';
import { UsersScreen } from '../screens/users/UsersScreen';
import { UserCreateScreen } from '../screens/users/UserCreateScreen';
import { UserEditScreen } from '../screens/users/UserEditScreen';
import { RolesScreen } from '../screens/roles/RolesScreen';
import { RoleFormScreen } from '../screens/roles/RoleFormScreen';
import { AttendanceMarkScreen } from '../screens/attendance/AttendanceMarkScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ROUTES } from '../constants/app';
import {
  ASSIGNMENTS,
  SUBMISSIONS,
  GRADING,
  BATCHES,
  USERS,
  ROLES,
  ATTENDANCE,
  PROFILE,
} from '../constants/strings';
import { colors } from '../constants/theme';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.brand,
    background: colors.canvas,
    card: colors.surface,
    text: colors.ink,
    border: colors.line,
    notification: colors.danger,
  },
};

export function AppStack() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name={ROUTES.tabs} component={AppTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name={ROUTES.assignmentDetail}
          component={AssignmentDetailScreen}
          options={{ title: ASSIGNMENTS.detailTitle }}
        />
        <Stack.Screen
          name={ROUTES.assignmentForm}
          component={AssignmentFormScreen}
          options={({ route }) => ({
            title: route.params?.id ? ASSIGNMENTS.editTitle : ASSIGNMENTS.newTitle,
          })}
        />
        <Stack.Screen
          name={ROUTES.submissionUpload}
          component={SubmissionUploadScreen}
          options={{ title: SUBMISSIONS.uploadTitle }}
        />
        <Stack.Screen name={ROUTES.grading} component={GradingScreen} options={{ title: GRADING.title }} />
        <Stack.Screen name={ROUTES.gradeForm} component={GradeFormScreen} options={{ title: GRADING.formTitle }} />
        <Stack.Screen name={ROUTES.batches} component={BatchesScreen} options={{ headerTitle: '' }} />
        <Stack.Screen
          name={ROUTES.batchForm}
          component={BatchFormScreen}
          options={({ route }) => ({
            title: route.params?.batch ? BATCHES.editTitle : BATCHES.newTitle,
          })}
        />
        <Stack.Screen
          name={ROUTES.batchRoster}
          component={BatchRosterScreen}
          options={{ title: BATCHES.rosterTitle }}
        />
        <Stack.Screen name={ROUTES.users} component={UsersScreen} options={{ headerTitle: '' }} />
        <Stack.Screen name={ROUTES.userCreate} component={UserCreateScreen} options={{ title: USERS.newTitle }} />
        <Stack.Screen name={ROUTES.userEdit} component={UserEditScreen} options={{ title: USERS.editTitle }} />
        <Stack.Screen name={ROUTES.roles} component={RolesScreen} options={{ headerTitle: '' }} />
        <Stack.Screen
          name={ROUTES.roleForm}
          component={RoleFormScreen}
          options={({ route }) => ({
            title: route.params?.role ? ROLES.editTitle : ROLES.newTitle,
          })}
        />
        <Stack.Screen
          name={ROUTES.attendanceMark}
          component={AttendanceMarkScreen}
          options={{ title: ATTENDANCE.markTitle }}
        />
        <Stack.Screen name={ROUTES.profile} component={ProfileScreen} options={{ title: PROFILE.title }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}