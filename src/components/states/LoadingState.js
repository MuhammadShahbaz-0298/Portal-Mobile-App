// Inline loading state for screens and sections.
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText } from '../ui/AppText';
import { COMMON } from '../../constants/strings';
import { colors, spacing } from '../../constants/theme';

export function LoadingState({ label = COMMON.loading }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.brand} />
      <AppText variant="small">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
});
