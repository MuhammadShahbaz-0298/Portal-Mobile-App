// Tracks app-wide connectivity for the shared data hooks.
// A network/timeout failure sets it true; the next success clears it.
// The value object is memoised so consumers only re-render on real changes.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const OfflineContext = createContext(null);

export function OfflineProvider({ children }) {
  const [isOffline, setIsOffline] = useState(false);
  const setOffline = useCallback((value) => setIsOffline(value), []);
  const value = useMemo(
    () => ({ isOffline, setOffline }),
    [isOffline, setOffline]
  );
  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const value = useContext(OfflineContext);
  if (!value) throw new Error('useOffline must be used inside OfflineProvider.');
  return value;
}