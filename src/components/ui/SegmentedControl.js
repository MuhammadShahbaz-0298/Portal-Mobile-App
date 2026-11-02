// Compact segmented selector for short status lists.
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, layout, radius, spacing } from '../../constants/theme';

export function SegmentedControl({ options = [], value, onChange }) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.item, selected && styles.selected]}
          >
            <AppText
              variant="label"
              style={selected ? styles.selectedText : styles.text}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
  },
  item: {
    flex: 1,
    minHeight: layout.touchTarget,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  selected: { backgroundColor: colors.surface },
  text: { color: colors.muted },
  selectedText: { color: colors.brandDark },
});
