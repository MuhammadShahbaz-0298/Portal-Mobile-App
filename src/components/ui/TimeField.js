// Time field: a selectable row that opens side-by-side hour and minute lists.
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Button } from './Button';
import { COMMON, PICKER } from '../../constants/strings';
import { layout, radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { formatTimeInput } from '../../utils/dates';

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));
const ROW_HEIGHT = layout.touchTarget;
const FALLBACK = '23:59';

function splitValue(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value || '');
  if (!match) return FALLBACK.split(':');
  return [match[1], match[2]];
}

export function TimeField({
  label,
  value,
  onChange,
  error,
  placeholder,
  style,
}) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(FALLBACK.split(':')[0]);
  const [minute, setMinute] = useState(FALLBACK.split(':')[1]);
  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const colors = useThemeColors();
  const display = value ? formatTimeInput(value) : placeholder || PICKER.chooseTime;

  useEffect(() => {
    if (!open) return;
    hourRef.current?.scrollTo({ y: Number(hour) * ROW_HEIGHT, animated: false });
    minuteRef.current?.scrollTo({ y: Number(minute) * ROW_HEIGHT, animated: false });
  }, [open, hour, minute]);

  function openPicker() {
    const [nextHour, nextMinute] = splitValue(value);
    setHour(nextHour);
    setMinute(nextMinute);
    setOpen(true);
  }

  function confirm() {
    onChange(`${hour}:${minute}`);
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
        <Ionicons name="time-outline" size={20} color={colors.muted} />
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
            {PICKER.selectTime}
          </AppText>
          <View style={styles.columns}>
            <View style={styles.column}>
              <AppText variant="caption" style={styles.columnLabel}>
                {PICKER.hours}
              </AppText>
              <ScrollView
                ref={hourRef}
                style={[styles.list, { borderColor: colors.line }]}
                keyboardShouldPersistTaps="handled"
              >
                {HOURS.map((item) => (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected: item === hour }}
                    onPress={() => setHour(item)}
                    style={[
                      styles.option,
                      item === hour && { backgroundColor: colors.brandSoft },
                    ]}
                  >
                    <AppText
                      variant="body"
                      style={item === hour ? { color: colors.brand, fontWeight: '700' } : undefined}
                    >
                      {item}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <View style={styles.column}>
              <AppText variant="caption" style={styles.columnLabel}>
                {PICKER.minutes}
              </AppText>
              <ScrollView
                ref={minuteRef}
                style={[styles.list, { borderColor: colors.line }]}
                keyboardShouldPersistTaps="handled"
              >
                {MINUTES.map((item) => (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected: item === minute }}
                    onPress={() => setMinute(item)}
                    style={[
                      styles.option,
                      item === minute && { backgroundColor: colors.brandSoft },
                    ]}
                  >
                    <AppText
                      variant="body"
                      style={item === minute ? { color: colors.brand, fontWeight: '700' } : undefined}
                    >
                      {item}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={styles.footer}>
            <Button
              title={COMMON.cancel}
              variant="secondary"
              onPress={() => setOpen(false)}
              style={styles.flex}
            />
            <Button title={COMMON.done} onPress={confirm} style={styles.flex} />
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
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.pill,
  },
  title: { textAlign: 'center' },
  columns: { flexDirection: 'row', gap: spacing.md },
  column: { flex: 1, gap: spacing.xs },
  columnLabel: { textAlign: 'center' },
  list: { height: ROW_HEIGHT * 5, borderWidth: 1, borderRadius: radius.md },
  option: {
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
