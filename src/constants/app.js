// App identity and the one navigation config that drives tabs, More, and stack titles.
// Tab order matches the frontend bottom navigation (dashboard, assignments, submissions, attendance).
import {
  ASSIGNMENTS,
  ATTENDANCE,
  BATCHES,
  DASHBOARD,
  GRADING,
  PROFILE,
  ROLES,
  SUBMISSIONS,
  USERS,
} from './strings';
import { PERMISSIONS, can } from './permissions';

export const APP = Object.freeze({
  name: 'School Portal',
  tagline: 'Your school, in your pocket',
  version: '1.0.0',
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
  submissionUpload: 'SubmissionUpload',
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
});

const N = (name, permission, roles, icon, title, tab) => ({
  name,
  permission,
  roles,
  icon,
  title,
  tab,
});

// The single list of app destinations. Visibility is decided by these entries.
export const NAV_ITEMS = Object.freeze([
  N(ROUTES.dashboard, PERMISSIONS.DASHBOARD_VIEW, ['admin', 'teacher', 'student'], 'home-outline', DASHBOARD.title, true),
  N(ROUTES.assignments, PERMISSIONS.ASSIGNMENTS_VIEW, ['admin', 'teacher', 'student'], 'document-text-outline', ASSIGNMENTS.title, true),
  N(ROUTES.submissions, PERMISSIONS.SUBMISSIONS_VIEW, ['admin', 'teacher', 'student'], 'cloud-upload-outline', SUBMISSIONS.title, true),
  N(ROUTES.attendance, PERMISSIONS.ATTENDANCE_VIEW, ['admin', 'teacher', 'student'], 'calendar-outline', ATTENDANCE.title, true),
  N(ROUTES.grading, PERMISSIONS.SUBMISSIONS_GRADE, ['admin', 'teacher'], 'ribbon-outline', GRADING.title, false),
  N(ROUTES.batches, PERMISSIONS.BATCHES_VIEW, ['admin', 'teacher'], 'people-circle-outline', BATCHES.title, false),
  N(ROUTES.users, PERMISSIONS.USERS_MANAGE, ['admin'], 'people-outline', USERS.title, false),
  N(ROUTES.roles, PERMISSIONS.ROLES_MANAGE, ['admin'], 'shield-checkmark-outline', ROLES.title, false),
  N(ROUTES.profile, PERMISSIONS.PROFILE_VIEW, ['admin', 'teacher', 'student'], 'person-circle-outline', PROFILE.title, false),
]);

// The four primary destinations shown as bottom tabs.
export const TAB_PATHS = Object.freeze([
  ROUTES.dashboard,
  ROUTES.assignments,
  ROUTES.submissions,
  ROUTES.attendance,
]);

export function visibleNavItems(user) {
  return NAV_ITEMS.filter((item) => can(user, item.permission, item.roles));
}

export function primaryTabItems(user) {
  return visibleNavItems(user).filter((item) => item.tab);
}

export function overflowNavItems(user) {
  return visibleNavItems(user).filter((item) => !item.tab);
}
