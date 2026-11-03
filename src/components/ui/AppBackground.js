// Soft branded backdrop behind every screen. Purely decorative, no touch handling.
import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/theme';

export function AppBackground() {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={[styles.orb, styles.brandOrb]} />
      <View style={[styles.orb, styles.successOrb]} />
      <View style={[styles.orb, styles.warningOrb]} />
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
    backgroundColor: colors.canvas,
    overflow: 'hidden',
  },
  orb: { position: 'absolute', borderRadius: 999 },
  brandOrb: {
    width: 340,
    height: 340,
    top: -150,
    right: -120,
    backgroundColor: `${colors.brand}14`,
  },
  successOrb: {
    width: 260,
    height: 260,
    top: 280,
    left: -150,
    backgroundColor: `${colors.success}10`,
  },
  warningOrb: {
    width: 300,
    height: 300,
    bottom: -150,
    right: -120,
    backgroundColor: `${colors.warning}0E`,
  },
});
