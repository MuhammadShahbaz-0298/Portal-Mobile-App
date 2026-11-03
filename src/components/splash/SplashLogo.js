// Splash hero: the logo alone on the brand background, same centered size as
// the native splash image so there is no jump. No glow, no scale-in.
// reduceMotion renders the same static logo; nothing animates.
import { Image, StyleSheet, View } from 'react-native';
import { splashSizes } from '../../constants/theme';

export function SplashLogo() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/brand/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  logo: { width: splashSizes.logo, height: splashSizes.logo },
});