// Date field: a selectable row that opens a month calendar, with no native dependency.
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Button } from './Button';
import { CalendarMonth } from './CalendarMonth';
import { COMMON, PICKER } from '../../constants/strings';
import { layout, radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import {
  addMonths,
  formatDate,
  fromDateInput,
  monthLabel,
  toDateInput,
} from '../../utils/dates';

export function DateField({
  label,
  value,
  onChange,
  error,
  placeholder,
  allowClear = false,
  minimumDate,
  maximumDate,
  style,
}) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const colors = useThemeColors();
  const selected = fromDateInput(value);
  const display = value ? formatDate(value) : placeholder || PICKER.chooseDate;

  function openPicker() {
    const base = selected || new Date();
    setVisibleMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setOpen(true);
  }

  function selectDate(date) {
    onChange(toDateInput(date));
    setOpen(false);
  }

  function clearDate() {
    onChange('');
    setOpen(false);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ? `${label}: ${display}` : display}
        onPress={openPicker}
        style={[
          styles.row,
          {
            borderColor: error ? colors.danger : colors.line,
            backgroundColor: colors.surface,
          },
          style,
        ]}
      >
        <View style={styles.text}>
          {label ? <AppText variant="label">{label}</AppText> : null}
          <AppText variant={value ? 'body' : 'small'}>{display}</AppText>
        </View>
        <Ionicons name="calendar-outline" size={20} color={colors.muted} />
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
            {PICKER.selectDate}
          </AppText>
          <View style={styles.monthRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={PICKER.previousMonth}
              onPress={() => setVisibleMonth(addMonths(visibleMonth, -1))}
              style={styles.nav}
            >
              <Ionicons name="chevron-back" size={20} color={colors.ink} />
            </Pressable>
            <AppText variant="body" style={styles.month}>
              {monthLabel(visibleMonth)}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={PICKER.nextMonth}
              onPress={() => setVisibleMonth(addMonths(visibleMonth, 1))}
              style={styles.nav}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.ink} />
            </Pressable>
          </View>
          <ScrollView style={styles.calendar} keyboardShouldPersistTaps="handled">
            <CalendarMonth
              month={visibleMonth}
              value={selected}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onSelect={selectDate}
            />
          </ScrollView>
          <View style={styles.footer}>
            {allowClear ? (
              <Button
                title={PICKER.clearDate}
                variant="secondary"
                onPress={clearDate}
                style={styles.flex}
              />
            ) : null}
            <Button
              title={COMMON.cancel}
              variant="secondary"
              onPress={() => setOpen(false)}
              style={styles.flex}
            />
          </View>
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
    maxHeight: '92%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.pill,
  },
  title: { textAlign: 'center' },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { flex: 1, textAlign: 'center' },
  nav: {
    minHeight: layout.touchTarget,
    minWidth: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { flexDirection: 'row', gap: spacing.sm },
  calendar: { flexShrink: 1 },
  flex: { flex: 1 },
});
