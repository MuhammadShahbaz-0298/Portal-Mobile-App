// Inline banner for guidance, warnings, or errors.
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../../constants/theme';

const tones = {
  info: { background: colors.brandSoft, icon: colors.brandDark, text: colors.brandDark },
  warning: {
    background: colors.warningSoft,
    icon: colors.warning,
    text: colors.warning,
  },
  danger: { background: colors.dangerSoft, icon: colors.danger, text: colors.danger },
  success: {
    background: colors.successSoft,
    icon: colors.success,
    text: colors.success,
  },
};

const icons = {
  info: 'information-circle-outline',
  warning: 'warning-outline',
  danger: 'alert-circle-outline',
  success: 'checkmark-circle-outline',
};

export function InfoBanner({ tone = 'info', text }) {
  if (!text) return null;
  const style = tones[tone];
  return (
    <View style={[styles.banner, { backgroundColor: style.background }]}>
      <Ionicons name={icons[tone]} size={18} color={style.icon} />
      <AppText variant="small" style={[styles.text, { color: style.text }]}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  text: { flex: 1 },
});
