// App name and tagline for the splash; both fade up in a staggered intro
// (name at 100ms, tagline at 200ms). Opacity and translateY only, so
// useNativeDriver handles the animation off the JS thread.
// reduceMotion renders both lines statically at their final state.
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ANIMATION } from '../../constants/animation';
import { APP } from '../../constants/app';
import { colors, spacing, splashSizes } from '../../constants/theme';

export function SplashText({ reduceMotion = false }) {
  const [name] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));
  const [tagline] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));

  useEffect(() => {
    if (reduceMotion) {
      name.setValue(1);
      tagline.setValue(1);
      return undefined;
    }
    const nameAnim = Animated.timing(name, {
      toValue: 1,
      duration: ANIMATION.textDuration,
      delay: ANIMATION.nameDelay,
      useNativeDriver: true,
    });
    const taglineAnim = Animated.timing(tagline, {
      toValue: 1,
      duration: ANIMATION.textDuration,
      delay: ANIMATION.taglineDelay,
      useNativeDriver: true,
    });
    nameAnim.start();
    taglineAnim.start();
    return () => {
      nameAnim.stop();
      taglineAnim.stop();
    };
  }, [reduceMotion, name, tagline]);

  const nameY = name.interpolate({
    inputRange: [0, 1],
    outputRange: [splashSizes.textRise, 0],
  });
  const taglineY = tagline.interpolate({
    inputRange: [0, 1],
    outputRange: [splashSizes.textRise, 0],
  });

  return (
    <View style={styles.block}>
      <Animated.Text
        style={[styles.name, { opacity: name, transform: [{ translateY: nameY }] }]}
      >
        {APP.name}
      </Animated.Text>
      <Animated.Text
        style={[styles.tagline, { opacity: tagline, transform: [{ translateY: taglineY }] }]}
      >
        {APP.tagline}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', gap: spacing.xs },
  name: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
  },
  tagline: {
    color: colors.whiteSoft,
    fontSize: 14,
    textAlign: 'center',
  },
});