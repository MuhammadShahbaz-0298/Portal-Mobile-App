// Page-level form error placed above the submit action.
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function FormError({ message }) {
  const colors = useThemeColors();
  if (!message) return null;
  return (
    <View style={[styles.box, { backgroundColor: colors.dangerSoft }]}>
      <AppText variant="error">{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
