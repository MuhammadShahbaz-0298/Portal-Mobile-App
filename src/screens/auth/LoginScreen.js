// Sign-in screen. Tokens stay in SecureStore; this screen only holds form state.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { InfoBanner } from '../../components/ui/InfoBanner';
import { useAuth } from '../../hooks/useAuth';
import { AUTH, COMMON } from '../../constants/strings';
import { APP } from '../../constants/app';
import { getErrorMessage } from '../../utils/errors';
import { firstError, required, validEmail } from '../../utils/validators';
import { colors, radius, spacing } from '../../constants/theme';

export function LoginScreen() {
  const { login, notice, clearNotice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    const nextErrors = {
      email: validEmail(email),
      password: required(password, COMMON.password),
    };
    setErrors(nextErrors);
    setSubmitError('');
    clearNotice();
    if (firstError(nextErrors)) return;

    setBusy(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen edges={['top', 'left', 'right']} contentStyle={styles.content}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Ionicons name="school-outline" size={32} color={colors.brandDark} />
        </View>
        <AppText variant="title">{APP.name}</AppText>
        <AppText variant="small" style={styles.center}>
          {APP.tagline}
        </AppText>
      </View>

      {notice ? <InfoBanner tone="warning" text={notice} /> : null}

      <View style={styles.form}>
        <AppText variant="subtitle">{AUTH.loginTitle}</AppText>
        <AppText variant="small">{AUTH.loginSubtitle}</AppText>
        <Input
          label={AUTH.emailLabel}
          value={email}
          onChangeText={setEmail}
          placeholder={AUTH.emailPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy}
          error={errors.email}
        />
        <Input
          label={AUTH.passwordLabel}
          value={password}
          onChangeText={setPassword}
          placeholder={AUTH.passwordPlaceholder}
          secure
          editable={!busy}
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.password}
          onSubmitEditing={onSubmit}
          returnKeyType="go"
        />
        <FormError message={submitError} />
        <Button
          title={busy ? AUTH.signingIn : AUTH.signIn}
          onPress={onSubmit}
          loading={busy}
        />
        <AppText variant="caption" style={styles.center}>
          {AUTH.noAccount}
        </AppText>
      </View>

      <AppText variant="caption" style={styles.center}>
        {APP.version}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', gap: spacing.lg },
  brand: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  center: { textAlign: 'center' },
  form: { gap: spacing.md },
});
