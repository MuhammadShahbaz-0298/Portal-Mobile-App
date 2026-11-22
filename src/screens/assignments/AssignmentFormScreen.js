// Create or edit an assignment. Fields match the web app: title, description, due date, batch.
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { Input } from '../../components/ui/Input';
import { DateField } from '../../components/ui/DateField';
import { TimeField } from '../../components/ui/TimeField';
import { SelectRow } from '../../components/ui/SelectRow';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import { PermissionState } from '../../components/states/PermissionState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useToast } from '../../context/ToastContext';
import {
  createAssignment,
  getAssignment,
  updateAssignment,
} from '../../api/assignments';
import { listBatches } from '../../api/batches';
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { ASSIGNMENTS, COMMON, VALIDATION } from '../../constants/strings';
import { QUERY_LIMIT } from '../../constants/options';
import { dateTimeToIso, toDateInput, toTimeInput } from '../../utils/dates';
import { getErrorMessage } from '../../utils/errors';
import { firstError, required } from '../../utils/validators';
import { spacing } from '../../constants/theme';

export function AssignmentFormScreen({ route, navigation }) {
  const id = route.params?.id;
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const toast = useToast();
  const canCreate = can(user, PERMISSIONS.ASSIGNMENTS_CREATE, ROLE_SETS.STAFF);
  const canUpdate = can(user, PERMISSIONS.ASSIGNMENTS_UPDATE, ROLE_SETS.STAFF);
  const canBatches = can(user, PERMISSIONS.BATCHES_VIEW, ROLE_SETS.STAFF);
  const allowed = isEdit ? canUpdate : canCreate;
  const batches = useApiData(() => listBatches({ limit: QUERY_LIMIT }), {
    enabled: allowed && canBatches,
  });
  const existing = useApiData(() => getAssignment(id), {
    enabled: isEdit && allowed,
    reloadKey: id,
  });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [batchId, setBatchId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('23:59');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const value = existing.data;
    if (!value) return;
    setTitle(value.title || '');
    setDescription(value.description || '');
    setBatchId(value.batch?._id || value.batch || '');
    setDate(toDateInput(value.dueDate));
    setTime(toTimeInput(value.dueDate));
  }, [existing.data]);

  if (!allowed) return <Screen><PermissionState /></Screen>;
  if (isEdit && existing.loading) return <Screen><LoadingState /></Screen>;
  if (isEdit && existing.error && !existing.data) {
    return <Screen><ErrorState message={existing.error} onRetry={existing.retry} /></Screen>;
  }

  const batchOptions = (batches.data?.items || []).map((batch) => ({
    value: batch._id,
    label: batch.name,
  }));

  async function onSubmit() {
    const dueIso = dateTimeToIso(date, time);
    const dateError = !date
      ? VALIDATION.required(ASSIGNMENTS.dueDateLabelFull)
      : Number.isNaN(new Date(dueIso).getTime())
        ? VALIDATION.dateFormat
        : '';
    const nextErrors = {
      title: required(title, ASSIGNMENTS.titleLabel),
      batchId: isEdit ? '' : required(batchId, ASSIGNMENTS.batchLabel),
      date: dateError,
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (firstError(nextErrors)) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueIso,
    };
    if (!isEdit) payload.batch = batchId;

    setBusy(true);
    try {
      if (isEdit) await updateAssignment(id, payload);
      else await createAssignment(payload);
      toast(isEdit ? ASSIGNMENTS.updated : ASSIGNMENTS.created);
      navigation.goBack();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  let submitTitle = COMMON.create;
  if (isEdit) submitTitle = COMMON.save;
  if (busy) submitTitle = COMMON.saving;

  return (
    <Screen>
      <Input
        label={ASSIGNMENTS.titleLabel}
        value={title}
        onChangeText={setTitle}
        placeholder={ASSIGNMENTS.titlePlaceholder}
        maxLength={160}
        error={errors.title}
      />
      <Input
        label={COMMON.description}
        value={description}
        onChangeText={setDescription}
        placeholder={ASSIGNMENTS.descriptionPlaceholder}
        multiline
        maxLength={5000}
      />
      {!isEdit ? (
        <SelectRow
          label={ASSIGNMENTS.batchLabel}
          value={batchId}
          valueLabel={batchOptions.find((item) => item.value === batchId)?.label}
          options={batchOptions}
          onChange={setBatchId}
          error={errors.batchId}
        />
      ) : null}
      <View style={styles.row}>
        <DateField
          label={ASSIGNMENTS.dueDateLabel}
          value={date}
          onChange={setDate}
          error={errors.date}
          style={styles.flex}
        />
        <TimeField
          label={ASSIGNMENTS.dueTimeLabel}
          value={time}
          onChange={setTime}
          style={styles.flex}
        />
      </View>

      <FormError message={submitError} />
      <Button
        title={submitTitle}
        onPress={onSubmit}
        loading={busy}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
