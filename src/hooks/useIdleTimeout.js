// Auto sign-out after 10 idle minutes, mirroring the web app's behaviour.
// Reads the app from the background and resets on every interaction.
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { IDLE_LIMIT_MS } from '../constants/session';

export function useIdleTimeout(status, logout) {
  const backgroundAt = useRef(0);

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
}