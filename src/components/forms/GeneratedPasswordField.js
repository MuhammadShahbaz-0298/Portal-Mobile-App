// Password input with a one-tap generate button used when creating accounts.
// The generated value stays in local state and is never logged or stored.
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { USERS, COMMON } from '../../constants/strings';

export function GeneratedPasswordField({ value, onChangeText, error, onGenerate }) {
  return (
    <>
      <Input
        label={COMMON.password}
        value={value}
        onChangeText={onChangeText}
        placeholder={COMMON.passwordPlaceholder}
        secure
        autoCapitalize="none"
        autoCorrect={false}
        error={error}
      />
      <Button
        title={USERS.generatePassword}
        variant="secondary"
        onPress={onGenerate}
      />
    </>
  );
}
