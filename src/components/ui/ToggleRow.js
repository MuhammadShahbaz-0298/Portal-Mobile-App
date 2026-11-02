// Labeled switch row for boolean form fields.
import { StyleSheet, Switch, View } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing } from '../../constants/theme';

export function ToggleRow({ label, description, value, onValueChange, disabled = false }) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <AppText variant="label">{label}</AppText>
        {description ? <AppText variant="caption">{description}</AppText> : null}
      </View>
      <Switch
        value={Boolean(value)}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.line, true: colors.brandSoft }}
        thumbColor={value ? colors.brand : colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: { flex: 1, gap: 2 },
});
