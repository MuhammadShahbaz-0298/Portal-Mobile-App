// Create or edit a role and its permission set.
// Permissions come from GET /api/permissions; core roles cannot be deleted.
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Row } from '../../components/ui/Row';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { PermissionChecklist } from '../../components/ui/PermissionChecklist';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PermissionState } from '../../components/states/PermissionState';
import { ErrorState } from '../../components/states/ErrorState';
import { LoadingState } from '../../components/states/LoadingState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useToast } from '../../context/ToastContext';
import { createRole, deleteRole, updateRole } from '../../api/roles';
import { getPermissionCatalog } from '../../api/permissions';
import { PERMISSIONS, isCoreRole, can } from '../../constants/permissions';
import { ROLES, COMMON, VALIDATION } from '../../constants/strings';
import { getErrorMessage } from '../../utils/errors';
import { required, validRoleName } from '../../utils/validators';
import { spacing } from '../../constants/theme';

export function RoleFormScreen({ route, navigation }) {
  const role = route.params?.role;
  const editing = Boolean(role);
  const { user } = useAuth();
  const toast = useToast();
  const canManage = can(user, PERMISSIONS.ROLES_MANAGE, ['admin']);
  const isCore = editing && isCoreRole(role.name);
  const [name, setName] = useState(role?.name || '');
  const [label, setLabel] = useState(role?.label || '');
  const [selected, setSelected] = useState(role?.permissions || []);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const catalog = useApiData(() => getPermissionCatalog(), { enabled: canManage });

  if (!canManage) return <Screen><PermissionState /></Screen>;

  const permissions = catalog.data?.permissions || [];

  function toggle(permission) {
    setSelected((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
  }

  async function onSave() {
    const nextErrors = {
      name: editing
        ? ''
        : validRoleName(name) ||
          (name.trim().length < 2 ? VALIDATION.minLength(ROLES.nameLabel, 2) : ''),
      label: required(label, ROLES.labelLabel),
      permissions: selected.length ? '' : ROLES.pickPermissions,
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (nextErrors.name || nextErrors.label || nextErrors.permissions) return;

    setBusy(true);
    try {
      if (editing) {
        await updateRole(role._id, { label: label.trim(), permissions: selected });
      } else {
        await createRole({
          name: name.trim().toLowerCase(),
          label: label.trim(),
          permissions: selected,
        });
      }
      toast(editing ? ROLES.updated : ROLES.created);
      navigation.goBack();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    setBusy(true);
    setSubmitError('');
    try {
      await deleteRole(role._id);
      toast(ROLES.deleted);
      setConfirm(false);
      navigation.goBack();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  }

  if (catalog.loading) return <Screen><LoadingState /></Screen>;
  if (catalog.error) {
    return <Screen><ErrorState message={catalog.error} onRetry={catalog.retry} /></Screen>;
  }

  let saveTitle = ROLES.newTitle;
  if (editing) saveTitle = COMMON.save;
  if (busy) saveTitle = COMMON.saving;

  return (
    <Screen>
      {editing ? (
        <Card>
          <Row label={ROLES.nameLabel} value={role.name} />
          <Row label={ROLES.permissionsLabel} value={String(selected.length)} />
        </Card>
      ) : (
        <Input
          label={ROLES.nameLabel}
          value={name}
          onChangeText={setName}
          placeholder={ROLES.namePlaceholder}
          autoCapitalize="none"
          maxLength={50}
          hint={ROLES.nameHint}
          error={errors.name}
        />
      )}
      <Input
        label={ROLES.labelLabel}
        value={label}
        onChangeText={setLabel}
        placeholder={ROLES.labelPlaceholder}
        maxLength={100}
        hint={ROLES.labelHint}
        error={errors.label}
      />
      <SectionTitle title={ROLES.permissionsLabel} />
      <AppText variant="small">{ROLES.permissionsHint}</AppText>
      <AppText variant="caption">{ROLES.selectedCount(selected.length)}</AppText>
      {errors.permissions ? (
        <AppText variant="error">{errors.permissions}</AppText>
      ) : null}
      <PermissionChecklist catalog={permissions} selected={selected} onToggle={toggle} />
      <FormError message={submitError} />
      <Button
        title={saveTitle}
        onPress={onSave}
        loading={busy}
      />
      {editing && !isCore ? (
        <Button title={COMMON.delete} variant="danger" onPress={() => setConfirm(true)} />
      ) : null}
      {isCore ? <AppText variant="small" style={styles.info}>{ROLES.coreRoleLocked}</AppText> : null}
      <ConfirmDialog
        visible={confirm}
        title={ROLES.deleteTitle}
        body={ROLES.deleteBody}
        confirmLabel={COMMON.delete}
        danger
        loading={busy}
        onCancel={() => setConfirm(false)}
        onConfirm={onDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: { paddingVertical: spacing.sm },
});
