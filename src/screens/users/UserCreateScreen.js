// Create a user with role, optional batch, and one-time credentials.
// Logic lives in useUserCreateForm; this screen only assembles components.
import { Screen } from '../../components/ui/Screen';
import { SelectRow } from '../../components/ui/SelectRow';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { CredentialsDialog } from '../../components/ui/CredentialsDialog';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { PermissionState } from '../../components/states/PermissionState';
import { NameEmailFields } from '../../components/forms/NameEmailFields';
import { StudentBatchEnroll } from '../../components/forms/StudentBatchEnroll';
import { UserExtrasSection } from '../../components/forms/UserExtrasSection';
import { GeneratedPasswordField } from '../../components/forms/GeneratedPasswordField';
import { useUserCreateForm } from '../../hooks/useUserCreateForm';
import { USERS, COMMON } from '../../constants/strings';

export function UserCreateScreen({ navigation }) {
  const form = useUserCreateForm();

  if (!form.canCreate) return <Screen><PermissionState /></Screen>;

  return (
    <Screen>
      <NameEmailFields
        name={form.name}
        email={form.email}
        onNameChange={form.setName}
        onEmailChange={form.setEmail}
        nameError={form.errors.name}
        emailError={form.errors.email}
      />
      <SelectRow
        label={USERS.roleLabel}
        value={form.role}
        valueLabel={
          form.roleOptions.find((item) => item.value === form.role)?.label
        }
        options={form.roleOptions}
        onChange={form.setRole}
        error={form.errors.role}
      />
      {form.role === 'student' && form.canViewBatches ? (
        <StudentBatchEnroll
          useBatch={form.useBatch}
          onToggleBatch={form.setUseBatch}
          batchOptions={form.batchOptions}
          batchId={form.batchId}
          onBatchIdChange={form.setBatchId}
        />
      ) : null}
      {form.isAdmin ? (
        <UserExtrasSection
          selected={form.permissions}
          onToggle={form.togglePermission}
        />
      ) : null}
      <SectionTitle title={USERS.temporaryPassword} />
      <GeneratedPasswordField
        value={form.password}
        onChangeText={form.setPassword}
        error={form.errors.password}
        onGenerate={form.onGenerate}
      />
      <FormError message={form.submitError} />
      <Button
        title={form.busy ? COMMON.creating : USERS.createAndShow}
        onPress={form.onCreate}
        loading={form.busy}
      />
      <CredentialsDialog
        visible={Boolean(form.creds)}
        name={form.creds?.name}
        email={form.creds?.email}
        password={form.creds?.password}
        onClose={() => {
          form.setCreds(null);
          navigation.goBack();
        }}
      />
    </Screen>
  );
}
