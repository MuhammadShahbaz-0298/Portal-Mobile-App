// Add a calendar event. Teachers pick one of their batches; admins may go school-wide.
import { useState } from 'react';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { DateField } from '../../components/ui/DateField';
import { SelectRow } from '../../components/ui/SelectRow';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useToast } from '../../context/ToastContext';
import { createEvent } from '../../api/events';
import { listBatches } from '../../api/batches';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { EVENTS, COMMON } from '../../constants/strings';
import { QUERY_LIMIT } from '../../constants/options';
import { getBatchName } from '../../utils/ids';
import { getErrorMessage } from '../../utils/errors';
import { firstError, required } from '../../utils/validators';

const EMPTY_FORM = { title: '', description: '', date: '', endDate: '', batchId: '' };

export function EventFormScreen({ navigation }) {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = can(user, PERMISSIONS.EVENTS_MANAGE, ROLE_SETS.STAFF);
  const schoolWideAllowed = ROLE_SETS.ADMIN.includes(user?.role);
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
  if (schoolWideAllowed) {
    batchOptions.unshift({ value: '', label: EVENTS.schoolWide });
  }

  async function onSubmit() {
    const nextErrors = {
      title: required(form.title, EVENTS.titleLabel),
      date: required(form.date, EVENTS.dateLabel),
      batchId: schoolWideAllowed ? '' : required(form.batchId, EVENTS.batchRequired),
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (firstError(nextErrors)) return;

    setBusy(true);
    try {
      await createEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        endDate: form.endDate || undefined,
        batchId: form.batchId || undefined,
      });
      toast(EVENTS.created);
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
        <Input
          label={EVENTS.titleLabel}
          value={form.title}
          onChangeText={(value) => updateField('title', value)}
          error={errors.title}
        />
        <Input
          label={EVENTS.descriptionLabel}
          value={form.description}
          onChangeText={(value) => updateField('description', value)}
          multiline
        />
        <DateField
          label={EVENTS.dateLabel}
          value={form.date}
          error={errors.date}
          onChange={(value) => updateField('date', value)}
        />
        <DateField
          label={EVENTS.endDateLabel}
          value={form.endDate}
          allowClear
          onChange={(value) => updateField('endDate', value)}
        />
        <SelectRow
          label={EVENTS.batchLabel}
          value={form.batchId}
          valueLabel={batchOptions.find((item) => item.value === form.batchId)?.label}
          options={batchOptions}
          error={errors.batchId}
          onChange={(value) => updateField('batchId', value)}
        />
        <FormError message={submitError} />
        <Button title={COMMON.create} onPress={onSubmit} loading={busy} />
      </Card>
    </Screen>
  );
}
