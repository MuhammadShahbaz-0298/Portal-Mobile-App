// Offline banner shown at the top of every screen when the app is offline.
// Cached/visible content above stays usable; tapping it retries a refresh.
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useOffline } from '../../context/OfflineContext';
import { OFFLINE } from '../../constants/strings';
import { colors, spacing } from '../../constants/theme';

export function OfflineBanner() {
  const { isOffline } = useOffline();
  if (!isOffline) return null;
  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={18} color={colors.warning} />
      <AppText variant="small" style={styles.text}>
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
    backgroundColor: colors.warningSoft,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  text: { color: colors.warning, flex: 1 },
});