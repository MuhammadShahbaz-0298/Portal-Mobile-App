// Shown when required app configuration is missing or invalid.
// App.js renders this screen full-screen until the setup problem is fixed.
import { CONFIG_ERROR } from '../config/env';
import { Screen } from '../components/ui/Screen';
import { ErrorState } from '../components/states/ErrorState';

export function ConfigErrorScreen() {
  return (
    <Screen scroll={false} edges={['top', 'left', 'right', 'bottom']}>
      <ErrorState message={CONFIG_ERROR} />
    </Screen>
  );
}
