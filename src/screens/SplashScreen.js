// Shown while SecureStore and the session probe complete.
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../components/ui/AppText';
import { APP } from '../constants/app';
import { COMMON } from '../constants/strings';
import { colors, radius, spacing } from '../constants/theme';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons name="school-outline" size={36} color={colors.brandDark} />
      </View>
      <AppText variant="heading">{APP.name}</AppText>
      <ActivityIndicator color={colors.brand} />
      <AppText variant="caption">{COMMON.loading}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
});
