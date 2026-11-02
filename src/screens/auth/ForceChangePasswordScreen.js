// Required password change after an administrator reset.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { InfoBanner } from '../../components/ui/InfoBanner';
import { useAuth } from '../../hooks/useAuth';
import { AUTH, COMMON, VALIDATION } from '../../constants/strings';
import { getErrorMessage } from '../../utils/errors';
import {
  firstError,
  minLength,
  passwordsMatch,
  required,
  validPassword,
} from '../../utils/validators';
import { spacing } from '../../constants/theme';

export function ForceChangePasswordScreen() {
  const { changeForcedPassword, logout, user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    const nextErrors = {
      currentPassword: required(currentPassword, AUTH.currentPassword),
      newPassword:
        validPassword(newPassword, AUTH.newPassword) ||
        (newPassword === currentPassword ? VALIDATION.passwordDifferent : ''),
      confirmPassword:
        minLength(confirmPassword, AUTH.confirmPassword, 8) ||
        passwordsMatch(newPassword, confirmPassword),
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (firstError(nextErrors)) return;

    setBusy(true);
    try {
      await changeForcedPassword(currentPassword, newPassword);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen edges={['top', 'left', 'right']} contentStyle={styles.content}>
      <View style={styles.header}>
        <AppText variant="title">{AUTH.forceTitle}</AppText>
        <AppText variant="small">{AUTH.forceSubtitle}</AppText>
      </View>
      {user?.name ? <InfoBanner text={AUTH.signedInAs(user.name)} /> : null}
      <View style={styles.form}>
        <Input
          label={AUTH.currentPassword}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secure
          editable={!busy}
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.currentPassword}
        />
        <Input
          label={AUTH.newPassword}
          value={newPassword}
          onChangeText={setNewPassword}
          secure
          editable={!busy}
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.newPassword}
          hint={VALIDATION.passwordLength}
        />
        <Input
          label={AUTH.confirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secure
          editable={!busy}
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.confirmPassword}
        />
        <FormError message={submitError} />
        <Button
          title={busy ? AUTH.changingPassword : AUTH.changePassword}
          onPress={onSubmit}
          loading={busy}
        />
        <Button title={COMMON.signOut} variant="ghost" onPress={logout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', gap: spacing.lg },
  header: { gap: spacing.sm },
  form: { gap: spacing.md },
});
