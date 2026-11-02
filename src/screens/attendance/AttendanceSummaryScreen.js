// Attendance summary for one student with a record history.
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { StatTile } from '../../components/ui/StatTile';
import { AttendanceCard } from '../../components/lists/AttendanceCard';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { getAttendanceSummary } from '../../api/attendance';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { ATTENDANCE } from '../../constants/strings';
import { spacing } from '../../constants/theme';

export function AttendanceSummaryScreen({ route }) {
  const studentId = route.params?.studentId;
  const { user } = useAuth();
  const canView = hasPermission(user, PERMISSIONS.ATTENDANCE_VIEW);
  const summary = useApiData(() => getAttendanceSummary(studentId), [studentId], {
    enabled: canView && Boolean(studentId),
  });

  if (!canView) return <Screen><PermissionState /></Screen>;

  const data = summary.data;
  const records = data?.records || [];
  const absent = records.filter((item) => item.status === 'absent').length;
  const leave = records.filter((item) => item.status === 'leave').length;

  return (
    <Screen>
      {summary.loading ? <LoadingState /> : null}
      {summary.error ? (
        <ErrorState message={summary.error} onRetry={summary.retry} />
      ) : null}
      {data ? (
        <>
          <Card>
            <AppText variant="subtitle">{ATTENDANCE.score}</AppText>
            <AppText variant="heading">{data.percentage}%</AppText>
            <View style={styles.stats}>
              <StatTile label={ATTENDANCE.presentDays} value={data.present} />
              <StatTile label={ATTENDANCE.absentDays} value={absent} />
              <StatTile label={ATTENDANCE.leaveDays} value={leave} />
              <StatTile label={ATTENDANCE.totalDays} value={data.total} />
            </View>
          </Card>
          {records.length ? (
            records.map((record) => (
              <AttendanceCard key={record._id} record={record} />
            ))
          ) : (
            <EmptyState title={ATTENDANCE.summaryEmpty} icon="calendar-outline" />
          )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
