// Offline state for the app and for individual screens.
// Shown with an inline Retry button; re-checks connectivity only when the
// app returns to the foreground from background/inactive — never blindly
// on mount, which would retry forever on a dead connection.
import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { useAppState } from '../../hooks/useAppState';
import { COMMON, OFFLINE } from '../../constants/strings';
import { colors, radius, spacing } from '../../constants/theme';

export function OfflineState({ onRetry, fullScreen = false }) {
  const appState = useAppState();
  const previous = useRef(appState);
  const onRetryRef = useRef(onRetry);

  // Always keep the latest handler without re-triggering effects.
  useEffect(() => {
    onRetryRef.current = onRetry;
  });

  // Retry only on a background/inactive -> active transition.
  useEffect(() => {
    const wasAway = previous.current !== 'active';
    const nowActive = appState === 'active';
    previous.current = appState;
    if (wasAway && nowActive && onRetryRef.current) {
      onRetryRef.current();
    }
  }, [appState]);

  const body = (
    <>
      <View style={styles.icon}>
        <Ionicons name="cloud-offline-outline" size={30} color={colors.muted} />
      </View>
      <AppText variant="subtitle" style={styles.center}>
        {OFFLINE.title}
      </AppText>
      <AppText variant="small" style={styles.center}>
        {OFFLINE.body}
      </AppText>
      {onRetry ? (
        <Button title={COMMON.retry} onPress={onRetry} variant="secondary" compact />
      ) : null}
    </>
  );

  if (fullScreen) {
    return <View style={styles.full}>{body}</View>;
  }
  return <View style={styles.card}>{body}</View>;
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.canvas,
  },
  card: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
});