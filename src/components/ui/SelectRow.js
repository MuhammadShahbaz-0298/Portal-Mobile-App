// Simple picker row that opens a modal list. Kept in JS with minimal state.
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Button } from './Button';
import { COMMON } from '../../constants/strings';
import { colors, layout, radius, spacing } from '../../constants/theme';

export function SelectRow({
  label,
  value,
  valueLabel,
  options = [],
  onChange,
  error,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={[styles.row, error && styles.rowError]}
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
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
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
                style={styles.option}
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
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowError: { borderColor: colors.danger },
  text: { flex: 1, gap: 2 },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
  },
  title: { textAlign: 'center' },
  list: { maxHeight: 320 },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
