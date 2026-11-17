// Reports the app's foreground/background status to React components.
// Used by the offline experience and the auth provider's idle timer.
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

export function useAppState() {
  const [state, setState] = useState('active');

  useEffect(() => {
    const onStateChange = (next) => setState(next);
    const subscription = AppState.addEventListener('change', onStateChange);
    return () => subscription.remove();
  }, []);

  return state;
}