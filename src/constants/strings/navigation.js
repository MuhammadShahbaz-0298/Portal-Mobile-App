// Navigation titles and the access-restricted screen copy.
// Split from strings.js so every constant file stays small.

export const NAV = Object.freeze({
  dashboard: 'Dashboard',
  assignments: 'Assignments',
  submissions: 'Submissions',
  attendance: 'Attendance',
  more: 'More',
  batches: 'Batches',
  users: 'Users',
  roles: 'Roles',
  grading: 'Grading',
  profile: 'Profile',
  management: 'Management',
  account: 'Account',
});

export const PERMISSION_SCREEN = Object.freeze({
  title: 'Access restricted',
  body: 'Your role does not include this permission. Ask an administrator if you need access.',
});
