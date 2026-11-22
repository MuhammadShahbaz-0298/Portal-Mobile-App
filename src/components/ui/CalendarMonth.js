// Month grid for the date picker. Pure JS so the app needs no native date library.
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { layout, radius } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const WEEKDAYS = Array.from({ length: 7 }, (_, index) =>
  weekdayFormatter.format(new Date(2024, 0, 7 + index))
);

function sameDay(first, second) {
  if (!first || !second) return false;
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function dayValue(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function isOutsideRange(date, minimumDate, maximumDate) {
  const value = dayValue(date);
  if (minimumDate && value < dayValue(minimumDate)) return true;
  if (maximumDate && value > dayValue(maximumDate)) return true;
  return false;
}

function buildCells(month) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const leading = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, monthIndex, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function CalendarMonth({ month, value, minimumDate, maximumDate, onSelect }) {
  const cells = buildCells(month);
  const colors = useThemeColors();

  return (
    <View>
      <View style={styles.week}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekCell}>
            <AppText variant="caption">{day}</AppText>
          </View>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.cell} />;
          }
          const selected = sameDay(date, value);
          const disabled = isOutsideRange(date, minimumDate, maximumDate);
          return (
            <Pressable
              key={date.getTime()}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => onSelect(date)}
              style={[
                styles.cell,
                styles.day,
                selected && { backgroundColor: colors.brand },
              ]}
            >
              <AppText
                variant="small"
                style={[
                  { color: disabled ? colors.line : selected ? colors.white : colors.inkSoft },
                  selected && styles.selectedText,
                ]}
              >
                {date.getDate()}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  week: { flexDirection: 'row' },
  weekCell: {
    width: `${100 / 7}%`,
    minHeight: layout.compactTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    minHeight: layout.compactTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: { borderRadius: radius.pill },
  selectedText: { fontWeight: '700' },
});
