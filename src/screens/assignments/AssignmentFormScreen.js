// Create or edit an assignment, including upload rules supported by the API.
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { Input } from '../../components/ui/Input';
import { SelectRow } from '../../components/ui/SelectRow';
import { ToggleRow } from '../../components/ui/ToggleRow';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { InfoBanner } from '../../components/ui/InfoBanner';
import { SectionTitle } from '../../components/ui/SectionTitle';
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
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { ASSIGNMENTS, COMMON, VALIDATION } from '../../constants/strings';
import {
  ASSIGNMENT_MAX_FILE_MB,
  DEFAULT_MAX_FILE_MB,
  RESUBMISSION_POLICIES,
} from '../../constants/options';
import { dateTimeToIso, toDateInput, toTimeInput } from '../../utils/dates';
import { getErrorMessage } from '../../utils/errors';
import { firstError, required, validNumber } from '../../utils/validators';
import { spacing } from '../../constants/theme';

export function AssignmentFormScreen({ route, navigation }) {
  const id = route.params?.id;
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const toast = useToast();
  const canCreate = hasPermission(user, PERMISSIONS.ASSIGNMENTS_CREATE);
  const canEdit = hasPermission(user, PERMISSIONS.ASSIGNMENTS_UPDATE);
  const canBatches = hasPermission(user, PERMISSIONS.BATCHES_VIEW);
  const allowed = isEdit ? canEdit : canCreate;
  const batches = useApiData(() => listBatches({ limit: 100 }), [], {
    enabled: allowed && canBatches,
  });
  const existing = useApiData(() => getAssignment(id), [id], {
    enabled: isEdit && allowed,
  });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [batchId, setBatchId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('23:59');
  const [maxSize, setMaxSize] = useState(String(DEFAULT_MAX_FILE_MB));
  const [policy, setPolicy] = useState('allowed');
  const [active, setActive] = useState(true);
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
    setMaxSize(String(value.maxFileSizeMb ?? DEFAULT_MAX_FILE_MB));
    setPolicy(value.resubmissionPolicy || 'allowed');
    setActive(value.active !== false);
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
  const selectedBatch = batchOptions.find((option) => option.value === batchId);
  const policyOptions = RESUBMISSION_POLICIES;

  async function onSubmit() {
    const dueIso = dateTimeToIso(date, time);
    const nextErrors = {
      title: required(title, ASSIGNMENTS.titleLabel),
      batchId: isEdit ? '' : required(batchId, ASSIGNMENTS.batchLabel),
      date: !date
        ? VALIDATION.required(COMMON.dueDate)
        : Number.isNaN(new Date(dueIso).getTime())
          ? VALIDATION.dateFormat
          : !isEdit && new Date(dueIso).getTime() <= Date.now()
            ? VALIDATION.dateOrder
            : '',
      maxSize: validNumber(maxSize, ASSIGNMENTS.maxSizeLabel, {
        min: 1,
        max: ASSIGNMENT_MAX_FILE_MB,
      }),
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (firstError(nextErrors)) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueIso,
      allowedFileTypes: ['zip'],
      maxFileSizeMb: Number(maxSize),
      resubmissionPolicy: policy,
    };
    if (isEdit) payload.active = active;
    else payload.batch = batchId;

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

  return (
    <Screen>
      {batches.error ? <InfoBanner tone="danger" text={batches.error} /> : null}
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
          valueLabel={selectedBatch?.label}
          options={batchOptions}
          onChange={setBatchId}
          error={errors.batchId}
        />
      ) : null}
      <View style={styles.row}>
        <Input
          label={ASSIGNMENTS.dueDateLabel}
          value={date}
          onChangeText={setDate}
          placeholder={COMMON.dateHint}
          keyboardType="numbers-and-punctuation"
          error={errors.date}
          style={styles.flex}
        />
        <Input
          label={ASSIGNMENTS.dueTimeLabel}
          value={time}
          onChangeText={setTime}
          placeholder={COMMON.timeHint}
          keyboardType="numbers-and-punctuation"
          style={styles.flex}
        />
      </View>

      <SectionTitle title={ASSIGNMENTS.advanced} />
      <InfoBanner text={ASSIGNMENTS.zipOnly} />
      <Input
        label={ASSIGNMENTS.maxSizeLabel}
        value={maxSize}
        onChangeText={setMaxSize}
        keyboardType="number-pad"
        error={errors.maxSize}
        hint={COMMON.fileSizeHint(ASSIGNMENT_MAX_FILE_MB)}
      />
      <SelectRow
        label={ASSIGNMENTS.resubmissionLabel}
        value={policy}
        valueLabel={policyOptions.find((item) => item.value === policy)?.label}
        options={policyOptions}
        onChange={setPolicy}
      />
      {isEdit ? (
        <ToggleRow
          label={ASSIGNMENTS.activeLabel}
          description={ASSIGNMENTS.activeHint}
          value={active}
          onValueChange={setActive}
        />
      ) : null}

      <FormError message={submitError} />
      <Button
        title={busy ? COMMON.saving : isEdit ? COMMON.save : COMMON.create}
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
