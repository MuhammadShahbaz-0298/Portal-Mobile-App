// Create or edit a batch. Teachers are assigned to themselves; other actors pick a teacher.
// Backend requires a valid active teacher for any non-teacher actor.
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
import { PERMISSIONS, ROLE_SETS, can } from '../../constants/permissions';
import { isTeacherRole } from '../../utils/access';
import { BATCHES, COMMON, VALIDATION } from '../../constants/strings';
import { BATCH_NAME_MAX_LENGTH, QUERY_LIMIT } from '../../constants/options';
import { getErrorMessage } from '../../utils/errors';
import { getId } from '../../utils/ids';

export function BatchFormScreen({ route, navigation }) {
  const batch = route.params?.batch;
  const editing = Boolean(batch);
  const { user } = useAuth();
  const toast = useToast();
  const isTeacher = isTeacherRole(user);
  const allowed = editing
    ? can(user, PERMISSIONS.BATCHES_UPDATE, ROLE_SETS.STAFF)
    : can(user, PERMISSIONS.BATCHES_CREATE, ROLE_SETS.STAFF);
  // Any non-teacher must pick a teacher; teachers are always assigned to themselves.
  const needsTeacher = !isTeacher;
  const canViewTeachers = can(user, PERMISSIONS.STUDENTS_VIEW, ROLE_SETS.ADMIN);
  const teachers = useApiData(() => listUsers({ role: 'teacher', limit: QUERY_LIMIT }), {
    enabled: allowed && needsTeacher && canViewTeachers,
  });
  const [name, setName] = useState(batch?.name || '');
  const [teacherId, setTeacherId] = useState(getId(batch?.teacher) || '');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!allowed) return <Screen><PermissionState /></Screen>;
  if (editing && !batch) return <Screen><ErrorState message={BATCHES.notFound} /></Screen>;

  const teacherOptions = (teachers.data?.items || []).map((teacher) => ({
    value: teacher._id,
    label: teacher.name,
  }));

  async function onSave() {
    const trimmed = name.trim();
    const nextErrors = {
      name: !trimmed
        ? VALIDATION.required(BATCHES.nameLabel)
        : trimmed.length > BATCH_NAME_MAX_LENGTH
          ? VALIDATION.maxLength(BATCHES.nameLabel, BATCH_NAME_MAX_LENGTH)
          : '',
      teacher:
        needsTeacher && !teacherId ? VALIDATION.required(BATCHES.teacherLabel) : '',
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (nextErrors.name || nextErrors.teacher) return;

    setBusy(true);
    const payload = { name: trimmed };
    if (needsTeacher) payload.teacherId = teacherId;
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

  let saveTitle = BATCHES.newTitle;
  if (editing) saveTitle = COMMON.save;
  if (busy) saveTitle = COMMON.saving;

  return (
    <Screen>
      <Input
        label={BATCHES.nameLabel}
        value={name}
        onChangeText={setName}
        placeholder={BATCHES.namePlaceholder}
        maxLength={BATCH_NAME_MAX_LENGTH}
        error={errors.name}
      />
      {needsTeacher ? (
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
        title={saveTitle}
        onPress={onSave}
        loading={busy}
      />
    </Screen>
  );
}
