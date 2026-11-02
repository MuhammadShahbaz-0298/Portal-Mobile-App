// Compact metric tile used on the dashboard.
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../../constants/theme';

export function StatTile({ label, value, icon, tone = colors.brand, onPress }) {
  const content = (
    <>
      <View style={[styles.icon, { backgroundColor: `${tone}18` }]}>
        <Ionicons name={icon} size={20} color={tone} />
      </View>
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption">{label}</AppText>
    </>
  );

  if (!onPress) return <View style={styles.tile}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  pressed: { opacity: 0.8 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
});
