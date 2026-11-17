// Standard list lifecycle: page 1 on filter changes, Load more, refresh, retry.
// A quiet refresh reloads page 1 without showing the pull-to-refresh spinner,
// which is used when a screen regains focus and the old items stay visible.
// Reports offline state to the shared OfflineContext for the whole app.
import { useCallback, useEffect, useRef, useState } from 'react';
import { PAGE_SIZE } from '../constants/options';
import { getErrorMessage, isOfflineError } from '../utils/errors';
import { useOffline } from '../context/OfflineContext';

export function usePaginatedList(fetcher, params = {}, { enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: PAGE_SIZE, total: 0 });
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const fetcherRef = useRef(fetcher);
  const paramsRef = useRef(params);
  const requestId = useRef(0);
  const paramKey = JSON.stringify(params);
  const { setOffline } = useOffline();

  // Keep the latest fetcher and filters without writing refs during render.
  useEffect(() => {
    fetcherRef.current = fetcher;
    paramsRef.current = params;
  });

  const load = useCallback(
    async ({ page = 1, append = false, refresh = false, quiet = false } = {}) => {
      if (!enabled) return;
      const id = ++requestId.current;
      if (append) setLoadingMore(true);
      else if (refresh) setRefreshing(true);
      else if (!quiet) setLoading(true);
      setError('');

      try {
        const result = await fetcherRef.current({
          ...paramsRef.current,
          page,
          limit: PAGE_SIZE,
        });
        if (id !== requestId.current) return;
        setItems((current) =>
          append ? [...current, ...(result.items || [])] : result.items || []
        );
        setMeta(result.meta || { page, limit: PAGE_SIZE, total: 0 });
        setOffline(false);
      } catch (loadError) {
        if (id === requestId.current) {
          setOffline(isOfflineError(loadError));
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [enabled, setOffline]
  );

  useEffect(() => {
    if (enabled) load({ page: 1 });
    else setLoading(false);
  }, [enabled, paramKey, reloadKey, load]);

  useEffect(
    () => () => {
      requestId.current += 1;
    },
    []
  );

  const refresh = useCallback(() => load({ page: 1, refresh: true }), [load]);
  const quietRefresh = useCallback(
    () => load({ page: 1, quiet: true }),
    [load]
  );
  const retry = useCallback(() => load({ page: 1 }), [load]);
  const loadMore = useCallback(() => {
    if (items.length < meta.total && !loadingMore) {
      load({ page: meta.page + 1, append: true });
    }
  }, [items.length, meta.total, meta.page, loadingMore, load]);
  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  return {
    items,
    meta,
    loading,
    loadingMore,
    refreshing,
    error,
    refresh,
    quietRefresh,
    retry,
    loadMore,
    reload,
    setItems,
  };
}
