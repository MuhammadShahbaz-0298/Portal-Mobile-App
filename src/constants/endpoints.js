// Every backend path lives here so screens never contain endpoint strings.
const base = '/api';

export const ENDPOINTS = Object.freeze({
  health: '/health',
  auth: {
    register: `${base}/auth/register`,
    login: `${base}/auth/login`,
    logout: `${base}/auth/logout`,
    logoutAll: `${base}/auth/logout-all`,
    refresh: `${base}/auth/refresh`,
    me: `${base}/auth/me`,
    changePassword: `${base}/auth/change-password`,
  },
  users: {
    list: `${base}/users`,
    create: `${base}/users`,
    byId: (id) => `${base}/users/${id}`,
    archive: (id) => `${base}/users/${id}/archive`,
    resetPassword: (id) => `${base}/users/${id}/reset-password`,
  },
  roles: {
    list: `${base}/roles`,
    byId: (id) => `${base}/roles/${id}`,
  },
  permissions: {
    catalog: `${base}/permissions`,
    user: (id) => `${base}/permissions/users/${id}`,
  },
  batches: {
    list: `${base}/batches`,
    create: `${base}/batches`,
    byId: (id) => `${base}/batches/${id}`,
    archive: (id) => `${base}/batches/${id}/archive`,
    students: (id) => `${base}/batches/${id}/students`,
    enroll: (id) => `${base}/batches/${id}/enroll`,
  },
  assignments: {
    list: `${base}/assignments`,
    create: `${base}/assignments`,
    byId: (id) => `${base}/assignments/${id}`,
  },
  submissions: {
    list: `${base}/submissions`,
    create: `${base}/submissions`,
    byId: (id) => `${base}/submissions/${id}`,
    file: (id) => `${base}/submissions/${id}/file`,
    grade: (id) => `${base}/submissions/${id}/grade`,
    download: (id) => `${base}/submissions/${id}/download`,
  },
  attendance: {
    list: `${base}/attendance`,
    byStudent: (studentId) => `${base}/attendance/${studentId}`,
    byId: (id) => `${base}/attendance/${id}`,
  },
});
