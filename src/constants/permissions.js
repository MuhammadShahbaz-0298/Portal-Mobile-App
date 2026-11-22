// Permission names and role helpers. Keys are the API contract.
// Mirrors backend config/permissionCatalog.js and config/permissionMetadata.js.
export const PERMISSIONS = Object.freeze({
  DASHBOARD_VIEW: 'dashboard.view',
  STUDENTS_VIEW: 'students.view',
  STUDENTS_CREATE: 'students.create',
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
  TIMETABLE_VIEW: 'timetable.view',
  TIMETABLE_MANAGE: 'timetable.manage',
  CALENDAR_VIEW: 'calendar.view',
  EVENTS_VIEW: 'events.view',
  EVENTS_MANAGE: 'events.manage',
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  PROFILE_VIEW: 'profile.view',
  NOTIFICATIONS_VIEW: 'notifications.view',
  ANNOUNCEMENTS_VIEW: 'announcements.view',
  ANNOUNCEMENTS_MANAGE: 'announcements.manage',
  COMMENTS_VIEW: 'comments.view',
  COMMENTS_CREATE: 'comments.create',
  QUIZ_VIEW: 'quiz.view',
  QUIZ_MANAGE: 'quiz.manage',
  GRADES_VIEW: 'grades.view',
  ANALYTICS_VIEW: 'analytics.view',
  AUDIT_VIEW: 'audit.view',
  SEARCH_USE: 'search.use',
  ASSISTANT_USE: 'assistant.use',
  ASSIGNMENTS_RESOURCES_UPLOAD: 'assignments.resources.upload',
  ASSIGNMENTS_RESOURCES_VIEW: 'assignments.resources.view',
  ASSIGNMENTS_RESOURCES_DOWNLOAD: 'assignments.resources.download',
  ASSIGNMENTS_RESOURCES_DELETE: 'assignments.resources.delete',
  ATTENDANCE_EXPORT: 'attendance.export',
  SUBMISSIONS_EXPORT: 'submissions.export',
});

// Human-readable labels copied from backend config/permissionMetadata.js.
export const PERMISSION_LABELS = Object.freeze({
  'dashboard.view': 'Dashboard',
  'students.view': 'View students',
  'students.create': 'Create students',
  'batches.view': 'View batches',
  'batches.create': 'Create batches',
  'batches.update': 'Edit batches',
  'batches.delete': 'Archive batches',
  'batches.enroll': 'Enroll students',
  'assignments.view': 'View assignments',
  'assignments.create': 'Create assignments',
  'assignments.update': 'Edit assignments',
  'assignments.delete': 'Archive assignments',
  'submissions.view': 'View submissions',
  'submissions.grade': 'Grade submissions',
  'attendance.view': 'View attendance',
  'attendance.manage': 'Mark attendance',
  'timetable.view': 'View timetable',
  'timetable.manage': 'Manage timetable',
  'calendar.view': 'View calendar',
  'events.view': 'View events',
  'events.manage': 'Manage events',
  'users.manage': 'Manage accounts',
  'roles.manage': 'Manage roles',
  'profile.view': 'View profile',
  'notifications.view': 'View notifications',
  'announcements.view': 'View announcements',
  'announcements.manage': 'Manage announcements',
  'comments.view': 'View comments',
  'comments.create': 'Write comments',
  'quiz.view': 'View quizzes',
  'quiz.manage': 'Manage quizzes',
  'grades.view': 'View grades',
  'analytics.view': 'View analytics',
  'audit.view': 'View audit log',
  'search.use': 'Use global search',
  'assistant.use': 'Use AI assistant',
  'assignments.resources.upload': 'Upload resources',
  'assignments.resources.view': 'View resources',
  'assignments.resources.download': 'Download resources',
  'assignments.resources.delete': 'Archive resources',
  'attendance.export': 'Export attendance',
  'submissions.export': 'Export submissions',
});

// Display order and grouping for the role editor. Copied from backend metadata.
export const PERMISSION_GROUPS = Object.freeze({
  Workspace: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
  Students: [PERMISSIONS.STUDENTS_VIEW, PERMISSIONS.STUDENTS_CREATE],
  Batches: [
    PERMISSIONS.BATCHES_VIEW,
    PERMISSIONS.BATCHES_CREATE,
    PERMISSIONS.BATCHES_UPDATE,
    PERMISSIONS.BATCHES_DELETE,
    PERMISSIONS.BATCHES_ENROLL,
  ],
  Assignments: [
    PERMISSIONS.ASSIGNMENTS_VIEW,
    PERMISSIONS.ASSIGNMENTS_CREATE,
    PERMISSIONS.ASSIGNMENTS_UPDATE,
    PERMISSIONS.ASSIGNMENTS_DELETE,
  ],
  Submissions: [
    PERMISSIONS.SUBMISSIONS_VIEW,
    PERMISSIONS.SUBMISSIONS_GRADE,
    PERMISSIONS.SUBMISSIONS_EXPORT,
  ],
  Attendance: [
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.ATTENDANCE_EXPORT,
  ],
  Timetable: [PERMISSIONS.TIMETABLE_VIEW, PERMISSIONS.TIMETABLE_MANAGE],
  Calendar: [PERMISSIONS.CALENDAR_VIEW],
  Events: [PERMISSIONS.EVENTS_VIEW, PERMISSIONS.EVENTS_MANAGE],
  Administration: [
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.ROLES_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
  ],
  Announcements: [PERMISSIONS.ANNOUNCEMENTS_VIEW, PERMISSIONS.ANNOUNCEMENTS_MANAGE],
  Comments: [PERMISSIONS.COMMENTS_VIEW, PERMISSIONS.COMMENTS_CREATE],
  Quizzes: [PERMISSIONS.QUIZ_VIEW, PERMISSIONS.QUIZ_MANAGE],
  Grades: [PERMISSIONS.GRADES_VIEW],
  Analytics: [PERMISSIONS.ANALYTICS_VIEW],
  'Search & AI': [PERMISSIONS.SEARCH_USE, PERMISSIONS.ASSISTANT_USE],
  Resources: [
    PERMISSIONS.ASSIGNMENTS_RESOURCES_UPLOAD,
    PERMISSIONS.ASSIGNMENTS_RESOURCES_VIEW,
    PERMISSIONS.ASSIGNMENTS_RESOURCES_DOWNLOAD,
    PERMISSIONS.ASSIGNMENTS_RESOURCES_DELETE,
  ],
});

export const ROLES = Object.freeze({
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
});

const CORE_ROLES = Object.freeze([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]);

// Named role sets keep permission fallbacks out of screens and navigation config.
export const ROLE_SETS = Object.freeze({
  ADMIN: Object.freeze([ROLES.ADMIN]),
  STAFF: Object.freeze([ROLES.ADMIN, ROLES.TEACHER]),
  LEARNING: Object.freeze([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]),
  STUDENT: Object.freeze([ROLES.STUDENT]),
});

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
