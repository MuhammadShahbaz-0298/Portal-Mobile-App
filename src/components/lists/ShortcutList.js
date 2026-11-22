// Simple shortcut list: icon, label, and a trailing chevron.
// Used by the dashboard's "Jump back in" card.
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import { layout, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function ShortcutList({ items }) {
  const colors = useThemeColors();
  return (
    <View>
      {items.map((item) => (
        <Pressable
          key={item.label}
          accessibilityRole="button"
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.row,
            { borderTopColor: colors.line },
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.icon, { backgroundColor: colors.brandSoft }]}>
            <Ionicons name={item.icon} size={18} color={colors.brand} />
          </View>
          <AppText variant="label" style={styles.label}>{item.label}</AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: layout.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: 1,
  },
  pressed: { opacity: 0.7 },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1 },
});
