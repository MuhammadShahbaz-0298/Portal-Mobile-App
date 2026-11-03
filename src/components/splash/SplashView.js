// Layout shell for the splash. Paints the brand background identical to the
// native splash (app.json) and stacks logo, copy and loader.
import { StyleSheet, View } from 'react-native';
import { AppText } from '../ui/AppText';
import { SplashLogo } from './SplashLogo';
import { SplashText } from './SplashText';
import { PulsingDots } from './PulsingDots';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { OFFLINE } from '../../constants/strings';
import { colors, spacing } from '../../constants/theme';

export function SplashView({ showServerWait = false }) {
  const reduceMotion = useReduceMotion();

  return (
    <View style={styles.screen}>
      <SplashLogo />
      <SplashText reduceMotion={reduceMotion} />
      {showServerWait ? (
        <AppText variant="small" style={styles.wait}>
          {OFFLINE.serverWait}
        </AppText>
      ) : null}
      <PulsingDots reduceMotion={reduceMotion} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.xl,
  },
  wait: { color: colors.whiteSoft, textAlign: 'center' },
});