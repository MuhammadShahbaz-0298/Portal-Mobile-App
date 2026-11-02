// Shown when the API URL is missing or invalid, instead of calling broken endpoints.
// App.js renders this screen full-screen until the .env problem is fixed.
import { CONFIG_ERROR } from '../config/env';
import { Screen } from '../components/ui/Screen';
import { ErrorState } from '../components/states/ErrorState';

export function ConfigErrorScreen() {
  return (
    <Screen scroll={false}>
      <ErrorState message={CONFIG_ERROR} />
    </Screen>
  );
}
