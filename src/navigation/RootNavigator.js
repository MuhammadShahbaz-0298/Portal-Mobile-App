// Root switch: offline, then auth resolves; loading shows nothing because
// the SplashGate overlay covers the whole screen until the session is known.
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForceChangePasswordScreen } from '../screens/auth/ForceChangePasswordScreen';
import { OfflineState } from '../components/states/OfflineState';
import { AppStack } from './AppStack';
import { useAuth } from '../hooks/useAuth';

export function RootNavigator() {
  const { status, retrySession } = useAuth();

  if (status === 'offline') {
    return <OfflineState fullScreen onRetry={retrySession} />;
  }
  if (status === 'loading') return null;
  if (status === 'signedOut') return <LoginScreen />;
  if (status === 'forcePassword') return <ForceChangePasswordScreen />;

  return <AppStack />;
}