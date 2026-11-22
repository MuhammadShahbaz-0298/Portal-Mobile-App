// Page title, short description, and an optional action in a branded banner.
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function PageHeader({ title, subtitle, action }) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: colors.brandSoft, borderColor: colors.whiteSoft },
      ]}
    >
      <View style={[styles.accent, { backgroundColor: colors.brand }]} />
      <View pointerEvents="none" style={styles.watermark}>
        <Ionicons name="school" size={104} color={colors.brand} />
      </View>
      <AppText variant="title" style={{ color: colors.brandDark }} accessibilityRole="header">
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="small" style={{ color: colors.inkSoft }}>
          {subtitle}
        </AppText>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    paddingLeft: spacing.lg + spacing.xs,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: spacing.xs,
  },
  watermark: {
    position: 'absolute',
    right: -spacing.xl,
    bottom: -spacing.xl,
    opacity: 0.08,
  },
  action: { marginTop: spacing.sm, alignItems: 'flex-start' },
});
