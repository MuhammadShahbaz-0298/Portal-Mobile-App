// Lightweight success/info toast shown above the tab bar.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../components/ui/AppText';
import { radius, shadow, spacing } from '../constants/theme';
import { useThemeColors } from '../hooks/useThemeColors';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const colors = useThemeColors();
  const [message, setMessage] = useState('');
  const timer = useRef(null);

  const showToast = useCallback((text) => {
    if (!text) return;
    setMessage(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(''), 3200);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {message ? (
        <View pointerEvents="none" style={styles.wrap}>
          <View style={[styles.toast, { backgroundColor: colors.surfaceMuted }]}>
            <AppText variant="small" style={{ color: colors.ink }}>
              {message}
            </AppText>
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: 96 },
  toast: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadow.card,
  },
});
