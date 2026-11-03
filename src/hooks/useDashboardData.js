// Loads the three dashboard collections and exposes counts plus retry.
// Counts are computed from the loaded lists — same approach as the web app.
import { useCallback, useEffect, useState } from 'react';
import { listAssignments } from '../api/assignments';
import { listSubmissions } from '../api/submissions';
import { listBatches } from '../api/batches';
import { QUERY_LIMIT } from '../constants/options';
import { isPast } from '../utils/dates';
import { getErrorMessage } from '../utils/errors';

const EMPTY = { assignments: [], submissions: [], batches: [] };

export function useDashboardData(staff) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(EMPTY);

  const load = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [asg, subs, bt] = await Promise.all([
        listAssignments({ limit: QUERY_LIMIT }),
        listSubmissions({ limit: QUERY_LIMIT }),
        staff ? listBatches({ limit: QUERY_LIMIT }) : Promise.resolve({ items: [] }),
      ]);
      setData({ assignments: asg.items, submissions: subs.items, batches: bt.items });
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [staff]);

  useEffect(() => {
    load();
  }, [load]);

  // Why: refetch failures keep showing stale data; initial failure shows a full retry screen.
  const openAssignments = data.assignments
    .filter((item) => item.active !== false && item.dueDate && !isPast(item.dueDate))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const awaiting = data.submissions.filter((item) => item.status !== 'graded');
  const noData =
    !data.assignments.length &&
    !data.submissions.length &&
    (!staff || !data.batches.length);

  return {
    loading,
    refreshing,
    error,
    data,
    noData,
    openAssignments,
    awaiting,
    reload: () => load(),
    refresh: () => load({ refresh: true }),
  };
}
