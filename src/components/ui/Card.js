// Surface container used for rows, forms, and grouped content.
import { Pressable, StyleSheet, View } from 'react-native';
import { radius, shadow, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function Card({ children, onPress, style, accessibilityLabel }) {
  const palette = useThemeColors();
  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.line },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow.card,
  },
});
