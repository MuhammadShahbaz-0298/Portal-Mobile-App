// Feature flags and option lists kept minimal; nothing is here unless the app uses it.
// Upload limits match the backend (global 50 MB ZIP cap).

export const PAGE_SIZE = 50;
export const DASHBOARD_LIMIT = 5;
export const QUERY_LIMIT = 100;

export const MAX_FILE_MB = 50;
export const DEFAULT_MAX_FILE_MB = 25;
export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const BATCH_NAME_MAX_LENGTH = 120;

export const GRADE_MIN = 0;
export const GRADE_MAX = 100;

// Submission states returned by the backend, with the label shown in the app.
export const SUBMISSION_STATUSES = Object.freeze([
  { value: 'submitted', label: 'Submitted' },
  { value: 'graded', label: 'Graded' },
  { value: 'rejected', label: 'Rejected' },
]);
