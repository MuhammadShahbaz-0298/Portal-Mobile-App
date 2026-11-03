// Bootstrap and retry logic for the saved session.
// Only the server rejecting it (401/403) clears the tokens.
// An offline device keeps the session and shows the offline screen.
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { setAuthHandlers } from '../api/client';
import {
  ApiError,
  isForcedPasswordError,
  isSessionExpiredError,
} from '../api/errors';
import { fetchMe } from '../api/auth';
import { AUTH } from '../constants/strings';
import { clearTokens, loadTokens } from '../services/session';

export function useAuthSession() {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState('');

  // Runs the session check; also the offline retry on demand.
  const checkSession = useCallback(async () => {
    try {
      const tokens = await loadTokens();
      if (!tokens.access || !tokens.refresh) {
        setStatus('signedOut');
        return;
      }
      const me = await fetchMe({ skipForcedHandler: true });
      setUser(me);
      setNotice('');
      setStatus('signedIn');
    } catch (error) {
      if (isForcedPasswordError(error)) {
        setStatus('forcePassword');
        return;
      }
      // Only the server rejecting the session clears it.
      if (
        isSessionExpiredError(error) ||
        (error instanceof ApiError && (error.status === 401 || error.status === 403))
      ) {
        await clearTokens();
        setUser(null);
        setStatus('signedOut');
        setNotice(AUTH.sessionExpired);
        return;
      }
      // Offline, timeout, cold start, server error: keep the saved session.
      setStatus('offline');
    }
  }, []);

  // Auto-retry the session check when an offline app returns to the foreground.
  useEffect(() => {
    if (status !== 'offline') return undefined;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') checkSession();
    });
    return () => subscription.remove();
  }, [status, checkSession]);

  // Register auth handlers once, then run the initial check.
  useEffect(() => {
    setAuthHandlers({
      onForcedPassword: () => setStatus('forcePassword'),
      onSessionExpired: () => {
        setUser(null);
        setStatus('signedOut');
        setNotice(AUTH.sessionExpired);
      },
    });
    checkSession();
    return () => {
      setAuthHandlers({});
    };
  }, [checkSession]);

  return {
    status,
    user,
    notice,
    setUser,
    setStatus,
    setNotice,
    checkSession,
  };
}