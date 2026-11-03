// Account lifecycle actions: reset password, activate/deactivate, archive/restore, delete.
// The screen decides which actions are available; this just renders the buttons.
import { View, StyleSheet } from 'react-native';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { USERS, COMMON } from '../../constants/strings';
import { spacing } from '../../constants/theme';

export function UserActionsCard({
  archived,
  active,
  onReset,
  onToggleActive,
  onArchive,
  onRestore,
  onDelete,
}) {
  return (
    <Card>
      <AppText variant="subtitle">{COMMON.actions}</AppText>
      <View style={styles.actions}>
        <Button title={USERS.resetPassword} variant="secondary" compact onPress={onReset} style={styles.action} />
        <Button
          title={archived || !active ? USERS.activate : USERS.deactivate}
          variant="secondary"
          compact
          onPress={onToggleActive}
          style={styles.action}
        />
        {archived ? (
          <Button title={COMMON.restore} variant="secondary" compact onPress={onRestore} style={styles.action} />
        ) : (
          <Button title={COMMON.archive} variant="secondary" compact onPress={onArchive} style={styles.action} />
        )}
        <Button title={COMMON.delete} variant="danger" compact onPress={onDelete} style={styles.action} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: { flexGrow: 1 },
});
