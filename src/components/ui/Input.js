// Labeled text input with inline error and an optional password visibility toggle.
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { AUTH } from '../../constants/strings';
import { layout, radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function Input({
  label,
  value,
  onChangeText,
  error,
  hint,
  secure = false,
  multiline = false,
  style,
  editable = true,
  ...rest
}) {
  const [visible, setVisible] = useState(false);
  const colors = useThemeColors();

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <AppText variant="label">{label}</AppText> : null}
      <View
        style={[
          styles.box,
          {
            borderColor: error ? colors.danger : colors.line,
            backgroundColor: editable ? colors.surface : colors.surfaceMuted,
          },
          multiline && styles.multilineBox,
        ]}
      >
        <TextInput
          {...rest}
          editable={editable}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !visible}
          multiline={multiline}
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.ink }, multiline && styles.multilineInput]}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? AUTH.hidePassword : AUTH.showPassword}
            onPress={() => setVisible((current) => !current)}
            style={styles.action}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <AppText variant="error">{error}</AppText> : null}
      {!error && hint ? <AppText variant="caption">{hint}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  box: {
    minHeight: layout.inputHeight,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  multilineBox: { minHeight: 110, alignItems: 'flex-start' },
  input: {
    flex: 1,
    minHeight: layout.inputHeight - 2,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  multilineInput: { minHeight: 100, textAlignVertical: 'top' },
  action: { padding: spacing.sm, marginRight: -spacing.sm },
});
