// One row of a checklist: checkbox, name/email, and a Present/Absent tag.
// Used by the attendance roster; row height meets the 44px touch target rule.
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { ATTENDANCE } from '../../constants/strings';
import { colors, layout, spacing } from '../../constants/theme';

export function CheckboxRow({ name, email, checked, leave = false, onToggle, disabled }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onToggle}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={26}
        color={checked ? colors.brand : colors.muted}
      />
      <View style={styles.text}>
        <AppText variant="body" numberOfLines={1}>{name}</AppText>
        {email ? <AppText variant="caption" numberOfLines={1}>{email}</AppText> : null}
      </View>
      <AppText
        variant="caption"
        style={leave ? styles.leave : checked ? styles.present : styles.absent}
      >
        {leave ? ATTENDANCE.leave : checked ? ATTENDANCE.present : ATTENDANCE.absent}
      </AppText>
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
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  pressed: { opacity: 0.7 },
  text: { flex: 1, gap: 2 },
  present: { color: colors.success },
  absent: { color: colors.muted },
  leave: { color: colors.warning },
});
