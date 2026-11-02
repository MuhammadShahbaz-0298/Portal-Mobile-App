// Role card with system/custom marker and permission count.
import { StyleSheet, View } from 'react-native';
import { Card } from '../ui/Card';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { ROLE_LABELS } from '../../constants/permissions';
import { ROLES } from '../../constants/strings';
import { spacing } from '../../constants/theme';

const coreRoles = ['admin', 'teacher', 'student'];

export function RoleCard({ role, onPress }) {
  const core = coreRoles.includes(role.name);
  return (
    <Card onPress={onPress}>
      <View style={styles.top}>
        <View style={styles.text}>
          <AppText variant="subtitle">{role.label || ROLE_LABELS[role.name] || role.name}</AppText>
          <AppText variant="caption">{role.name}</AppText>
        </View>
        <Badge
          label={core ? ROLES.systemRole : ROLES.customRole}
          tone={core ? 'brand' : 'neutral'}
        />
      </View>
      <AppText variant="small">
        {ROLES.permissionsLabel}: {role.permissions?.length || 0}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  text: { flex: 1, gap: 2 },
});
