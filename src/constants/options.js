// Shared option lists used by pickers, filters, and forms.
import {
  ASSIGNMENTS,
  ATTENDANCE,
  GRADING,
  SUBMISSIONS,
} from './strings';

export const ATTENDANCE_STATUSES = Object.freeze([
  { value: 'present', label: ATTENDANCE.present },
  { value: 'absent', label: ATTENDANCE.absent },
  { value: 'leave', label: ATTENDANCE.leave },
]);

export const SUBMISSION_STATUSES = Object.freeze([
  { value: 'submitted', label: SUBMISSIONS.statusSubmitted },
  { value: 'graded', label: SUBMISSIONS.statusGraded },
  { value: 'rejected', label: SUBMISSIONS.statusRejected },
]);

export const GRADING_STATUSES = Object.freeze([
  { value: 'graded', label: GRADING.statusGraded },
  { value: 'rejected', label: GRADING.statusRejected },
]);

export const SUBMISSION_FILTERS = Object.freeze([
  { value: '', label: SUBMISSIONS.all },
  ...SUBMISSION_STATUSES,
]);

export const RESUBMISSION_POLICIES = Object.freeze([
  { value: 'allowed', label: ASSIGNMENTS.resubmissionAllowed },
  { value: 'disabled', label: ASSIGNMENTS.resubmissionDisabled },
]);

export const MAX_FILE_MB = 50;
export const DEFAULT_MAX_FILE_MB = 25;
export const ASSIGNMENT_MAX_FILE_MB = 250;
export const PAGE_SIZE = 50;
