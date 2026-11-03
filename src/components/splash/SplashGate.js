// SplashGate: mounts the app under a full-screen brand overlay and hides
// the native splash exactly once, on the overlay's first layout (ref guard).
// The overlay stays until the session check finishes AND the minimum
// display time elapses, then fades out and unmounts (null) for good.
// While still loading after 8 s it offers a friendly 'Waking up…' line,
// never when the device is offline.
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../../hooks/useAuth';
import { useOffline } from '../../context/OfflineContext';
import { ANIMATION } from '../../constants/animation';
import { colors } from '../../constants/theme';
import { SplashView } from './SplashView';

export function SplashGate({ children }) {
  const { status } = useAuth();
  const { isOffline } = useOffline();
  const mountedAtRef = useRef(0);
  const didHideNative = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [overlayOpacity] = useState(() => new Animated.Value(1));
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);
  const [showServerWait, setShowServerWait] = useState(false);

  // Record the mount time once, inside an effect (never during render).
  useEffect(() => {
    mountedAtRef.current = Date.now();
    setMounted(true);
  }, []);

  // Hide the native splash the moment the overlay has laid out — once.
  const onLayout = () => {
    if (didHideNative.current) return;
    didHideNative.current = true;
    SplashScreen.hide();
  };

  // When the session resolves and the minimum display time has passed,
  // fade the overlay out and then unmount it completely.
  useEffect(() => {
    if (status === 'loading' || gone || !mounted) return undefined;
    const elapsed = Date.now() - mountedAtRef.current;
    const wait = Math.max(0, ANIMATION.minDisplayMs - elapsed);
    const timer = setTimeout(() => {
      setFading(true);
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: ANIMATION.fadeDuration,
        useNativeDriver: true,
      }).start(() => setGone(true));
    }, wait);
    return () => clearTimeout(timer);
  }, [status, gone, mounted, overlayOpacity]);

  // After 8 s of waiting online, show a friendly heads-up line.
  useEffect(() => {
    if (status !== 'loading' || gone || isOffline) return undefined;
    const timer = setTimeout(() => setShowServerWait(true), ANIMATION.serverWaitMs);
    return () => clearTimeout(timer);
  }, [status, gone, isOffline]);

  if (gone) return children;

  return (
    <>
      {children}
      <Animated.View
        style={[styles.overlay, { opacity: overlayOpacity }]}
        pointerEvents={fading ? 'none' : 'auto'}
        onLayout={onLayout}
      >
        <SplashView showServerWait={showServerWait} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: colors.brand,
  },
});