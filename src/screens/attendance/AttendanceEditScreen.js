// Edit one attendance record's date or status.
import { useState } from 'react';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Row } from '../../components/ui/Row';
import { Input } from '../../components/ui/Input';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { updateAttendance } from '../../api/attendance';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { ATTENDANCE, COMMON, VALIDATION } from '../../constants/strings';
import { ATTENDANCE_STATUSES } from '../../constants/options';
import { toDateInput, todayInput } from '../../utils/dates';
import { getErrorMessage } from '../../utils/errors';
import { getDisplayName } from '../../utils/ids';

export function AttendanceEditScreen({ route, navigation }) {
  const record = route.params?.record;
  const { user } = useAuth();
  const toast = useToast();
  const canManage = hasPermission(user, PERMISSIONS.ATTENDANCE_MANAGE);
  const [date, setDate] = useState(toDateInput(record?.date));
  const [status, setStatus] = useState(record?.status || 'present');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!canManage) return <Screen><PermissionState /></Screen>;
  if (!record) return <Screen><ErrorState message={COMMON.noResults} /></Screen>;

  async function onSave() {
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= todayInput();
    if (!validDate) return setError(ATTENDANCE.invalidDate);
    setBusy(true);
    setError('');
    try {
      await updateAttendance(record._id, { date, status });
      toast(ATTENDANCE.updated);
      navigation.goBack();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Card>
        <AppText variant="subtitle">{getDisplayName(record.student)}</AppText>
        <Row label={COMMON.batch} value={record.batch?.name || record.batchName} />
      </Card>
      <Input
        label={ATTENDANCE.dateLabel}
        value={date}
        onChangeText={setDate}
        placeholder={COMMON.dateHint}
        keyboardType="numbers-and-punctuation"
        hint={COMMON.dateHint}
        error={!date ? VALIDATION.required(ATTENDANCE.dateLabel) : ''}
      />
      <AppText variant="label">{ATTENDANCE.statusLabel}</AppText>
      <SegmentedControl
        options={ATTENDANCE_STATUSES}
        value={status}
        onChange={setStatus}
      />
      <FormError message={error} />
      <Button
        title={busy ? COMMON.saving : COMMON.save}
        onPress={onSave}
        loading={busy}
      />
    </Screen>
  );
}
