// Shows a one-time password and copies it without logging it.
import { Modal, StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { AppText } from './AppText';
import { Button } from './Button';
import { Row } from './Row';
import { USERS, COMMON } from '../../constants/strings';
import { radius, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function CredentialsDialog({ visible, name, email, password, onClose }) {
  const colors = useThemeColors();

  async function copy() {
    await Clipboard.setStringAsync(password);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <AppText variant="subtitle">{USERS.credentialsTitle}</AppText>
          <AppText variant="small">{USERS.credentialsBody}</AppText>
          <Row label={COMMON.name} value={name} />
          <Row label={COMMON.email} value={email} />
          <Row label={USERS.temporaryPassword} value={password} />
          <Button
            title={USERS.copyPassword}
            variant="secondary"
            onPress={copy}
          />
          <Button title={COMMON.done} onPress={onClose} />
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
});
