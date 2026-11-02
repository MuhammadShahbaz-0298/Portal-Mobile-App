// Single-resource lifecycle with loading, retry, and optional refresh.
import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../utils/errors';

export function useApiData(fetcher, deps = [], { enabled = true } = {}) {
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

  useEffect(() => {
    if (enabled) load(false);
    else setLoading(false);
    // The caller controls reloads through the deps array.
  }, [enabled, load, ...deps]);

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
    refresh: () => load(true),
    retry: () => load(false),
  };
}
