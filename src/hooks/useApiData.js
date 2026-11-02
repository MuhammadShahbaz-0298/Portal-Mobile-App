// Single-resource lifecycle with loading, retry, and optional refresh.
// Pass reloadKey to re-run the fetch when that value changes.
import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../utils/errors';

export function useApiData(fetcher, { enabled = true, reloadKey } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const fetcherRef = useRef(fetcher);
  const requestId = useRef(0);

  // Keep the latest fetcher without writing to the ref during render.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const load = useCallback(
    async (refresh = false) => {
      if (!enabled) {
        setLoading(false);
        return;
      }
      const id = ++requestId.current;
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const result = await fetcherRef.current();
        if (id === requestId.current) setData(result);
      } catch (loadError) {
        if (id === requestId.current) setError(getErrorMessage(loadError));
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [enabled]
  );

  const refresh = useCallback(() => load(true), [load]);
  const retry = useCallback(() => load(false), [load]);

  useEffect(() => {
    if (enabled) load(false);
    else setLoading(false);
  }, [enabled, load, reloadKey]);

  useEffect(
    () => () => {
      requestId.current += 1;
    },
    []
  );

  return {
    data,
    setData,
    loading,
    refreshing,
    error,
    refresh,
    retry,
  };
}
