// Countdown driven by the server's expiry timestamp, never by the device clock.
import { useEffect, useState } from 'react';
import { SECOND_MS } from '../constants/options';

function remainingSeconds(expiresAt) {
  if (!expiresAt) return null;
  const target = new Date(expiresAt).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.max(0, Math.ceil((target - Date.now()) / SECOND_MS));
}

export function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState(() => remainingSeconds(expiresAt));

  useEffect(() => {
    setRemaining(remainingSeconds(expiresAt));
    if (!expiresAt) return undefined;

    const timer = setInterval(() => {
      setRemaining(remainingSeconds(expiresAt));
    }, SECOND_MS);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return remaining;
}
