// Status pill with a consistent color for API status values.
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../../constants/theme';

const tones = {
  success: { background: colors.successSoft, text: colors.success },
  warning: { background: colors.warningSoft, text: colors.warning },
  danger: { background: colors.dangerSoft, text: colors.danger },
  neutral: { background: colors.surfaceMuted, text: colors.muted },
  brand: { background: colors.brandSoft, text: colors.brandDark },
};

const statusTone = {
  present: 'success',
  graded: 'success',
  active: 'success',
  submitted: 'warning',
  leave: 'warning',
  rejected: 'danger',
  absent: 'danger',
  archived: 'neutral',
  inactive: 'neutral',
  disabled: 'neutral',
};

export function Badge({ label, tone, status }) {
  if (!label) return null;
  const resolved = tones[tone || statusTone[status] || 'brand'];
  return (
    <View style={[styles.badge, { backgroundColor: resolved.background }]}>
      <AppText variant="caption" style={{ color: resolved.text }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});
