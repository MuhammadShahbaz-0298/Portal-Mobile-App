// Create a user with name, email, role, and a one-time generated password.
// The role picker is visible only to roles.manage holders; others create students.
import { useState } from 'react';
import { Screen } from '../../components/ui/Screen';
import { SelectRow } from '../../components/ui/SelectRow';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { CredentialsDialog } from '../../components/ui/CredentialsDialog';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { PermissionState } from '../../components/states/PermissionState';
import { NameEmailFields } from '../../components/forms/NameEmailFields';
import { GeneratedPasswordField } from '../../components/forms/GeneratedPasswordField';
import { useAuth } from '../../hooks/useAuth';
import { useRoleOptions } from '../../hooks/useRoleOptions';
import { useApiData } from '../../hooks/useApiData';
import { registerUser } from '../../api/auth';
import { listRoles } from '../../api/roles';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { USERS, COMMON } from '../../constants/strings';
import { NAME_MAX_LENGTH } from '../../constants/options';
import { generatePassword } from '../../utils/password';
import { getErrorMessage } from '../../utils/errors';
import {
  firstError,
  maxLength,
  required,
  validEmail,
  validPassword,
} from '../../utils/validators';

export function UserCreateScreen({ navigation }) {
  const { user } = useAuth();
  const canCreate = can(user, PERMISSIONS.STUDENTS_CREATE, ROLE_SETS.STAFF);
  const canPickRole = can(user, PERMISSIONS.ROLES_MANAGE, ROLE_SETS.ADMIN);
  const roles = useApiData(() => listRoles(), { enabled: canCreate && canPickRole });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);
  const [creds, setCreds] = useState(null);

  const roleOptions = useRoleOptions(canPickRole ? roles.data?.roles : []);

  if (!canCreate) return <Screen><PermissionState /></Screen>;

  function onGenerate() {
    setPassword(generatePassword());
  }

  async function onCreate() {
    const nextErrors = {
      name: required(name, USERS.nameLabel) ||
        maxLength(name, USERS.nameLabel, NAME_MAX_LENGTH),
      email: validEmail(email),
      role: required(role, USERS.roleLabel),
      password: validPassword(password, COMMON.password),
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (firstError(nextErrors)) return;

    setBusy(true);
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      password,
    };
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
      <NameEmailFields
        name={name}
        email={email}
        onNameChange={setName}
        onEmailChange={setEmail}
        nameError={errors.name}
        emailError={errors.email}
      />
      {canPickRole ? (
        <SelectRow
          label={USERS.roleLabel}
          value={role}
          valueLabel={roleOptions.find((item) => item.value === role)?.label}
          options={roleOptions}
          onChange={setRole}
          error={errors.role}
        />
      ) : null}
      <SectionTitle title={USERS.temporaryPassword} />
      <GeneratedPasswordField
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        onGenerate={onGenerate}
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
