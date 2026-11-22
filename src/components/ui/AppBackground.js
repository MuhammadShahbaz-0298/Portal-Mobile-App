// Soft branded backdrop behind every screen. Purely decorative, no touch handling.
import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export function AppBackground() {
  const colors = useThemeColors();
  return (
    <View pointerEvents="none" style={[styles.container, { backgroundColor: colors.canvas }]}>
      <View style={[styles.orb, styles.brandOrb, { backgroundColor: `${colors.brand}14` }]} />
      <View style={[styles.orb, styles.successOrb, { backgroundColor: `${colors.success}10` }]} />
      <View style={[styles.orb, styles.warningOrb, { backgroundColor: `${colors.warning}0E` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  orb: { position: 'absolute', borderRadius: 999 },
  brandOrb: {
    width: 340,
    height: 340,
    top: -150,
    right: -120,
  },
  successOrb: {
    width: 260,
    height: 260,
    top: 280,
    left: -150,
  },
  warningOrb: {
    width: 300,
    height: 300,
    bottom: -150,
    right: -120,
  },
});
