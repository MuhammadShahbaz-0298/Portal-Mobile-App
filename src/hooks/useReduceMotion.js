// Reports whether the user asked the OS to reduce motion (iOS) or
// disable animations/transitions. When true, every animation is skipped.
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const value = await AccessibilityInfo.isReduceMotionEnabled();
        if (mounted) setReduceMotion(value);
      } catch {
        // If the check is unavailable, animate normally.
      }
    })();
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}