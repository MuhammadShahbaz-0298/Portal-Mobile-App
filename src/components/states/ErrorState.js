// Error state always offers a retry path.
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { COMMON } from '../../constants/strings';
import { colors, radius, spacing } from '../../constants/theme';

export function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
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
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
});
