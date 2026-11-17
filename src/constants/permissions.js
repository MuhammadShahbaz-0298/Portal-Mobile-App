// Permission names and role helpers. Keys are the API contract (backend config/permissions.js).
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

// Human-readable labels, grouped for the role editor. Copy only; the API returns the list.
export const PERMISSION_LABELS = Object.freeze({
  'dashboard.view': 'Dashboard',
  'students.view': 'View students',
  'students.create': 'Create students',
  'students.update': 'Edit students',
  'students.attendance': 'Student attendance',
  'batches.view': 'View batches',
  'batches.create': 'Create batches',
  'batches.update': 'Edit batches',
  'batches.delete': 'Delete batches',
  'batches.enroll': 'Enroll students',
  'assignments.view': 'View assignments',
  'assignments.create': 'Create assignments',
  'assignments.update': 'Edit assignments',
  'assignments.delete': 'Archive assignments',
  'submissions.view': 'View submissions',
  'submissions.grade': 'Grade submissions',
  'attendance.view': 'View attendance',
  'attendance.manage': 'Mark attendance',
  'users.manage': 'Manage accounts',
  'roles.manage': 'Manage roles',
  'profile.view': 'View profile',
});

// Display order and grouping for the role editor. Copy only; the API returns the list.
export const PERMISSION_GROUPS = Object.freeze({
  Workspace: ['dashboard.view', 'profile.view'],
  Students: ['students.view', 'students.create', 'students.update', 'students.attendance'],
  Batches: ['batches.view', 'batches.create', 'batches.update', 'batches.delete', 'batches.enroll'],
  Assignments: ['assignments.view', 'assignments.create', 'assignments.update', 'assignments.delete'],
  Submissions: ['submissions.view', 'submissions.grade'],
  Attendance: ['attendance.view', 'attendance.manage'],
  Administration: ['users.manage', 'roles.manage'],
});

export const ROLES = Object.freeze({
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
});

const CORE_ROLES = Object.freeze([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]);

export const ROLE_LABELS = Object.freeze({
  admin: 'Administrator',
  teacher: 'Teacher',
  student: 'Student',
});

export function isCoreRole(name) {
  return CORE_ROLES.includes(String(name).toLowerCase());
}

// Web-compatible check: permissions win; fall back to role when permissions are missing.
export function can(user, permission, fallbackRoles = []) {
  if (!user) return false;
  if (Array.isArray(user.permissions)) return user.permissions.includes(permission);
  return fallbackRoles.includes(user.role);
}
