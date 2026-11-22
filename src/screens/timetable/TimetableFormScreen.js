// Add a timetable entry for one of the manager's batches.
import { useState } from 'react';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { SelectRow } from '../../components/ui/SelectRow';
import { TimeField } from '../../components/ui/TimeField';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useToast } from '../../context/ToastContext';
import { createTimetableEntry } from '../../api/timetable';
import { listBatches } from '../../api/batches';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { TIMETABLE, COMMON } from '../../constants/strings';
import { DAYS_OF_WEEK, QUERY_LIMIT } from '../../constants/options';
import { getBatchName } from '../../utils/ids';
import { getErrorMessage } from '../../utils/errors';
import { firstError, required } from '../../utils/validators';

const EMPTY_FORM = {
  batchId: '',
  dayOfWeek: DAYS_OF_WEEK[0],
  startTime: '',
  endTime: '',
  subject: '',
};

export function TimetableFormScreen({ navigation }) {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = can(user, PERMISSIONS.TIMETABLE_MANAGE, ROLE_SETS.STAFF);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);
  const batches = useApiData(() => listBatches({ limit: QUERY_LIMIT }), {
    enabled: canManage,
  });

  if (!canManage) return <Screen><PermissionState /></Screen>;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const batchOptions = (batches.data?.items || []).map((item) => ({
    value: item._id,
    label: getBatchName(item),
  }));
  const dayOptions = DAYS_OF_WEEK.map((day) => ({
    value: day,
    label: TIMETABLE.days[day] || day,
  }));

  async function onSubmit() {
    const nextErrors = {
      batchId: required(form.batchId, COMMON.batch),
      startTime: required(form.startTime, TIMETABLE.startTimeLabel),
      endTime: required(form.endTime, TIMETABLE.endTimeLabel),
      subject: required(form.subject, TIMETABLE.subjectLabel),
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (firstError(nextErrors)) return;

    setBusy(true);
    try {
      await createTimetableEntry({
        batchId: form.batchId,
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        subject: form.subject.trim(),
      });
      toast(TIMETABLE.created);
      navigation.goBack();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (batches.loading) return <Screen><LoadingState /></Screen>;
  if (batches.error && !batches.data) {
    return <Screen><ErrorState message={batches.error} onRetry={batches.retry} /></Screen>;
  }

  return (
    <Screen>
      <Card>
        <SelectRow
          label={COMMON.batch}
          value={form.batchId}
          valueLabel={batchOptions.find((item) => item.value === form.batchId)?.label}
          options={batchOptions}
          error={errors.batchId}
          onChange={(value) => updateField('batchId', value)}
        />
        <SelectRow
          label={TIMETABLE.dayLabel}
          value={form.dayOfWeek}
          valueLabel={dayOptions.find((item) => item.value === form.dayOfWeek)?.label}
          options={dayOptions}
          onChange={(value) => updateField('dayOfWeek', value)}
        />
        <TimeField
          label={TIMETABLE.startTimeLabel}
          value={form.startTime}
          error={errors.startTime}
          onChange={(value) => updateField('startTime', value)}
        />
        <TimeField
          label={TIMETABLE.endTimeLabel}
          value={form.endTime}
          error={errors.endTime}
          onChange={(value) => updateField('endTime', value)}
        />
        <Input
          label={TIMETABLE.subjectLabel}
          value={form.subject}
          onChangeText={(value) => updateField('subject', value)}
          error={errors.subject}
        />
        <FormError message={submitError} />
        <Button title={COMMON.create} onPress={onSubmit} loading={busy} />
      </Card>
    </Screen>
  );
}
