// Edit a user: name, email, role, and account lifecycle actions.
// The role picker shows only to roles.manage holders; never for yourself.
import { useState } from 'react';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { Row } from '../../components/ui/Row';
import { SelectRow } from '../../components/ui/SelectRow';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { CredentialsDialog } from '../../components/ui/CredentialsDialog';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PermissionState } from '../../components/states/PermissionState';
import { ErrorState } from '../../components/states/ErrorState';
import { NameEmailFields } from '../../components/forms/NameEmailFields';
import { UserActionsCard } from '../../components/lists/UserActionsCard';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useRoleOptions } from '../../hooks/useRoleOptions';
import { useToast } from '../../context/ToastContext';
import {
  archiveUser,
  deleteUser,
  resetUserPassword,
  restoreUser,
  setUserActive,
  updateUser,
} from '../../api/users';
import { listRoles } from '../../api/roles';
import { PERMISSIONS, ROLE_LABELS, can } from '../../constants/permissions';
import { USERS, COMMON } from '../../constants/strings';
import { NAME_MAX_LENGTH } from '../../constants/options';
import { getErrorMessage } from '../../utils/errors';
import { getId } from '../../utils/ids';
import { firstError, maxLength, required, validEmail } from '../../utils/validators';

export function UserEditScreen({ route, navigation }) {
  const account = route.params?.account;
  const { user } = useAuth();
  const toast = useToast();
  const canManage = can(user, PERMISSIONS.USERS_MANAGE, ['admin']);
  const canPickRole = can(user, PERMISSIONS.ROLES_MANAGE, ['admin']);
  const accountId = getId(account);
  const isSelf = accountId && accountId === getId(user);
  const archived = account?.active === false || Boolean(account?.archivedAt);
  const isActive = account?.active !== false;
  const [name, setName] = useState(account?.name || '');
  const [email, setEmail] = useState(account?.email || '');
  const [role, setRole] = useState(account?.role || 'student');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [creds, setCreds] = useState(null);
  const roles = useApiData(() => listRoles(), {
    enabled: canManage && canPickRole,
  });
  const roleOptions = useRoleOptions(roles.data?.roles || []);

  if (!canManage) return <Screen><PermissionState /></Screen>;
  if (!account) return <Screen><ErrorState message={COMMON.noResults} /></Screen>;

  async function onSave() {
    const nextErrors = {
      name: required(name, USERS.nameLabel) ||
        maxLength(name, USERS.nameLabel, NAME_MAX_LENGTH),
      email: validEmail(email),
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (firstError(nextErrors)) return;

    setBusy(true);
    const payload = { name: name.trim(), email: email.trim().toLowerCase() };
    if (canPickRole && !isSelf) payload.role = role;
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
      } else if (confirm === 'toggle') {
        await setUserActive(accountId, !isActive);
        toast(USERS.updated);
      } else if (confirm === 'reset') {
        const password = await resetUserPassword(accountId);
        setCreds({ name: account.name, email: account.email, password });
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

  let statusText = USERS.inactive;
  if (isActive) statusText = USERS.active;
  if (archived) statusText = USERS.archived;

  return (
    <Screen>
      <Card>
        <Row label={COMMON.email} value={account.email} />
        <Row
          label={USERS.statusLabel}
          value={statusText}
        />
      </Card>

      <NameEmailFields
        name={name}
        email={email}
        onNameChange={setName}
        onEmailChange={setEmail}
        nameError={errors.name}
        emailError={errors.email}
      />

      {canPickRole && !isSelf ? (
        <SelectRow
          label={USERS.roleLabel}
          value={role}
          valueLabel={roleOptions.find((item) => item.value === role)?.label}
          options={roleOptions}
          onChange={setRole}
        />
      ) : (
        <Card>
          <Row label={USERS.roleLabel} value={ROLE_LABELS[role] || role} />
        </Card>
      )}

      <FormError message={submitError} />
      <Button title={busy ? COMMON.saving : COMMON.save} onPress={onSave} loading={busy} />

      {!isSelf ? (
        <UserActionsCard
          archived={archived}
          active={isActive}
          onReset={() => setConfirm('reset')}
          onToggleActive={() => setConfirm('toggle')}
          onArchive={() => setConfirm('archive')}
          onRestore={() => setConfirm('restore')}
          onDelete={() => setConfirm('delete')}
        />
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
        visible={confirm === 'toggle'}
        title={isActive ? USERS.deactivate : USERS.activate}
        body={isActive ? USERS.deactivateBody : USERS.activateBody}
        confirmLabel={isActive ? USERS.deactivate : USERS.activate}
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
