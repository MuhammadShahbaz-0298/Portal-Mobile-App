// Inline banner for guidance, warnings, errors, or success messages.
// Reused on login and form pages instead of a toast.
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

const icons = {
  info: 'information-circle-outline',
  warning: 'warning-outline',
  danger: 'alert-circle-outline',
  success: 'checkmark-circle-outline',
};

export function InfoBanner({ tone = 'info', text }) {
  const colors = useThemeColors();
  if (!text) return null;
  const tones = {
    info: { background: colors.brandSoft, icon: colors.brandDark, text: colors.brandDark },
    warning: { background: colors.warningSoft, icon: colors.warning, text: colors.warning },
    danger: { background: colors.dangerSoft, icon: colors.danger, text: colors.danger },
    success: { background: colors.successSoft, icon: colors.success, text: colors.success },
  };
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
