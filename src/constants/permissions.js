// Mirrors backend/config/permissions.js. Keys are the API contract.
export const PERMISSIONS = Object.freeze({
  DASHBOARD_VIEW: 'dashboard.view',
  STUDENTS_VIEW: 'students.view',
  STUDENTS_CREATE: 'students.create',
  STUDENTS_UPDATE: 'students.update',
  STUDENTS_ATTENDANCE: 'students.attendance',
  BATCHES_VIEW: 'batches.view',
  BATCHES_CREATE: 'batches.create',
  BATCHES_UPDATE: 'batches.update',
  BATCHES_DELETE: 'batches.delete',
  BATCHES_ENROLL: 'batches.enroll',
  ASSIGNMENTS_VIEW: 'assignments.view',
  ASSIGNMENTS_CREATE: 'assignments.create',
  ASSIGNMENTS_UPDATE: 'assignments.update',
  ASSIGNMENTS_DELETE: 'assignments.delete',
  SUBMISSIONS_VIEW: 'submissions.view',
  SUBMISSIONS_GRADE: 'submissions.grade',
  ATTENDANCE_VIEW: 'attendance.view',
  ATTENDANCE_MANAGE: 'attendance.manage',
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  PROFILE_VIEW: 'profile.view',
});

export const PERMISSION_LABELS = Object.freeze({
  'dashboard.view': 'View dashboard',
  'students.view': 'View students',
  'students.create': 'Create students',
  'students.update': 'Update students',
  'students.attendance': 'Mark student attendance',
  'batches.view': 'View batches',
  'batches.create': 'Create batches',
  'batches.update': 'Update batches',
  'batches.delete': 'Archive or delete batches',
  'batches.enroll': 'Enroll batch students',
  'assignments.view': 'View assignments',
  'assignments.create': 'Create assignments',
  'assignments.update': 'Update assignments',
  'assignments.delete': 'Archive or delete assignments',
  'submissions.view': 'View submissions',
  'submissions.grade': 'Grade submissions',
  'attendance.view': 'View attendance',
  'attendance.manage': 'Manage attendance',
  'users.manage': 'Manage users',
  'roles.manage': 'Manage roles',
  'profile.view': 'View and edit profile',
});

export const PERMISSION_GROUPS = Object.freeze([
  ['dashboard.view'],
  [
    'students.view',
    'students.create',
    'students.update',
    'students.attendance',
  ],
  [
    'batches.view',
    'batches.create',
    'batches.update',
    'batches.delete',
    'batches.enroll',
  ],
  [
    'assignments.view',
    'assignments.create',
    'assignments.update',
    'assignments.delete',
  ],
  ['submissions.view', 'submissions.grade'],
  ['attendance.view', 'attendance.manage'],
  ['users.manage', 'roles.manage', 'profile.view'],
]);

export const PERMISSION_GROUP_TITLES = Object.freeze([
  'Dashboard',
  'Students',
  'Batches',
  'Assignments',
  'Submissions',
  'Attendance',
  'Administration',
]);

export const ROLE_LABELS = Object.freeze({
  admin: 'Administrator',
  teacher: 'Teacher',
  student: 'Student',
});

export function hasPermission(user, permission) {
  return Boolean(user?.permissions?.includes(permission));
}

export function hasAnyPermission(user, permissions = []) {
  return permissions.some((permission) => hasPermission(user, permission));
}

export function visiblePermissions(permissions = []) {
  return permissions.filter(Boolean);
}
