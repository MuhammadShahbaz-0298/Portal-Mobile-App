// Tappable menu row used on the More screen and profile shortcuts.
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, layout, radius, spacing } from '../../constants/theme';

export function MenuRow({ icon, label, description, onPress, danger = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.icon, danger && styles.dangerIcon]}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? colors.danger : colors.brand}
        />
      </View>
      <View style={styles.text}>
        <AppText variant="body" style={danger ? styles.dangerText : undefined}>
          {label}
        </AppText>
        {description ? <AppText variant="caption">{description}</AppText> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: layout.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.7 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIcon: { backgroundColor: colors.dangerSoft },
  text: { flex: 1, gap: 2 },
  dangerText: { color: colors.danger },
});
