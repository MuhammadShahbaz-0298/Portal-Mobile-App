// Branded loading view shown while the saved session is restored from SecureStore.
// Mirrors the native splash (same brand blue) so there is no color jump.
import { Image, StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { APP } from '../../constants/app';
import { SPLASH } from '../../constants/strings';
import { colors, spacing, splashSizes } from '../../constants/theme';

const LOGO = require('../../../assets/brand/logo.png');

export function SplashView() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.body}>
        <View style={styles.center}>
          <Image source={LOGO} style={styles.logo} accessibilityLabel={APP.name} />
          <AppText variant="title" style={styles.name}>{APP.name}</AppText>
          <AppText variant="small" style={styles.tagline}>{APP.tagline}</AppText>
        </View>
        <ActivityIndicator
          color={colors.white}
          size="large"
          style={styles.spinner}
          accessibilityLabel={SPLASH.spinnerLabel}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.brand },
  body: { flex: 1, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  logo: { width: splashSizes.logo, height: splashSizes.logo, marginBottom: spacing.lg },
  name: { color: colors.white },
  tagline: { color: colors.whiteSoft },
  spinner: { marginBottom: splashSizes.spinnerMargin },
});
