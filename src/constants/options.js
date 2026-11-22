// Feature flags and option lists kept minimal; nothing is here unless the app uses it.
// Upload limits match the backend (global 50 MB ZIP cap).

export const PAGE_SIZE = 50;
export const QUERY_LIMIT = 100;
export const NOTIFICATION_POLL_INTERVAL_MS = 30000;
export const QUIZ_MAX_TIME_LIMIT_MINUTES = 1440;
export const STUDENT_COUNT_LIMIT = 1;

export const MAX_FILE_MB = 50;
export const DEFAULT_MAX_FILE_MB = 25;
export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const BATCH_NAME_MAX_LENGTH = 120;
export const FEEDBACK_MAX_LENGTH = 2000;

export const DRAFT_POLL_INTERVAL_MS = 2000;
export const DRAFT_POLL_MAX_MS = 180000;

export const GRADE_MIN = 0;
export const GRADE_MAX = 100;

// Values mirror backend constants/features.js and quizAttemptLogic.js.
export const DAYS_OF_WEEK = Object.freeze([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);
export const ANNOUNCEMENT_SCOPE = Object.freeze({
  BATCH: 'batch',
  SCHOOL: 'school',
});
export const ANNOUNCEMENT_SCOPES = Object.freeze([
  ANNOUNCEMENT_SCOPE.BATCH,
  ANNOUNCEMENT_SCOPE.SCHOOL,
]);
export const QUIZ_ATTEMPT_STATUSES = Object.freeze({
  IN_PROGRESS: 'inProgress',
  SUBMITTED: 'submitted',
});
export const QUIZ_UNANSWERED = -1;
export const QUIZ_FOCUS_WARNING_LIMIT = 2;
export const QUIZ_AUTOSAVE_DELAY_MS = 800;
export const SECOND_MS = 1000;
export const SEARCH_MIN_QUERY = 2;

// Download protocols shared by submissions, resources, report cards, and calendars.
export const DOWNLOAD_FILE_TYPES = Object.freeze({
  zip: Object.freeze({
    extension: 'zip',
    mimeType: 'application/zip',
    UTI: 'com.pkware.zip-archive',
  }),
  pdf: Object.freeze({ extension: 'pdf', mimeType: 'application/pdf' }),
  calendar: Object.freeze({ extension: 'ics', mimeType: 'text/calendar' }),
  binary: Object.freeze({ extension: 'bin', mimeType: 'application/octet-stream' }),
});

// Submission states returned by the backend, with the label shown in the app.
export const SUBMISSION_STATUSES = Object.freeze([
  { value: 'submitted', label: 'Submitted' },
  { value: 'graded', label: 'Graded' },
  { value: 'rejected', label: 'Rejected' },
]);
