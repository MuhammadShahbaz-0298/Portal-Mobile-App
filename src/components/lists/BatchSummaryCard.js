// Batch summary card: name, badge, teacher, enrollment count, and action buttons.
// Used by the batch roster screen.
import { StyleSheet, View } from 'react-native';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Row } from '../ui/Row';
import { Button } from '../ui/Button';
import { BATCHES, COMMON } from '../../constants/strings';
import { spacing } from '../../constants/theme';

export function BatchSummaryCard({
  batch,
  editable,
  archivable,
  deletable,
  onEdit,
  onArchive,
  onDelete,
}) {
  const archived = batch.active === false;

  return (
    <Card>
      <View style={styles.title}>
        <AppText variant="title" style={styles.name}>{batch.name}</AppText>
        <Badge
          label={archived ? BATCHES.archived : BATCHES.active}
          status={archived ? 'archived' : 'active'}
        />
      </View>
      <Row label={COMMON.teacher} value={batch.teacher?.name} />
      <Row label={COMMON.email} value={batch.teacher?.email} />
      <Row label={BATCHES.studentCount} value={String(batch.studentCount ?? 0)} />
      <View style={styles.actions}>
        {editable ? (
          <Button title={COMMON.edit} variant="secondary" compact onPress={onEdit} />
        ) : null}
        {archivable && !archived ? (
          <Button title={COMMON.archive} variant="secondary" compact onPress={onArchive} />
        ) : null}
        {deletable ? (
          <Button title={COMMON.delete} variant="danger" compact onPress={onDelete} />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  name: { flexShrink: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
});
