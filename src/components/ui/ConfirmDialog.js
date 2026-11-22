// Confirmation dialog for archive, delete, reset, and sign-out actions.
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { Button } from './Button';
import { COMMON } from '../../constants/strings';
import { radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel = COMMON.confirm,
  cancelLabel = COMMON.cancel,
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const colors = useThemeColors();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <AppText variant="subtitle">{title}</AppText>
          {body ? <AppText variant="small">{body}</AppText> : null}
          <View style={styles.actions}>
            <Button
              title={cancelLabel}
              variant="secondary"
              onPress={onCancel}
              disabled={loading}
              style={styles.action}
            />
            <Button
              title={confirmLabel}
              variant={danger ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={loading}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  action: { flex: 1 },
});
