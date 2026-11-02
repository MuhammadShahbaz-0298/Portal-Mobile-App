// Edit a user, manage lifecycle, reset password, and grant extra permissions.
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Row } from '../../components/ui/Row';
import { Input } from '../../components/ui/Input';
import { SelectRow } from '../../components/ui/SelectRow';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { PermissionChecklist } from '../../components/ui/PermissionChecklist';
import { CredentialsDialog } from '../../components/ui/CredentialsDialog';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PermissionState } from '../../components/states/PermissionState';
import { ErrorState } from '../../components/states/ErrorState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useToast } from '../../context/ToastContext';
import {
  archiveUser,
  deleteUser,
  resetUserPassword,
  restoreUser,
  updateUser,
} from '../../api/users';
import { listRoles } from '../../api/roles';
import { getPermissionCatalog, updateUserPermissions } from '../../api/permissions';
import { PERMISSIONS, ROLE_LABELS, hasPermission } from '../../constants/permissions';
import { USERS, COMMON } from '../../constants/strings';
import { getErrorMessage } from '../../utils/errors';
import { getId } from '../../utils/ids';
import { required, validEmail } from '../../utils/validators';
import { spacing } from '../../constants/theme';

export function UserEditScreen({ route, navigation }) {
  const account = route.params?.account;
  const { user } = useAuth();
  const toast = useToast();
  const canManage = hasPermission(user, PERMISSIONS.USERS_MANAGE);
  const isAdmin = user?.role === 'admin';
  const accountId = getId(account);
  const isSelf = accountId && accountId === getId(user);
  const archived = account?.active === false || Boolean(account?.archivedAt);
  const [name, setName] = useState(account?.name || '');
  const [email, setEmail] = useState(account?.email || '');
  const [role, setRole] = useState(account?.role || 'student');
  const [extras, setExtras] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [creds, setCreds] = useState(null);
  const roles = useApiData(() => listRoles(), [], {
    enabled: canManage && isAdmin,
  });
  const catalog = useApiData(() => getPermissionCatalog(), [], {
    enabled: canManage && isAdmin,
  });

  useEffect(() => {
    if (!catalog.data && !roles.data) return;
    const defaults =
      catalog.data?.roleDefaults?.[role] ||
      (roles.data?.roles || []).find((item) => item.name === role)?.permissions ||
      [];
    setExtras(
      (account?.permissions || []).filter((perm) => !defaults.includes(perm))
    );
  }, [catalog.data, roles.data, role, account]);

  if (!canManage) return <Screen><PermissionState /></Screen>;
  if (!account) return <Screen><ErrorState message={COMMON.noResults} /></Screen>;

  const roleOptions = [
    ...Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
    ...(roles.data?.roles || [])
      .filter((item) => !ROLE_LABELS[item.name])
      .map((item) => ({ value: item.name, label: item.label || item.name })),
  ];

  function onChangeRole(nextRole) {
    setRole(nextRole);
    setExtras([]);
  }

  function toggleExtra(permission) {
    setExtras((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
  }

  async function onSave() {
    const nextErrors = {
      name: required(name, USERS.nameLabel),
      email: validEmail(email),
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (nextErrors.name || nextErrors.email) return;

    setBusy(true);
    const payload = { name: name.trim(), email: email.trim().toLowerCase() };
    if (isAdmin && !isSelf) payload.role = role;
    try {
      await updateUser(accountId, payload);
      toast(USERS.updated);
      navigation.goBack();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onSavePermissions() {
    setSavingPermissions(true);
    setSubmitError('');
    try {
      await updateUserPermissions(accountId, extras);
      toast(USERS.permissionsSaved);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSavingPermissions(false);
    }
  }

  async function onConfirm() {
    setBusy(true);
    setSubmitError('');
    try {
      if (confirm === 'archive') {
        await archiveUser(accountId);
        toast(USERS.archivedMessage);
      } else if (confirm === 'restore') {
        await restoreUser(accountId);
        toast(USERS.restoredMessage);
      } else if (confirm === 'delete') {
        await deleteUser(accountId);
        toast(USERS.deleted);
      } else if (confirm === 'reset') {
        const password = await resetUserPassword(accountId);
        setCreds({ name: account.name, email: account.email, password });
        toast(USERS.resetDone);
      }
      setConfirm('');
      if (confirm !== 'reset') navigation.goBack();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
      setConfirm('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Card>
        <Row label={COMMON.email} value={account.email} />
        <Row
          label={USERS.statusLabel}
          value={archived ? USERS.archived : USERS.active}
        />
      </Card>
      <Input
        label={USERS.nameLabel}
        value={name}
        onChangeText={setName}
        error={errors.name}
      />
      <Input
        label={COMMON.email}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      {isSelf || !isAdmin ? (
        <Card>
          <Row
            label={USERS.roleLabel}
            value={ROLE_LABELS[role] || role}
          />
        </Card>
      ) : (
        <SelectRow
          label={USERS.roleLabel}
          value={role}
          valueLabel={roleOptions.find((item) => item.value === role)?.label}
          options={roleOptions}
          onChange={onChangeRole}
        />
      )}
      <FormError message={submitError} />
      <Button
        title={busy ? COMMON.saving : COMMON.save}
        onPress={onSave}
        loading={busy}
      />

      {!isSelf ? (
        <Card>
          <AppText variant="subtitle">{COMMON.actions}</AppText>
          <View style={styles.actions}>
            <Button
              title={USERS.resetPassword}
              variant="secondary"
              compact
              onPress={() => setConfirm('reset')}
              style={styles.action}
            />
            {archived ? (
              <Button
                title={COMMON.restore}
                variant="secondary"
                compact
                onPress={() => setConfirm('restore')}
                style={styles.action}
              />
            ) : (
              <Button
                title={COMMON.archive}
                variant="secondary"
                compact
                onPress={() => setConfirm('archive')}
                style={styles.action}
              />
            )}
            <Button
              title={COMMON.delete}
              variant="danger"
              compact
              onPress={() => setConfirm('delete')}
              style={styles.action}
            />
          </View>
        </Card>
      ) : null}

      {isAdmin && catalog.data ? (
        <>
          <SectionTitle title={USERS.extraPermissions} />
          <AppText variant="small">{USERS.extraPermissionsHint}</AppText>
          <PermissionChecklist selected={extras} onToggle={toggleExtra} />
          <Button
            title={savingPermissions ? COMMON.saving : USERS.savePermissions}
            variant="secondary"
            onPress={onSavePermissions}
            loading={savingPermissions}
          />
        </>
      ) : null}

      <CredentialsDialog
        visible={Boolean(creds)}
        name={creds?.name}
        email={creds?.email}
        password={creds?.password}
        onClose={() => setCreds(null)}
      />
      <ConfirmDialog
        visible={confirm === 'archive'}
        title={USERS.archiveTitle}
        body={USERS.archiveBody}
        confirmLabel={COMMON.archive}
        loading={busy}
        onCancel={() => setConfirm('')}
        onConfirm={onConfirm}
      />
      <ConfirmDialog
        visible={confirm === 'restore'}
        title={USERS.restoreTitle}
        body={USERS.restoreBody}
        confirmLabel={COMMON.restore}
        loading={busy}
        onCancel={() => setConfirm('')}
        onConfirm={onConfirm}
      />
      <ConfirmDialog
        visible={confirm === 'delete'}
        title={USERS.deleteTitle}
        body={USERS.deleteBody}
        confirmLabel={COMMON.delete}
        danger
        loading={busy}
        onCancel={() => setConfirm('')}
        onConfirm={onConfirm}
      />
      <ConfirmDialog
        visible={confirm === 'reset'}
        title={USERS.resetTitle}
        body={USERS.resetBody}
        confirmLabel={USERS.resetPassword}
        loading={busy}
        onCancel={() => setConfirm('')}
        onConfirm={onConfirm}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: { flexGrow: 1 },
});
