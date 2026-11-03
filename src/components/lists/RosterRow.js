// One roster row: avatar, name, and email. Used by the batch roster screen.
import { StyleSheet, View } from 'react-native';
import { Avatar } from '../ui/Avatar';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';
import { spacing } from '../../constants/theme';

export function RosterRow({ student }) {
  return (
    <Card style={styles.row}>
      <Avatar name={student.name} />
      <View style={styles.text}>
        <AppText variant="body" numberOfLines={1}>{student.name}</AppText>
        <AppText variant="caption" numberOfLines={1}>{student.email}</AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: 2 },
});
