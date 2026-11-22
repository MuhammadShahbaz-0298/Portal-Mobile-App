// Screen shell handles safe area, background, padding, scrolling, and pull to refresh.
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from './AppBackground';
import { OfflineBanner } from './OfflineBanner';
import { useOffline } from '../../context/OfflineContext';
import { layout, spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export function Screen({
  children,
  scroll = true,
  refreshing = false,
  onRefresh,
  contentStyle,
  style,
  edges = ['left', 'right'],
}) {
  const { isOffline } = useOffline();
  const colors = useThemeColors();
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flex, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: colors.canvas }, style]}>
      <AppBackground />
      {isOffline ? <OfflineBanner /> : null}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {body}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    padding: layout.screenPadding,
    paddingBottom: layout.screenBottomSpacing,
    gap: spacing.md,
  },
});
