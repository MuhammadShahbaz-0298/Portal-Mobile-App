// Mark a whole class roster for one day. Existing records are loaded first and upserted.
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { SelectRow } from '../../components/ui/SelectRow';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { InfoBanner } from '../../components/ui/InfoBanner';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useToast } from '../../context/ToastContext';
import { addAttendance, listAttendance } from '../../api/attendance';
import { getBatchStudents, listBatches } from '../../api/batches';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { ATTENDANCE, COMMON, VALIDATION } from '../../constants/strings';
import { ATTENDANCE_STATUSES } from '../../constants/options';
import { todayInput } from '../../utils/dates';
import { getErrorMessage } from '../../utils/errors';
import { getId } from '../../utils/ids';
import { colors, spacing } from '../../constants/theme';

export function AttendanceMarkScreen({ navigation }) {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = hasPermission(user, PERMISSIONS.ATTENDANCE_MANAGE);
  const [batchId, setBatchId] = useState('');
  const [date, setDate] = useState(todayInput());
  const [statuses, setStatuses] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= todayInput();
  const batches = useApiData(() => listBatches({ limit: 100 }), [], {
    enabled: canManage,
  });
  const roster = useApiData(
    () => getBatchStudents(batchId, { limit: 100 }),
    [batchId],
    { enabled: canManage && Boolean(batchId) }
  );
  const existing = useApiData(
    () => listAttendance({ batchId, date, limit: 100 }),
    [batchId, date],
    { enabled: canManage && Boolean(batchId) && validDate }
  );

  useEffect(() => {
    setStatuses({});
  }, [batchId, date]);

  useEffect(() => {
    const next = {};
    (roster.data?.items || []).forEach((student) => {
      next[getId(student)] = 'absent';
    });
    (existing.data?.items || []).forEach((record) => {
      next[getId(record.student)] = record.status;
    });
    setStatuses(next);
  }, [roster.data, existing.data]);

  if (!canManage) return <Screen><PermissionState /></Screen>;

  const options = (batches.data?.items || []).map((batch) => ({
    value: batch._id,
    label: batch.name,
  }));
  const students = roster.data?.items || [];

  function markAll() {
    const next = { ...statuses };
    students.forEach((student) => {
      next[getId(student)] = 'present';
    });
    setStatuses(next);
  }

  async function onSave() {
    setError('');
    if (!batchId) return setError(VALIDATION.required(ATTENDANCE.batchLabel));
    if (!validDate) return setError(VALIDATION.required(ATTENDANCE.dateLabel));
    if (!students.length) return setError(ATTENDANCE.noStudents);
    if (existing.loading || existing.error) {
      return setError(ATTENDANCE.existingCheckFailed);
    }

    setBusy(true);
    const results = await Promise.allSettled(
      students.map((student) =>
        addAttendance({
          studentId: getId(student),
          batchId,
          date,
          status: statuses[getId(student)] || 'absent',
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
      <Input
        label={ATTENDANCE.dateLabel}
        value={date}
        onChangeText={setDate}
        placeholder={COMMON.dateHint}
        keyboardType="numbers-and-punctuation"
        hint={COMMON.dateHint}
      />
      {!validDate ? (
        <InfoBanner tone="warning" text={ATTENDANCE.invalidDate} />
      ) : null}
      {batches.error ? <InfoBanner tone="danger" text={batches.error} /> : null}

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
          <View style={styles.row}>
            <AppText variant="subtitle">
              {ATTENDANCE.studentLabel} ({students.length})
            </AppText>
            <Button
              title={ATTENDANCE.markAllPresent}
              variant="ghost"
              compact
              onPress={markAll}
            />
          </View>
          {students.map((student) => (
            <View key={getId(student)} style={styles.student}>
              <AppText variant="body">{student.name}</AppText>
              <AppText variant="caption">{student.email}</AppText>
              <SegmentedControl
                options={ATTENDANCE_STATUSES}
                value={statuses[getId(student)] || 'absent'}
                onChange={(value) =>
                  setStatuses((current) => ({ ...current, [getId(student)]: value }))
                }
              />
            </View>
          ))}
        </Card>
      ) : null}

      <FormError message={error} />
      <Button
        title={busy ? COMMON.saving : COMMON.save}
        onPress={onSave}
        loading={busy}
        disabled={
          !students.length ||
          !validDate ||
          existing.loading ||
          Boolean(existing.error)
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  student: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
});
