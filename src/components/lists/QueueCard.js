// Renders the dashboard "needs your attention" queue from normalized items.
// Each item: { id, title, detail, badgeLabel, badgeStatus, onPress }.
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { colors, spacing } from '../../constants/theme';

export function QueueCard({ heading, items, loading, emptyText }) {
  if (loading && !items.length) {
    return (
      <Card style={styles.card}>
        <View style={styles.spinnerRow}>
          <ActivityIndicator color={colors.brand} />
          <AppText variant="small">{heading}</AppText>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <AppText variant="subtitle">{heading}</AppText>
      {items.length ? (
        items.map((item) => (
          <Card key={item.id} onPress={item.onPress} style={styles.row}>
            <View style={styles.text}>
              <AppText variant="label" numberOfLines={1}>{item.title}</AppText>
              <AppText variant="caption" numberOfLines={1}>{item.detail}</AppText>
            </View>
            <Badge label={item.badgeLabel} status={item.badgeStatus} />
          </Card>
        ))
      ) : (
        <AppText variant="small">{emptyText}</AppText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  spinnerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  row: { padding: spacing.md, gap: spacing.xs },
  text: { minWidth: 0 },
});
