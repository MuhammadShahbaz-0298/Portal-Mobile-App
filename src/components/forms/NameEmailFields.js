// Name and email inputs with device-side validation wired in.
// Shared by the create-user and edit-user screens.
import { Input } from '../ui/Input';
import { COMMON, USERS } from '../../constants/strings';
import { NAME_MAX_LENGTH, EMAIL_MAX_LENGTH } from '../../constants/options';

export function NameEmailFields({
  name,
  email,
  onNameChange,
  onEmailChange,
  nameError,
  emailError,
}) {
  return (
    <>
      <Input
        label={USERS.nameLabel}
        value={name}
        onChangeText={onNameChange}
        placeholder={USERS.namePlaceholder}
        maxLength={NAME_MAX_LENGTH}
        autoCapitalize="words"
        error={nameError}
      />
      <Input
        label={COMMON.email}
        value={email}
        onChangeText={onEmailChange}
        placeholder={USERS.emailPlaceholder}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={EMAIL_MAX_LENGTH}
        error={emailError}
      />
    </>
  );
}
