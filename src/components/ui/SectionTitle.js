// Small heading used to separate groups of content.
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { spacing } from '../../constants/theme';

export function SectionTitle({ title, action }) {
  return (
    <View style={styles.row}>
      <AppText variant="subtitle">{title}</AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
