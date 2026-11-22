// Offline banner shown at the top of every screen when the app is offline.
// Cached/visible content above stays usable; tapping it retries a refresh.
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useOffline } from '../../context/OfflineContext';
import { OFFLINE } from '../../constants/strings';
import { spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function OfflineBanner() {
  const { isOffline } = useOffline();
  const colors = useThemeColors();
  if (!isOffline) return null;
  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: colors.warningSoft, borderBottomColor: colors.line },
      ]}
    >
      <Ionicons name="cloud-offline-outline" size={18} color={colors.warning} />
      <AppText variant="small" style={[styles.text, { color: colors.warning }]}>
        {OFFLINE.banner}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  text: { flex: 1 },
});