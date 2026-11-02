// Batch summary card with teacher and roster count.
import { StyleSheet, View } from 'react-native';
import { Card } from '../ui/Card';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { BATCHES, COMMON } from '../../constants/strings';
import { getDisplayName } from '../../utils/ids';
import { spacing } from '../../constants/theme';

export function BatchCard({ batch, onPress }) {
  return (
    <Card onPress={onPress}>
      <View style={styles.top}>
        <View style={styles.text}>
          <AppText variant="subtitle">{batch.name}</AppText>
          <AppText variant="small">
            {COMMON.teacher}: {getDisplayName(batch.teacher)}
          </AppText>
        </View>
        <Badge
          label={batch.active === false ? BATCHES.archived : BATCHES.active}
          status={batch.active === false ? 'archived' : 'active'}
        />
      </View>
      <AppText variant="caption">
        {BATCHES.studentCount}: {batch.studentCount ?? 0}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  text: { flex: 1, gap: 2 },
});
