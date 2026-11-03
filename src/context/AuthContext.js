// Owns the session: login, forced password change, sign out, idle timeout.
// All bootstrap and offline-retry logic lives in useAuthSession and useIdleTimeout.
import { createContext, useCallback, useMemo } from 'react';
import {
  changePassword as changePasswordRequest,
  fetchMe,
  login as loginRequest,
  logoutRequest,
} from '../api/auth';
import { isForcedPasswordError } from '../api/errors';
import { AUTH } from '../constants/strings';
import {
  clearTokens,
  getRefreshToken,
  saveTokens,
} from '../services/session';
import { useAuthSession } from '../hooks/useAuthSession';
import { useIdleTimeout } from '../hooks/useIdleTimeout';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const {
    status,
    user,
    notice,
    setUser,
    setStatus,
    setNotice,
    checkSession,
  } = useAuthSession();

  const logout = useCallback(async () => {
    const refreshToken = await getRefreshToken();
    await clearTokens();
    setUser(null);
    setNotice('');
    setStatus('signedOut');
    try {
      await logoutRequest(refreshToken);
    } catch {
      // The local session is already gone when the server is unreachable.
    }
  }, [setStatus, setUser, setNotice]);

  useIdleTimeout(status, logout);

  const login = useCallback(
    async (email, password) => {
      const payload = await loginRequest(email, password);
      if (!payload?.accessToken || !payload?.refreshToken) {
        throw new Error(AUTH.missingSession);
      }
      await saveTokens(payload.accessToken, payload.refreshToken);
      setNotice('');

      try {
        const me = await fetchMe({ skipForcedHandler: true });
        setUser(me);
        setStatus('signedIn');
      } catch (error) {
        if (isForcedPasswordError(error)) {
          setUser(payload.user);
          setStatus('forcePassword');
          return;
        }
        // Only the server rejecting the session clears it.
        if (error?.status === 401 || error?.status === 403) {
          await clearTokens();
          throw error;
        }
        // Offline right after login: keep the session.
        setUser(payload.user);
        setStatus('offline');
      }
    },
    [setNotice, setStatus, setUser]
  );

  const changeForcedPassword = useCallback(
    async (currentPassword, newPassword) => {
      await changePasswordRequest(currentPassword, newPassword);
      const me = await fetchMe();
      setUser(me);
      setStatus('signedIn');
    },
    [setStatus, setUser]
  );

  const changeOwnPassword = useCallback(async (currentPassword, newPassword) => {
    await changePasswordRequest(currentPassword, newPassword);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await fetchMe();
    setUser(me);
    return me;
  }, [setUser]);

  const value = useMemo(
    () => ({
      status,
      user,
      notice,
      clearNotice: () => setNotice(''),
      login,
      logout,
      changeForcedPassword,
      changeOwnPassword,
      refreshUser,
      retrySession: checkSession,
    }),
    [
      status,
      user,
      notice,
      login,
      logout,
      changeForcedPassword,
      changeOwnPassword,
      refreshUser,
      checkSession,
      setNotice,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;