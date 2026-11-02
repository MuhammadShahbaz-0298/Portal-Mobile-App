// Create a user with role, optional batch, and one-time credentials.
import { useState } from 'react';
import { Screen } from '../../components/ui/Screen';
import { Input } from '../../components/ui/Input';
import { SelectRow } from '../../components/ui/SelectRow';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { ToggleRow } from '../../components/ui/ToggleRow';
import { PermissionChecklist } from '../../components/ui/PermissionChecklist';
import { CredentialsDialog } from '../../components/ui/CredentialsDialog';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { registerUser } from '../../api/auth';
import { listRoles } from '../../api/roles';
import { listBatches } from '../../api/batches';
import { PERMISSIONS, ROLE_LABELS, hasPermission } from '../../constants/permissions';
import { USERS, COMMON, VALIDATION } from '../../constants/strings';
import { generatePassword } from '../../utils/password';
import { getErrorMessage } from '../../utils/errors';
import { required, validEmail } from '../../utils/validators';

export function UserCreateScreen({ navigation }) {
  const { user } = useAuth();
  const canCreate = hasPermission(user, PERMISSIONS.STUDENTS_CREATE);
  const isAdmin = user?.role === 'admin';
  const roles = useApiData(() => listRoles(), [], {
    enabled: canCreate && isAdmin,
  });
  const batches = useApiData(() => listBatches({ limit: 100 }), [], {
    enabled: canCreate && isAdmin,
  });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [batchId, setBatchId] = useState('');
  const [useBatch, setUseBatch] = useState(false);
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);
  const [creds, setCreds] = useState(null);

  if (!canCreate) return <Screen><PermissionState /></Screen>;

  const roleOptions = isAdmin
    ? [
        ...Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
        ...(roles.data?.roles || [])
          .filter((item) => !ROLE_LABELS[item.name])
          .map((item) => ({ value: item.name, label: item.label || item.name })),
      ]
    : [{ value: 'student', label: ROLE_LABELS.student }];
  const batchOptions = (batches.data?.items || []).map((item) => ({
    value: item._id,
    label: item.name,
  }));

  function onGenerate() {
    setPassword(generatePassword());
  }

  function togglePermission(perm) {
    setPermissions((current) =>
      current.includes(perm)
        ? current.filter((item) => item !== perm)
        : [...current, perm]
    );
  }

  async function onCreate() {
    const nextErrors = {
      name: required(name, USERS.nameLabel),
      email: validEmail(email),
      role: required(role, USERS.roleLabel),
      password: !password ? VALIDATION.required(COMMON.password) : '',
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.values(nextErrors).find(Boolean)) return;

    setBusy(true);
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      password,
    };
    if (isAdmin && permissions.length) payload.permissions = permissions;
    if (isAdmin && role === 'student' && useBatch && batchId) {
      payload.batchId = batchId;
    }
    try {
      const created = await registerUser(payload);
      setCreds({
        name: created?.name || name.trim(),
        email: created?.email || email.trim(),
        password,
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Input
        label={USERS.nameLabel}
        value={name}
        onChangeText={setName}
        placeholder={USERS.namePlaceholder}
        error={errors.name}
      />
      <Input
        label={COMMON.email}
        value={email}
        onChangeText={setEmail}
        placeholder={USERS.emailPlaceholder}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      <SelectRow
        label={USERS.roleLabel}
        value={role}
        valueLabel={roleOptions.find((item) => item.value === role)?.label}
        options={roleOptions}
        onChange={setRole}
        error={errors.role}
      />
      {isAdmin ? (
        <>
          {role === 'student' ? (
            <ToggleRow
              label={USERS.batchLabel}
              description={USERS.batchHint}
              value={useBatch}
              onValueChange={setUseBatch}
            />
          ) : null}
          {role === 'student' && useBatch ? (
            <SelectRow
              label={USERS.pickBatch}
              value={batchId}
              valueLabel={batchOptions.find((item) => item.value === batchId)?.label}
              options={batchOptions}
              onChange={setBatchId}
            />
          ) : null}
          <SectionTitle title={USERS.extraPermissions} />
          <PermissionChecklist selected={permissions} onToggle={togglePermission} />
        </>
      ) : null}
      <SectionTitle title={USERS.temporaryPassword} />
      <Input
        label={COMMON.password}
        value={password}
        onChangeText={setPassword}
        placeholder={COMMON.passwordPlaceholder}
        secure
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.password}
      />
      <Button
        title={USERS.generatePassword}
        variant="secondary"
        onPress={onGenerate}
      />
      <FormError message={submitError} />
      <Button
        title={busy ? COMMON.creating : USERS.createAndShow}
        onPress={onCreate}
        loading={busy}
      />
      <CredentialsDialog
        visible={Boolean(creds)}
        name={creds?.name}
        email={creds?.email}
        password={creds?.password}
        onClose={() => {
          setCreds(null);
          navigation.goBack();
        }}
      />
    </Screen>
  );
}
