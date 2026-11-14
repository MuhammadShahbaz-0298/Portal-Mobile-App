// Attendance list and mark copy.
// Split from strings.js so every constant file stays small.

export const ATTENDANCE = Object.freeze({
  title: 'Attendance',
  subtitle: 'Track daily attendance for your classes.',
  markTitle: 'Mark attendance',
  dateLabel: 'Date',
  batchLabel: 'Class batch',
  pickBatch: 'Choose a batch',
  studentLabel: 'Students',
  present: 'Present',
  absent: 'Absent',
  leave: 'Leave',
  onLeave: 'On leave',
  leaveReasonLabel: 'Reason for leave',
  leaveReasonRequired: 'Add a reason for every student on leave.',
  reasonLabel: 'Reason',
  noReason: 'No reason recorded',
  presentCount: (present, total, onLeave) =>
    `${present} of ${total} present${onLeave ? `, ${onLeave} on leave` : ''}`,
  empty: 'No attendance records',
  emptyHint: 'Records will appear here once attendance is marked.',
  markHint: 'Checked students are saved as present, the rest as absent, or on leave with a reason.',
  saved: 'Attendance saved.',
  partialSaved: (failed) => `${failed} record(s) could not be saved.`,
  noStudents: 'No students are enrolled in this batch yet.',
  invalidDate: 'Choose a valid date that is not in the future.',
  existingCheckFailed:
    'Could not check the existing records. Retry before saving.',
  loadingBatches: 'Loading classes and roster...',
});
