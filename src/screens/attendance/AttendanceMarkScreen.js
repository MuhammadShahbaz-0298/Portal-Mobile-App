// Mark a whole class roster for one day. Checked = present; the rest = absent.
// Existing records for that day are loaded first, so saving twice is safe.
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { DateField } from '../../components/ui/DateField';
import { SelectRow } from '../../components/ui/SelectRow';
import { CheckboxRow } from '../../components/ui/CheckboxRow';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { isStaffRole } from '../../utils/access';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useToast } from '../../context/ToastContext';
import { markAttendance, listAttendance } from '../../api/attendance';
import { getBatchStudents, listBatches } from '../../api/batches';
import { PERMISSIONS, can } from '../../constants/permissions';
import { ATTENDANCE, COMMON, VALIDATION } from '../../constants/strings';
import { QUERY_LIMIT } from '../../constants/options';
import { todayInput } from '../../utils/dates';
import { getErrorMessage } from '../../utils/errors';
import { getId } from '../../utils/ids';

export function AttendanceMarkScreen({ navigation }) {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = can(user, PERMISSIONS.ATTENDANCE_MANAGE, ['admin', 'teacher']);
  const staff = isStaffRole(user);
  const [batchId, setBatchId] = useState('');
  const [date, setDate] = useState(todayInput());
  const [presentIds, setPresentIds] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= todayInput();

  const batches = useApiData(() => listBatches({ limit: QUERY_LIMIT }), {
    enabled: canManage && staff,
  });
  const roster = useApiData(
    () => getBatchStudents(batchId, { limit: QUERY_LIMIT }),
    { enabled: canManage && staff && Boolean(batchId), reloadKey: batchId }
  );
  const existing = useApiData(
    () => listAttendance({ batchId, date, limit: QUERY_LIMIT }),
    { enabled: canManage && staff && Boolean(batchId) && validDate,
      reloadKey: `${batchId}-${date}` }
  );

  useEffect(() => {
    if (!roster.data || existing.loading) return;
    const next = {};
    (existing.data?.items || []).forEach((record) => {
      if (record.status === 'present') next[getId(record.student)] = true;
    });
    setPresentIds(next);
  }, [roster.data, existing.data, existing.loading]);

  if (!canManage || !staff) return <Screen><PermissionState /></Screen>;

  const options = (batches.data?.items || []).map((batch) => ({
    value: batch._id,
    label: batch.name,
  }));
  const students = roster.data?.items || [];
  const presentCount = students.filter((s) => presentIds[getId(s)]).length;

  function toggle(studentId) {
    setPresentIds((current) => ({ ...current, [studentId]: !current[studentId] }));
  }

  async function onSave() {
    setError('');
    if (!batchId) return setError(VALIDATION.required(ATTENDANCE.batchLabel));
    if (!validDate) return setError(ATTENDANCE.invalidDate);
    if (!students.length) return setError(ATTENDANCE.noStudents);
    if (existing.loading || Boolean(existing.error)) {
      return setError(ATTENDANCE.existingCheckFailed);
    }

    setBusy(true);
    const results = await Promise.allSettled(
      students.map((student) =>
        markAttendance({
          studentId: getId(student),
          batchId,
          date,
          status: presentIds[getId(student)] ? 'present' : 'absent',
        })
      )
    );
    const failed = results.filter((result) => result.status === 'rejected').length;
    setBusy(false);

    if (failed) {
      const reason = getErrorMessage(
        results.find((result) => result.status === 'rejected')?.reason
      );
      setError(`${ATTENDANCE.partialSaved(failed)} ${reason}`);
      return;
    }
    toast(ATTENDANCE.saved);
    navigation.goBack();
  }

  return (
    <Screen>
      <SelectRow
        label={ATTENDANCE.batchLabel}
        value={batchId}
        valueLabel={options.find((option) => option.value === batchId)?.label}
        options={options}
        onChange={setBatchId}
      />
      <DateField
        label={ATTENDANCE.dateLabel}
        value={date}
        onChange={setDate}
        maximumDate={new Date()}
      />
      {!validDate ? <FormError message={ATTENDANCE.invalidDate} /> : null}

      {batchId && roster.loading ? <LoadingState /> : null}
      {roster.error ? <ErrorState message={roster.error} onRetry={roster.retry} /> : null}
      {existing.error ? (
        <ErrorState message={existing.error} onRetry={existing.retry} />
      ) : null}
      {!roster.loading && batchId && !students.length && !roster.error ? (
        <EmptyState title={ATTENDANCE.noStudents} icon="people-outline" />
      ) : null}

      {students.length ? (
        <Card>
          <View style={styles.header}>
            <AppText variant="subtitle">
              {ATTENDANCE.studentLabel}
            </AppText>
            <AppText variant="caption">
              {ATTENDANCE.presentCount(presentCount, students.length)}
            </AppText>
          </View>
          <AppText variant="caption">{ATTENDANCE.markHint}</AppText>
          {students.map((student) => (
            <CheckboxRow
              key={getId(student)}
              name={student.name}
              email={student.email}
              checked={Boolean(presentIds[getId(student)])}
              onToggle={() => toggle(getId(student))}
              disabled={busy}
            />
          ))}
        </Card>
      ) : null}

      <FormError message={error} />
      <Button
        title={busy ? COMMON.saving : COMMON.save}
        onPress={onSave}
        loading={busy}
        disabled={!students.length || !validDate || existing.loading || Boolean(existing.error)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
