// Owns the session: bootstrap, login, forced password change, refresh, and sign out.
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  changePassword as changePasswordRequest,
  fetchMe,
  login as loginRequest,
  logoutRequest,
} from '../api/auth';
import { setAuthHandlers } from '../api/client';
import { isForcedPasswordError } from '../api/errors';
import { AUTH } from '../constants/strings';
import {
  clearTokens,
  getRefreshToken,
  loadTokens,
  saveTokens,
} from '../services/session';

const IDLE_LIMIT_MS = 10 * 60 * 1000;
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState('');
  const backgroundAt = useRef(0);

  const expire = useCallback(() => {
    setUser(null);
    setStatus('signedOut');
    setNotice(AUTH.sessionExpired);
  }, []);

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
  }, []);

  useEffect(() => {
    setAuthHandlers({
      onForcedPassword: () => setStatus('forcePassword'),
      onSessionExpired: expire,
    });

    let active = true;
    async function bootstrap() {
      try {
        const tokens = await loadTokens();
        if (!tokens.access || !tokens.refresh) {
          if (active) setStatus('signedOut');
          return;
        }
        const me = await fetchMe({ skipForcedHandler: true });
        if (active) {
          setUser(me);
          setStatus('signedIn');
        }
      } catch (error) {
        if (!active) return;
        if (isForcedPasswordError(error)) {
          setStatus('forcePassword');
          return;
        }
        await clearTokens();
        setUser(null);
        setStatus('signedOut');
        if (error?.status !== 401) setNotice(AUTH.sessionExpired);
      } finally {
        // The saved session is restored and checked; hide the native splash.
        SplashScreen.hide();
      }
    }

    bootstrap();
    return () => {
      active = false;
      setAuthHandlers({});
    };
  }, [expire]);

  useEffect(() => {
    if (status !== 'signedIn') return undefined;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'background' || next === 'inactive') {
        backgroundAt.current = Date.now();
        return;
      }
      if (
        next === 'active' &&
        backgroundAt.current &&
        Date.now() - backgroundAt.current > IDLE_LIMIT_MS
      ) {
        logout();
      }
    });
    return () => subscription.remove();
  }, [status, logout]);

  const login = useCallback(async (email, password) => {
    const payload = await loginRequest(email, password);
    if (!payload?.accessToken || !payload?.refreshToken) {
      throw new Error('The server did not return a mobile session. Try again.');
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
      await clearTokens();
      throw error;
    }
  }, []);

  const changeForcedPassword = useCallback(async (currentPassword, newPassword) => {
    await changePasswordRequest(currentPassword, newPassword);
    const me = await fetchMe();
    setUser(me);
    setStatus('signedIn');
  }, []);

  const changeOwnPassword = useCallback(async (currentPassword, newPassword) => {
    await changePasswordRequest(currentPassword, newPassword);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await fetchMe();
    setUser(me);
    return me;
  }, []);

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
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
