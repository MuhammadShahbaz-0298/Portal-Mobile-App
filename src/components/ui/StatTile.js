// Compact metric tile used on the dashboard.
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function StatTile({ label, value, icon, tone, onPress }) {
  const colors = useThemeColors();
  const resolvedTone = tone || colors.brand;
  const tileStyle = [styles.tile, { backgroundColor: colors.surface, borderColor: colors.line }];
  const content = (
    <>
      <View style={[styles.icon, { backgroundColor: `${resolvedTone}18` }]}>
        <Ionicons name={icon} size={20} color={resolvedTone} />
      </View>
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption">{label}</AppText>
    </>
  );

  if (!onPress) return <View style={tileStyle}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [tileStyle, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
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
