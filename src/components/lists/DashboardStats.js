// The three dashboard stat tiles: open assignments, grading load, and staff batches.
// Staff see Awaiting grading; students see In progress.
import { StyleSheet, View } from 'react-native';
import { StatTile } from '../ui/StatTile';
import { PERMISSIONS, can } from '../../constants/permissions';
import { DASHBOARD } from '../../constants/strings';
import { colors, spacing } from '../../constants/theme';

export function DashboardStats({ user, staff, student, openCount, awaitingCount, batchesCount }) {
  const showBatches = staff && can(user, PERMISSIONS.BATCHES_VIEW, ['admin', 'teacher']);

  return (
    <View style={styles.stats}>
      <StatTile
        label={DASHBOARD.openAssignments}
        value={openCount}
        icon="document-text-outline"
      />
      <StatTile
        label={student ? DASHBOARD.inProgress : DASHBOARD.awaitingGrading}
        value={awaitingCount}
        icon="ribbon-outline"
        tone={colors.warning}
      />
      {showBatches ? (
        <StatTile
          label={DASHBOARD.activeBatches}
          value={batchesCount}
          icon="albums-outline"
          tone={colors.success}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
