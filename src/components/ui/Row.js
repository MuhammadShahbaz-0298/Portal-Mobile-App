// Horizontal label/value row used in detail cards.
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function Row({ label, value }) {
  const colors = useThemeColors();
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={[styles.row, { borderTopColor: colors.line }]}>
      <AppText variant="small" style={styles.label}>
        {label}
      </AppText>
      <AppText variant="body" style={styles.value}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  label: { flex: 1 },
  value: { flex: 1, textAlign: 'right' },
});
