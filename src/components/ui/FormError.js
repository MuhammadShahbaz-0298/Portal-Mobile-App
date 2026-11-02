// Page-level form error placed above the submit action.
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../../constants/theme';

export function FormError({ message }) {
  if (!message) return null;
  return (
    <View style={styles.box}>
      <AppText variant="error">{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
