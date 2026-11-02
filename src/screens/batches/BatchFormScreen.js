// Create or edit a batch. Admins also choose the assigned teacher.
import { useState } from 'react';
import { Screen } from '../../components/ui/Screen';
import { Input } from '../../components/ui/Input';
import { SelectRow } from '../../components/ui/SelectRow';
import { Button } from '../../components/ui/Button';
import { FormError } from '../../components/ui/FormError';
import { PermissionState } from '../../components/states/PermissionState';
import { ErrorState } from '../../components/states/ErrorState';
import { useAuth } from '../../hooks/useAuth';
import { useApiData } from '../../hooks/useApiData';
import { useToast } from '../../context/ToastContext';
import { createBatch, updateBatch } from '../../api/batches';
import { listUsers } from '../../api/users';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { BATCHES, COMMON, VALIDATION } from '../../constants/strings';
import { getErrorMessage } from '../../utils/errors';
import { getId } from '../../utils/ids';

export function BatchFormScreen({ route, navigation }) {
  const batch = route.params?.batch;
  const editing = Boolean(batch);
  const { user } = useAuth();
  const toast = useToast();
  const allowed = editing
    ? hasPermission(user, PERMISSIONS.BATCHES_UPDATE)
    : hasPermission(user, PERMISSIONS.BATCHES_CREATE);
  const isAdmin = user?.role === 'admin';
  const teachers = useApiData(() => listUsers({ role: 'teacher', limit: 100 }), [], {
    enabled: allowed && isAdmin,
  });
  const [name, setName] = useState(batch?.name || '');
  const [teacherId, setTeacherId] = useState(getId(batch?.teacher) || '');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!allowed) return <Screen><PermissionState /></Screen>;
  if (editing && !batch) return <Screen><ErrorState message={COMMON.noResults} /></Screen>;

  const teacherOptions = (teachers.data?.items || []).map((teacher) => ({
    value: teacher._id,
    label: teacher.name,
  }));

  async function onSave() {
    const nextErrors = {
      name: !name.trim()
        ? VALIDATION.required(BATCHES.nameLabel)
        : name.trim().length > 100
          ? VALIDATION.maxLength(BATCHES.nameLabel, 100)
          : '',
      teacher: isAdmin && !teacherId ? VALIDATION.required(BATCHES.teacherLabel) : '',
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (nextErrors.name || nextErrors.teacher) return;

    setBusy(true);
    const payload = { name: name.trim() };
    if (isAdmin) payload.teacherId = teacherId;
    try {
      if (editing) await updateBatch(batch._id, payload);
      else await createBatch(payload);
      toast(editing ? BATCHES.updated : BATCHES.created);
      navigation.goBack();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Input
        label={BATCHES.nameLabel}
        value={name}
        onChangeText={setName}
        placeholder={BATCHES.namePlaceholder}
        maxLength={100}
        error={errors.name}
      />
      {isAdmin ? (
        <SelectRow
          label={BATCHES.teacherLabel}
          value={teacherId}
          valueLabel={teacherOptions.find((item) => item.value === teacherId)?.label}
          options={teacherOptions}
          onChange={setTeacherId}
          error={errors.teacher}
        />
      ) : null}
      {teachers.error ? <FormError message={teachers.error} /> : null}
      <FormError message={submitError} />
      <Button
        title={busy ? COMMON.saving : editing ? COMMON.save : BATCHES.newTitle}
        onPress={onSave}
        loading={busy}
      />
    </Screen>
  );
}
