// App identity and the one navigation config that drives tabs, More, and stack titles.
// Visibility is decided by backend permission names, never by hardcoded screens.
import {
  ANNOUNCEMENTS,
  ASSIGNMENTS,
  ATTENDANCE,
  BATCHES,
  DASHBOARD,
  EVENTS,
  FEATURES,
  GRADING,
  NAV,
  NOTIFICATIONS,
  PROFILE,
  QUIZZES,
  ROLES,
  SUBMISSIONS,
  TIMETABLE,
  USERS,
} from './strings';
import { PERMISSIONS, ROLE_SETS, can } from './permissions';

export const APP = Object.freeze({
  name: 'School Portal',
  tagline: 'Your school, in your pocket',
  version: '1.0.1',
  updateChannel: 'production',
});

export const ROUTES = Object.freeze({
  login: 'Login',
  forcePassword: 'ForceChangePassword',
  tabs: 'Tabs',
  dashboard: 'Dashboard',
  assignments: 'Assignments',
  submissions: 'Submissions',
  attendance: 'Attendance',
  more: 'More',
  assignmentDetail: 'AssignmentDetail',
  assignmentForm: 'AssignmentForm',
  assignmentResources: 'AssignmentResources',
  submissionUpload: 'SubmissionUpload',
  submissionDetail: 'SubmissionDetail',
  grading: 'Grading',
  gradeForm: 'GradeForm',
  batches: 'Batches',
  batchForm: 'BatchForm',
  batchRoster: 'BatchRoster',
  users: 'Users',
  userCreate: 'UserCreate',
  userEdit: 'UserEdit',
  roles: 'Roles',
  roleForm: 'RoleForm',
  attendanceMark: 'AttendanceMark',
  profile: 'Profile',
  announcements: 'Announcements',
  timetable: 'Timetable',
  timetableForm: 'TimetableForm',
  events: 'Events',
  eventForm: 'EventForm',
  quizList: 'QuizList',
  quizTake: 'QuizTake',
  quizForm: 'QuizForm',
  chat: 'Chat',
  notifications: 'Notifications',
});

export const PUSH = Object.freeze({
  projectId: '175a25ea-4dfa-4a80-b9e4-8749432a5914',
  androidChannelName: 'School Portal Notifications',
  screenRoutes: Object.freeze({
    announcements: ROUTES.announcements,
  }),
  allowedScreens: Object.freeze([
    ROUTES.dashboard,
    ROUTES.assignments,
    ROUTES.submissions,
    ROUTES.attendance,
    ROUTES.quizList,
    ROUTES.chat,
    ROUTES.notifications,
    ROUTES.profile,
    ROUTES.announcements,
    ROUTES.timetable,
    ROUTES.events,
  ]),
  tabScreens: Object.freeze([
    ROUTES.dashboard,
    ROUTES.assignments,
    ROUTES.submissions,
    ROUTES.attendance,
    ROUTES.quizList,
    ROUTES.chat,
    ROUTES.notifications,
  ]),
});

const N = (name, permission, roles, icon, title, tab, section) => ({
  name,
  permission,
  roles,
  icon,
  title,
  tab,
  section,
});

// The single list of app destinations. Visibility is decided by these entries.
export const NAV_ITEMS = Object.freeze([
  N(ROUTES.dashboard, PERMISSIONS.DASHBOARD_VIEW, ROLE_SETS.LEARNING, 'home-outline', DASHBOARD.title, true, NAV.learning),
  N(ROUTES.assignments, PERMISSIONS.ASSIGNMENTS_VIEW, ROLE_SETS.LEARNING, 'document-text-outline', ASSIGNMENTS.title, true, NAV.learning),
  N(ROUTES.submissions, PERMISSIONS.SUBMISSIONS_VIEW, ROLE_SETS.LEARNING, 'cloud-upload-outline', SUBMISSIONS.title, true, NAV.learning),
  N(ROUTES.attendance, PERMISSIONS.ATTENDANCE_VIEW, ROLE_SETS.LEARNING, 'calendar-outline', ATTENDANCE.title, true, NAV.learning),
  N(ROUTES.grading, PERMISSIONS.SUBMISSIONS_GRADE, ROLE_SETS.STAFF, 'ribbon-outline', GRADING.title, false, NAV.management),
  N(ROUTES.batches, PERMISSIONS.BATCHES_VIEW, ROLE_SETS.STAFF, 'people-circle-outline', BATCHES.title, false, NAV.management),
  N(ROUTES.users, PERMISSIONS.USERS_MANAGE, ROLE_SETS.ADMIN, 'people-outline', USERS.title, false, NAV.management),
  N(ROUTES.roles, PERMISSIONS.ROLES_MANAGE, ROLE_SETS.ADMIN, 'shield-checkmark-outline', ROLES.title, false, NAV.management),
  N(ROUTES.announcements, PERMISSIONS.ANNOUNCEMENTS_VIEW, ROLE_SETS.LEARNING, 'megaphone-outline', ANNOUNCEMENTS.title, false, NAV.explore),
  N(ROUTES.timetable, PERMISSIONS.TIMETABLE_VIEW, ROLE_SETS.LEARNING, 'grid-outline', TIMETABLE.title, false, NAV.explore),
  N(ROUTES.events, PERMISSIONS.EVENTS_VIEW, ROLE_SETS.LEARNING, 'calendar-clear-outline', EVENTS.title, false, NAV.explore),
  N(ROUTES.quizList, PERMISSIONS.QUIZ_VIEW, ROLE_SETS.LEARNING, 'help-circle-outline', QUIZZES.title, true, NAV.learning),
  N(ROUTES.profile, PERMISSIONS.PROFILE_VIEW, ROLE_SETS.LEARNING, 'person-circle-outline', PROFILE.title, false, NAV.account),
  N(ROUTES.notifications, PERMISSIONS.NOTIFICATIONS_VIEW, ROLE_SETS.LEARNING, 'notifications-outline', NOTIFICATIONS.title, true, NAV.learning),
  N(ROUTES.chat, PERMISSIONS.ASSISTANT_USE, ROLE_SETS.LEARNING, 'chatbubble-ellipses-outline', FEATURES.chat, true, NAV.account),
]);

export function visibleNavItems(user) {
  return NAV_ITEMS.filter((item) => can(user, item.permission, item.roles));
}

export function primaryTabItems(user) {
  const visible = visibleNavItems(user);
  const priorities = [
    ROUTES.dashboard,
    ROUTES.assignments,
    ROUTES.quizList,
    ROUTES.chat,
    ROUTES.notifications,
  ];
  const selected = priorities
    .map((name) => visible.find((item) => item.name === name))
    .filter(Boolean);
  const extras = visible.filter((item) => item.tab && !selected.includes(item));
  return [...selected, ...extras].slice(0, 5);
}

export function overflowNavItems(user) {
  const primary = new Set(primaryTabItems(user).map((item) => item.name));
  return visibleNavItems(user).filter((item) => !primary.has(item.name));
}

export function overflowNavSections(user) {
  const items = overflowNavItems(user);
  return [NAV.explore, NAV.learning, NAV.management, NAV.account]
    .map((section) => ({
      section,
      items: items.filter((item) => item.section === section),
    }))
    .filter((group) => group.items.length > 0);
}
