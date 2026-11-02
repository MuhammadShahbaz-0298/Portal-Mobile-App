// Page title, short description, and an optional action.
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { spacing } from '../../constants/theme';

export function PageHeader({ title, subtitle, action }) {
  return (
    <View style={styles.header}>
      <View style={styles.text}>
        <AppText variant="title">{title}</AppText>
        {subtitle ? <AppText variant="small">{subtitle}</AppText> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  text: { flex: 1, gap: spacing.xs },
});
