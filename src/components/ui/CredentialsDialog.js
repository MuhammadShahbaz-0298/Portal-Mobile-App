// Shows a one-time password and copies it without logging it.
import { Modal, StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { AppText } from './AppText';
import { Button } from './Button';
import { Row } from './Row';
import { USERS, COMMON } from '../../constants/strings';
import { colors, radius, spacing } from '../../constants/theme';

export function CredentialsDialog({ visible, name, email, password, onClose }) {
  async function copy() {
    await Clipboard.setStringAsync(password);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
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
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
});
