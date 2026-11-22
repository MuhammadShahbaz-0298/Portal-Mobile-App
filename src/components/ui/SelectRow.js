// Simple picker row that opens a modal list. Kept in JS with minimal state.
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Button } from './Button';
import { COMMON } from '../../constants/strings';
import { layout, radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function SelectRow({
  label,
  value,
  valueLabel,
  options = [],
  onChange,
  error,
}) {
  const [open, setOpen] = useState(false);
  const colors = useThemeColors();

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={[
          styles.row,
          {
            borderColor: error ? colors.danger : colors.line,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <View style={styles.text}>
          {label ? <AppText variant="label">{label}</AppText> : null}
          <AppText variant={valueLabel ? 'body' : 'small'}>
            {valueLabel || COMMON.selectOption}
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
      {error ? <AppText variant="error">{error}</AppText> : null}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={() => setOpen(false)}
        />
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: colors.line }]} />
          <AppText variant="subtitle" style={styles.title}>
            {label || COMMON.filter}
          </AppText>
          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {options.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={[styles.option, { borderTopColor: colors.line }]}
              >
                <AppText variant="body">{option.label}</AppText>
                {option.value === value ? (
                  <Ionicons name="checkmark" size={18} color={colors.brand} />
                ) : null}
              </Pressable>
            ))}
            {!options.length ? (
              <AppText variant="small">{COMMON.noResults}</AppText>
            ) : null}
          </ScrollView>
          <Button
            title={COMMON.cancel}
            variant="secondary"
            onPress={() => setOpen(false)}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: layout.inputHeight,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: { flex: 1, gap: 2 },
  backdrop: { flex: 1 },
  sheet: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.pill,
  },
  title: { textAlign: 'center' },
  list: { maxHeight: 320 },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
  },
});
