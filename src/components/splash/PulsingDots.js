// Three dots that pulse in a continuous wave under the splash copy.
// Each dot runs the same loop, offset with Animated.loop's delay option,
// so the wave never drifts and at least one dot always stays lit.
// reduceMotion renders three static, fully visible dots and no loop.
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ANIMATION } from '../../constants/animation';
import { colors, spacing, splashSizes } from '../../constants/theme';

const DIM = 0.25;

export function PulsingDots({ reduceMotion = false }) {
  const [dots] = useState(() => [
    new Animated.Value(DIM),
    new Animated.Value(DIM),
    new Animated.Value(DIM),
  ]);

  useEffect(() => {
    if (reduceMotion) {
      dots.forEach((dot) => dot.setValue(1));
      return undefined;
    }
    const loops = dots.map((dot, index) =>
      Animated.sequence([
        Animated.delay(index * ANIMATION.dotsIntervalMs),
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: ANIMATION.dotsPulseMs,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: DIM,
              duration: ANIMATION.dotsPulseMs,
              useNativeDriver: true,
            }),
            Animated.delay(ANIMATION.pulseMs - 2 * ANIMATION.dotsPulseMs),
          ])
        ),
      ])
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [reduceMotion, dots]);

  return (
    <View style={styles.row}>
      {dots.map((dot, index) =>
        reduceMotion ? (
          <View key={index} style={styles.dot} />
        ) : (
          <Animated.View key={index} style={[styles.dot, { opacity: dot }]} />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  dot: {
    width: splashSizes.dotSize,
    height: splashSizes.dotSize,
    borderRadius: splashSizes.dotSize / 2,
    backgroundColor: colors.whiteSoft,
  },
});
