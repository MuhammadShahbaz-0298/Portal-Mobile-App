// Banner shown while the server is waking up (Render free tier can sleep ~1 minute).
// Reads the wake state from AuthContext so every screen benefits automatically.
import { StyleSheet, View } from 'react-native';
import { InfoBanner } from './InfoBanner';
import { ERRORS } from '../../constants/strings';
import { spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

export function ServerWakingBanner() {
  const { serverWaking } = useAuth();
  if (!serverWaking) {
    return null;
  }
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <InfoBanner tone="info" text={ERRORS.serverWaking} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
  },
});
