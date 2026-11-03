// Backend-enforced role rules the app cannot express with permissions.
// batchAccessService (batch roster/mark/enroll) and routes/submissions.js
// check these exact roles, so the UI must mirror them.
import { ROLES } from '../constants/permissions';

export function isStaffRole(user) {
  const role = user?.role;
  return role === ROLES.ADMIN || role === ROLES.TEACHER;
}

export function isAdminRole(user) {
  return user?.role === ROLES.ADMIN;
}

export function isStudentRole(user) {
  return user?.role === ROLES.STUDENT;
}

export function isTeacherRole(user) {
  return user?.role === ROLES.TEACHER;
}
