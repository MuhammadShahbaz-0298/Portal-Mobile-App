// Search field with a leading icon and optional clear action.
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COMMON } from '../../constants/strings';
import { layout, radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function SearchBar({ value, onChangeText, placeholder = COMMON.searchPlaceholder }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.box, { borderColor: colors.line, backgroundColor: colors.surface }]}>
      <Ionicons name="search" size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, { color: colors.ink }]}
        accessibilityLabel={COMMON.search}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={COMMON.clear}
          onPress={() => onChangeText('')}
          style={styles.clear}
        >
          <Ionicons name="close-circle" size={18} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: layout.inputHeight,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: spacing.sm },
  clear: { padding: spacing.xs },
});
