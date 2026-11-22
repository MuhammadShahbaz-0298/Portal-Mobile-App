// Error state always offers a retry path.
// When the app is offline it shows the offline state instead, wired through
// the shared OfflineContext; every screen gets this behaviour automatically.
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { OfflineState } from './OfflineState';
import { useOffline } from '../../context/OfflineContext';
import { COMMON } from '../../constants/strings';
import { radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function ErrorState({ message, onRetry }) {
  const { isOffline } = useOffline();
  const colors = useThemeColors();

  if (isOffline) return <OfflineState onRetry={onRetry} />;

  return (
    <View style={styles.container}>
      <View style={[styles.icon, { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name="alert-circle-outline" size={28} color={colors.danger} />
      </View>
      <AppText variant="subtitle" style={styles.center}>
        {message}
      </AppText>
      {onRetry ? (
        <Button title={COMMON.retry} onPress={onRetry} variant="secondary" compact />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
});