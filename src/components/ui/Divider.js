// Thin separator used between full-width rows (menus, lists).
import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/theme';

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: { height: 1, backgroundColor: colors.line },
});
