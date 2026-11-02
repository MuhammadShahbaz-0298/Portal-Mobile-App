// Assignment summary card used by the list and dashboard queue.
import { StyleSheet, View } from 'react-native';
import { Card } from '../ui/Card';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { ASSIGNMENTS, COMMON } from '../../constants/strings';
import { formatDate, isPast } from '../../utils/dates';
import { getBatchName } from '../../utils/ids';
import { colors, spacing } from '../../constants/theme';

export function AssignmentCard({ assignment, onPress, showCreator = false }) {
  const overdue = isPast(assignment.dueDate);
  const closed = assignment.active === false;
  const statusLabel = closed ? COMMON.archive : overdue ? ASSIGNMENTS.overdue : null;

  return (
    <Card onPress={onPress} accessibilityLabel={assignment.title}>
      <View style={styles.top}>
        <AppText variant="subtitle" style={styles.title}>
          {assignment.title}
        </AppText>
        {statusLabel ? (
          <Badge label={statusLabel} status={closed ? 'archived' : 'rejected'} />
        ) : null}
      </View>
      {assignment.description ? (
        <AppText variant="small" numberOfLines={2}>
          {assignment.description}
        </AppText>
      ) : null}
      <View style={styles.metaRow}>
        <AppText variant="caption">{getBatchName(assignment.batch)}</AppText>
        <AppText variant="caption" style={styles.due}>
          {ASSIGNMENTS.dueDateLabel}: {formatDate(assignment.dueDate)}
        </AppText>
      </View>
      {showCreator && assignment.createdBy?.name ? (
        <AppText variant="caption">
          {ASSIGNMENTS.createdBy}: {assignment.createdBy.name}
        </AppText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  title: { flex: 1 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  due: { textAlign: 'right', color: colors.inkSoft },
});
