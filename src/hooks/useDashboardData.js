// Loads the three dashboard collections plus the admin student total.
// Counts are computed from the loaded lists — same approach as the web app.
import { useCallback, useEffect, useState } from 'react';
import { listAssignments } from '../api/assignments';
import { listSubmissions } from '../api/submissions';
import { listBatches } from '../api/batches';
import { listUsers } from '../api/users';
import { QUERY_LIMIT, STUDENT_COUNT_LIMIT } from '../constants/options';
import { ROLES } from '../constants/permissions';
import { isPast } from '../utils/dates';
import { getErrorMessage } from '../utils/errors';

const EMPTY = { assignments: [], submissions: [], batches: [], studentsCount: 0 };

// Why: a failed count must not hide the rest of the dashboard.
async function countStudents() {
  try {
    const { meta } = await listUsers({ role: ROLES.STUDENT, limit: STUDENT_COUNT_LIMIT });
    return meta.total;
  } catch {
    return 0;
  }
}

export function useDashboardData(staff, showStudents = false) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(EMPTY);

  const load = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [asg, subs, bt, studentsCount] = await Promise.all([
        listAssignments({ limit: QUERY_LIMIT }),
        listSubmissions({ limit: QUERY_LIMIT }),
        staff ? listBatches({ limit: QUERY_LIMIT }) : Promise.resolve({ items: [] }),
        showStudents ? countStudents() : Promise.resolve(0),
      ]);
      setData({
        assignments: asg.items,
        submissions: subs.items,
        batches: bt.items,
        studentsCount,
      });
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [staff, showStudents]);

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
