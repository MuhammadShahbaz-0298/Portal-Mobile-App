// Profile details, effective permissions, and self-service password change.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/ui/Screen';
import { PageHeader } from '../components/ui/PageHeader';
import { AppText } from '../components/ui/AppText';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Row } from '../components/ui/Row';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { FormError } from '../components/ui/FormError';
import { SectionTitle } from '../components/ui/SectionTitle';
import { PermissionState } from '../components/states/PermissionState';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import {
  PERMISSION_LABELS,
  PERMISSIONS,
  ROLE_LABELS,
  hasPermission,
} from '../constants/permissions';
import { PROFILE, COMMON, VALIDATION } from '../constants/strings';
import { formatDate } from '../utils/dates';
import { getErrorMessage } from '../utils/errors';
import { getDisplayName } from '../utils/ids';
import { required, passwordsMatch, validPassword } from '../utils/validators';
import { spacing } from '../constants/theme';

export function ProfileScreen() {
  const { user, changeOwnPassword, refreshUser } = useAuth();
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!hasPermission(user, PERMISSIONS.PROFILE_VIEW)) {
    return <Screen><PermissionState /></Screen>;
  }

  async function onSave() {
    const nextErrors = {
      currentPassword: required(currentPassword, PROFILE.currentPassword),
      newPassword: validPassword(newPassword, PROFILE.newPassword),
      confirmPassword: passwordsMatch(newPassword, confirmPassword),
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.values(nextErrors).find(Boolean)) return;

    setBusy(true);
    try {
      await changeOwnPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast(PROFILE.updatedPassword);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <PageHeader title={PROFILE.title} subtitle={PROFILE.subtitle} />
      <Card>
        <View style={styles.identity}>
          <Avatar name={getDisplayName(user)} size={56} />
          <View style={styles.identityText}>
            <AppText variant="title">{getDisplayName(user)}</AppText>
            <AppText variant="small">{user?.email}</AppText>
            <Badge
              label={ROLE_LABELS[user?.role] || user?.role}
              tone="brand"
            />
          </View>
        </View>
        {user?.createdAt ? (
          <Row label={PROFILE.accountSince} value={formatDate(user.createdAt)} />
        ) : null}
      </Card>

      <SectionTitle title={PROFILE.permissions} />
      <Card>
        {(user?.permissions || []).length ? (
          <View style={styles.permissions}>
            {(user.permissions || []).map((permission) => (
              <Badge
                key={permission}
                label={PERMISSION_LABELS[permission] || permission}
              />
            ))}
          </View>
        ) : (
          <AppText variant="small">{PROFILE.noPermissions}</AppText>
        )}
      </Card>

      <SectionTitle title={PROFILE.security} />
      <Input
        label={PROFILE.currentPassword}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secure
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.currentPassword}
      />
      <Input
        label={PROFILE.newPassword}
        value={newPassword}
        onChangeText={setNewPassword}
        secure
        autoCapitalize="none"
        autoCorrect={false}
        hint={VALIDATION.passwordLength}
        error={errors.newPassword}
      />
      <Input
        label={PROFILE.confirmPassword}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secure
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.confirmPassword}
      />
      <FormError message={submitError} />
      <Button
        title={busy ? COMMON.saving : PROFILE.updatePassword}
        onPress={onSave}
        loading={busy}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  identityText: { flex: 1, gap: spacing.xs, alignItems: 'flex-start' },
  permissions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
