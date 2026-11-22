// Accessible pressable button with loading state and four visual variants.
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { layout, radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  compact = false,
}) {
  const colors = useThemeColors();
  const variants = {
    primary: { background: colors.brand, border: colors.brand, text: colors.white },
    secondary: { background: colors.surface, border: colors.line, text: colors.ink },
    danger: { background: colors.dangerSoft, border: colors.dangerSoft, text: colors.danger },
    ghost: { background: colors.transparent, border: colors.transparent, text: colors.brand },
  };
  const tone = variants[variant] || variants.primary;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        {
          backgroundColor: tone.background,
          borderColor: tone.border,
          opacity: isDisabled ? 0.55 : pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tone.text} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={18} color={tone.text} /> : null}
          <AppText variant="button" style={{ color: tone.text }}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.touchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { minHeight: layout.touchTarget, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
