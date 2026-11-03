// Normalizes assignments and submissions into dashboard queue-row objects.
// The QueueCard component consumes these; navigation stays in the screen.
import { COMMON } from '../constants/strings';
import { formatDateTime } from './dates';
import { getBatchName, getDisplayName, getId } from './ids';

// One row for a student's open assignment.
export function queueAssignmentItem(item, onOpen) {
  return {
    id: getId(item),
    title: item.title || COMMON.assignment,
    detail: `${getBatchName(item.batch)} · ${formatDateTime(item.dueDate)}`,
    badgeLabel: COMMON.statusOpen,
    badgeStatus: 'active',
    onPress: () => onOpen(getId(item)),
  };
}

// One row for a submission awaiting grading (or in progress, for students).
export function queueSubmissionItem(item, onOpen) {
  return {
    id: getId(item),
    title: item.assignment?.title || COMMON.assignment,
    detail: `${getDisplayName(item.student)} · ${getBatchName(item.batch)}`,
    badgeLabel: item.status || 'submitted',
    badgeStatus: item.status,
    onPress: onOpen,
  };
}
