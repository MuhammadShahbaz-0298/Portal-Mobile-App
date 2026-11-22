// Signed-in stack: tabs plus every detail/form/management screen.
// Extracted from RootNavigator so both files stay under the limit.
import { NavigationContainer, DefaultTheme, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { AppTabs } from './AppTabs';
import { AssignmentDetailScreen } from '../screens/assignments/AssignmentDetailScreen';
import { AssignmentFormScreen } from '../screens/assignments/AssignmentFormScreen';
import { AssignmentResourcesScreen } from '../screens/assignments/AssignmentResourcesScreen';
import { SubmissionUploadScreen } from '../screens/submissions/SubmissionUploadScreen';
import { SubmissionDetailScreen } from '../screens/submissions/SubmissionDetailScreen';
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
import { AnnouncementsScreen } from '../screens/announcements/AnnouncementsScreen';
import { TimetableScreen } from '../screens/timetable/TimetableScreen';
import { TimetableFormScreen } from '../screens/timetable/TimetableFormScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { EventFormScreen } from '../screens/events/EventFormScreen';
import { QuizTakeScreen } from '../screens/quizzes/QuizTakeScreen';
import { QuizFormScreen } from '../screens/quizzes/QuizFormScreen';
import { PUSH, ROUTES } from '../constants/app';
import {
  ANNOUNCEMENTS,
  ASSIGNMENTS,
  EVENTS,
  QUIZZES,
  RESOURCES,
  SUBMISSIONS,
  SUBMISSION_DETAILS,
  TIMETABLE,
  GRADING,
  BATCHES,
  USERS,
  ROLES,
  ATTENDANCE,
  PROFILE,
} from '../constants/strings';
import { useThemeColors } from '../hooks/useThemeColors';
const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef();

export function AppStack() {
  useEffect(() => {
    const handleResponse = (response) => {
      const screen = response?.notification?.request?.content?.data?.screen;
      if (typeof screen !== 'string') return;
      const destination = PUSH.screenRoutes[screen] || screen;
      if (!PUSH.allowedScreens.includes(destination)) return;

      if (!navigationRef.isReady()) return;
      if (PUSH.tabScreens.includes(destination)) {
        navigationRef.navigate(ROUTES.tabs, { screen: destination });
      } else {
        navigationRef.navigate(destination);
      }
    };

    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) handleResponse(response);
      })
      .catch(() => {});

    return () => subscription.remove();
  }, []);

  const palette = useThemeColors();
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: palette.brand,
      background: palette.canvas,
      card: palette.surface,
      text: palette.ink,
      border: palette.line,
      notification: palette.danger,
    },
  };
  return (
    <NavigationContainer ref={navigationRef} theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.ink,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.canvas },
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
          name={ROUTES.assignmentResources}
          component={AssignmentResourcesScreen}
          options={{ title: RESOURCES.title }}
        />
        <Stack.Screen
          name={ROUTES.submissionUpload}
          component={SubmissionUploadScreen}
          options={{ title: SUBMISSIONS.uploadTitle }}
        />
        <Stack.Screen
          name={ROUTES.submissionDetail}
          component={SubmissionDetailScreen}
          options={{ title: SUBMISSION_DETAILS.title }}
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
        <Stack.Screen
          name={ROUTES.announcements}
          component={AnnouncementsScreen}
          options={{ title: ANNOUNCEMENTS.title }}
        />
        <Stack.Screen
          name={ROUTES.timetable}
          component={TimetableScreen}
          options={{ title: TIMETABLE.title }}
        />
        <Stack.Screen
          name={ROUTES.timetableForm}
          component={TimetableFormScreen}
          options={{ title: TIMETABLE.newTitle }}
        />
        <Stack.Screen
          name={ROUTES.events}
          component={EventsScreen}
          options={{ title: EVENTS.title }}
        />
        <Stack.Screen
          name={ROUTES.eventForm}
          component={EventFormScreen}
          options={{ title: EVENTS.newTitle }}
        />
        <Stack.Screen
          name={ROUTES.quizTake}
          component={QuizTakeScreen}
          options={{ title: QUIZZES.title }}
        />
        <Stack.Screen
          name={ROUTES.quizForm}
          component={QuizFormScreen}
          options={({ route }) => ({
            title: route.params?.quiz ? QUIZZES.editTitle : QUIZZES.newTitle,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
