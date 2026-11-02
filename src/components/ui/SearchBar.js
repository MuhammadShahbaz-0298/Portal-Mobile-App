// Search field with a leading icon and optional clear action.
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COMMON } from '../../constants/strings';
import { colors, layout, radius, spacing } from '../../constants/theme';

export function SearchBar({ value, onChangeText, placeholder = COMMON.searchPlaceholder }) {
  return (
    <View style={styles.box}>
      <Ionicons name="search" size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
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
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: { flex: 1, color: colors.ink, fontSize: 16, paddingVertical: spacing.sm },
  clear: { padding: spacing.xs },
});
