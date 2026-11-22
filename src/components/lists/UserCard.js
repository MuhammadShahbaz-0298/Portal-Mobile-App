// User summary card with role and account state.
import { StyleSheet, View } from 'react-native';
import { Card } from '../ui/Card';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { ROLE_LABELS } from '../../constants/permissions';
import { USERS } from '../../constants/strings';
import { spacing } from '../../constants/theme';

export function UserCard({ user, onPress }) {
  const role = ROLE_LABELS[user.role] || user.role;
  const archived = user.archivedAt || user.active === false;

  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <Avatar name={user.name} />
        <View style={styles.text}>
          <AppText variant="subtitle">{user.name}</AppText>
          <AppText variant="small">{user.email}</AppText>
          <View style={styles.badges}>
            <Badge label={role} tone="brand" />
            <Badge
              label={archived ? USERS.archived : USERS.active}
              status={archived ? 'archived' : 'active'}
            />
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  text: { flex: 1, gap: 2 },
  badges: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
});
