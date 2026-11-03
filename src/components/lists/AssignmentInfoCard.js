// The fixed info block of the assignment detail screen: due date, batch, size limit.
// Backend does not populate createdBy, so that row is intentionally omitted.
import { Card } from '../ui/Card';
import { Row } from '../ui/Row';
import { COMMON, ASSIGNMENTS } from '../../constants/strings';
import { DEFAULT_MAX_FILE_MB } from '../../constants/options';
import { formatDateTime } from '../../utils/dates';

export function AssignmentInfoCard({ assignment }) {
  return (
    <Card>
      <Row label={COMMON.dueDate} value={formatDateTime(assignment.dueDate)} />
      <Row label={COMMON.batch} value={assignment.batch?.name} />
      <Row
        label={ASSIGNMENTS.maxSizeLabel}
        value={`${assignment.maxFileSizeMb || DEFAULT_MAX_FILE_MB} MB`}
      />
    </Card>
  );
}
