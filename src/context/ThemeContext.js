import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { APPEARANCE } from '../constants/strings';
import { colors, colorsDark } from '../constants/theme';

const ThemeContext = createContext(null);
const PREFERENCE_KEY = 'appearancePreference';
const PREFERENCES = ['system', 'light', 'dark'];

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState('system');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    SecureStore.getItemAsync(PREFERENCE_KEY)
      .then((savedPreference) => {
        if (active && PREFERENCES.includes(savedPreference)) {
          setPreferenceState(savedPreference);
        }
      })
      .catch((error) => {
        console.warn('[appearance_preference_load_failed]', error?.message || 'Unknown error');
        if (active) setLoadError(APPEARANCE.loadFailed);
      });

    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback(async (nextPreference) => {
    if (!PREFERENCES.includes(nextPreference)) {
      throw new Error('Unsupported appearance preference.');
    }

    try {
      await SecureStore.setItemAsync(PREFERENCE_KEY, nextPreference);
      setPreferenceState(nextPreference);
      setLoadError('');
    } catch (error) {
      console.warn('[appearance_preference_save_failed]', error?.message || 'Unknown error');
      throw error;
    }
  }, []);

  const resolvedScheme = preference === 'system'
    ? (systemScheme === 'dark' ? 'dark' : 'light')
    : preference;
  const value = useMemo(() => ({
    preference,
    setPreference,
    loadError,
    resolvedScheme,
    colors: resolvedScheme === 'dark' ? colorsDark : colors,
  }), [preference, setPreference, loadError, resolvedScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider.');
  return context;
}
