// Friendly empty state with an optional action.
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { colors, radius, spacing } from '../../constants/theme';

export function EmptyState({ title, message, actionLabel, onAction, icon = 'file-tray-outline' }) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={28} color={colors.brand} />
      </View>
      <AppText variant="subtitle" style={styles.center}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="small" style={styles.center}>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} compact />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  center: { textAlign: 'center' },
});
