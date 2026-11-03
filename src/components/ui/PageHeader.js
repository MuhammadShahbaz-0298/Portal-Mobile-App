// Page title, short description, and an optional action in a branded banner.
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../../constants/theme';

export function PageHeader({ title, subtitle, action }) {
  return (
    <View style={styles.banner}>
      <View style={styles.accent} />
      <View pointerEvents="none" style={styles.watermark}>
        <Ionicons name="school" size={104} color={colors.brand} />
      </View>
      <AppText variant="title" style={styles.title} accessibilityRole="header">
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="small" style={styles.subtitle}>
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
    backgroundColor: colors.brandSoft,
    borderWidth: 1,
    borderColor: colors.whiteSoft,
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
    backgroundColor: colors.brand,
  },
  watermark: {
    position: 'absolute',
    right: -spacing.xl,
    bottom: -spacing.xl,
    opacity: 0.08,
  },
  title: { color: colors.brandDark },
  subtitle: { color: colors.inkSoft },
  action: { marginTop: spacing.sm, alignItems: 'flex-start' },
});
