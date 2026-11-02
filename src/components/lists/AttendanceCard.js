// Attendance record card used by the register and student history.
import { StyleSheet, View } from 'react-native';
import { Card } from '../ui/Card';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { ATTENDANCE, COMMON } from '../../constants/strings';
import { formatDate } from '../../utils/dates';
import { getDisplayName } from '../../utils/ids';
import { spacing } from '../../constants/theme';

export function AttendanceCard({ record, onPress, onSummary }) {
  const student = record.student;
  return (
    <Card onPress={onPress}>
      <View style={styles.top}>
        <View style={styles.text}>
          <AppText variant="subtitle">{getDisplayName(student)}</AppText>
          <AppText variant="small">
            {record.batch?.name || record.batchName || COMMON.batch}
          </AppText>
        </View>
        <Badge label={ATTENDANCE[record.status] || record.status} status={record.status} />
      </View>
      <View style={styles.meta}>
        <AppText variant="caption">
          {ATTENDANCE.dateLabel}: {formatDate(record.date)}
        </AppText>
        {onSummary ? (
          <AppText variant="link" onPress={onSummary}>
            {ATTENDANCE.summaryTitle}
          </AppText>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  text: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
});
