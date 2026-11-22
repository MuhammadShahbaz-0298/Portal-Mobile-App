// Thin separator used between full-width rows (menus, lists).
import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export function Divider() {
  const colors = useThemeColors();
  return <View style={[styles.divider, { backgroundColor: colors.line }]} />;
}

const styles = StyleSheet.create({
  divider: { height: 1 },
});
