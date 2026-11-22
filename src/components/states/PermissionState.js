// Shown when a route is opened without the required permission.
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import { PERMISSION_SCREEN } from '../../constants/strings';
import { radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function PermissionState() {
  const colors = useThemeColors();
  return (
    <View style={styles.container}>
      <View style={[styles.icon, { backgroundColor: colors.warningSoft }]}>
        <Ionicons name="lock-closed-outline" size={28} color={colors.warning} />
      </View>
      <AppText variant="subtitle">{PERMISSION_SCREEN.title}</AppText>
      <AppText variant="small" style={styles.center}>
        {PERMISSION_SCREEN.body}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  center: { textAlign: 'center' },
});
