// Surface container used for rows, forms, and grouped content.
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../../constants/theme';

export function Card({ children, onPress, style, accessibilityLabel }) {
  const content = <View style={[styles.card, style]}>{children}</View>;
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
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow.card,
  },
});
