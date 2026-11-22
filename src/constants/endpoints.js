// Every backend path lives here so screens never contain endpoint strings.
const base = "/api";

export const ENDPOINTS = Object.freeze({
  health: "/health",
  auth: {
    register: `${base}/auth/register`,
    login: `${base}/auth/login`,
    logout: `${base}/auth/logout`,
    refresh: `${base}/auth/refresh`,
    me: `${base}/auth/me`,
    changePassword: `${base}/auth/change-password`,
  },
  users: {
    list: `${base}/users`,
    byId: (id) => `${base}/users/${id}`,
    archive: (id) => `${base}/users/${id}/archive`,
    resetPassword: (id) => `${base}/users/${id}/reset-password`,
    reportCard: (id) => `${base}/users/${id}/report-card`,
  },
  roles: {
    list: `${base}/roles`,
    byId: (id) => `${base}/roles/${id}`,
  },
  permissions: {
    catalog: `${base}/permissions`,
  },
  notifications: {
    list: `${base}/notifications`,
    clear: `${base}/notifications`,
    markRead: (id) => `${base}/notifications/${id}/read`,
  },
  devices: {
    register: `${base}/devices`,
    unregister: (token) => `${base}/devices/${encodeURIComponent(token)}`,
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
    resources: {
      list: (id) => `${base}/assignments/${id}/resources`,
      byId: (id, resourceId) =>
        `${base}/assignments/${id}/resources/${resourceId}`,
      download: (id, resourceId) =>
        `${base}/assignments/${id}/resources/${resourceId}/download`,
    },
  },
  submissions: {
    list: `${base}/submissions`,
    create: `${base}/submissions`,
    file: (id) => `${base}/submissions/${id}/file`,
    grade: (id) => `${base}/submissions/${id}/grade`,
    download: (id) => `${base}/submissions/${id}/download`,
    versions: (id) => `${base}/submissions/${id}/versions`,
    aiDraft: (id) => `${base}/submissions/${id}/ai-draft`,
    aiDraftDiscard: (id) => `${base}/submissions/${id}/ai-draft/discard`,
    comments: {
      list: (submissionId) => `${base}/submissions/${submissionId}/comments`,
      archive: (submissionId, commentId) =>
        `${base}/submissions/${submissionId}/comments/${commentId}/archive`,
    },
  },
  attendance: {
    list: `${base}/attendance`,
  },
  quizzes: {
    list: `${base}/quizzes`,
    create: `${base}/quizzes`,
    byId: (id) => `${base}/quizzes/${id}`,
    attempt: (id) => `${base}/quizzes/${id}/attempt`,
    attemptStart: (id) => `${base}/quizzes/${id}/attempt/start`,
    attemptAnswers: (id) => `${base}/quizzes/${id}/attempt`,
    attemptViolation: (id) => `${base}/quizzes/${id}/attempt/violation`,
    attempts: (id) => `${base}/quizzes/${id}/attempts`,
  },
  announcements: {
    list: `${base}/announcements`,
    byId: (id) => `${base}/announcements/${id}`,
    archive: (id) => `${base}/announcements/${id}/archive`,
  },
  timetable: {
    list: `${base}/timetable`,
    byId: (id) => `${base}/timetable/${id}`,
    archive: (id) => `${base}/timetable/${id}/archive`,
  },
  events: {
    list: `${base}/events`,
    byId: (id) => `${base}/events/${id}`,
    archive: (id) => `${base}/events/${id}/archive`,
  },
  calendar: {
    feed: `${base}/calendar.ics`,
  },
  grades: {
    weighted: (studentId) => `${base}/weighted-grades/${studentId}`,
  },
  ai: {
    ask: `${base}/ai/assistant/ask`,
  },
});
