// Form state and handlers for the create-user screen.
// Keeps the screen limited to wiring UI components to this hook.
import { useState } from 'react';
import { useAuth } from './useAuth';
import { useApiData } from './useApiData';
import { useRoleOptions } from './useRoleOptions';
import { registerUser } from '../api/auth';
import { listRoles } from '../api/roles';
import { listBatches } from '../api/batches';
import { PERMISSIONS, hasPermission } from '../constants/permissions';
import { QUERY_LIMIT, NAME_MAX_LENGTH } from '../constants/options';
import { USERS, COMMON } from '../constants/strings';
import { generatePassword } from '../utils/password';
import { getErrorMessage } from '../utils/errors';
import {
  firstError,
  maxLength,
  required,
  validEmail,
  validPassword,
} from '../utils/validators';

export function useUserCreateForm() {
  const { user } = useAuth();
  const canCreate = hasPermission(user, PERMISSIONS.STUDENTS_CREATE);
  const canViewBatches = hasPermission(user, PERMISSIONS.BATCHES_VIEW);
  const isAdmin = user?.role === 'admin';
  const roles = useApiData(() => listRoles(), { enabled: canCreate && isAdmin });
  const batches = useApiData(() => listBatches({ limit: QUERY_LIMIT }), {
    enabled: canCreate && canViewBatches,
  });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [batchId, setBatchId] = useState('');
  const [useBatch, setUseBatch] = useState(false);
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [busy, setBusy] = useState(false);
  const [creds, setCreds] = useState(null);

  const roleOptions = useRoleOptions(isAdmin ? roles.data?.roles : []);
  const batchOptions = (batches.data?.items || []).map((item) => ({
    value: item._id,
    label: item.name,
  }));

  function onGenerate() {
    setPassword(generatePassword());
  }

  function togglePermission(perm) {
    setPermissions((current) =>
      current.includes(perm)
        ? current.filter((item) => item !== perm)
        : [...current, perm]
    );
  }

  async function onCreate() {
    const nextErrors = {
      name: required(name, USERS.nameLabel) ||
        maxLength(name, USERS.nameLabel, NAME_MAX_LENGTH),
      email: validEmail(email),
      role: required(role, USERS.roleLabel),
      password: validPassword(password, COMMON.password),
    };
    setErrors(nextErrors);
    setSubmitError('');
    if (firstError(nextErrors)) return;

    setBusy(true);
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      password,
    };
    if (isAdmin && permissions.length) payload.permissions = permissions;
    if (role === 'student' && canViewBatches && useBatch && batchId) {
      payload.batchId = batchId;
    }
    try {
      const created = await registerUser(payload);
      setCreds({
        name: created?.name || name.trim(),
        email: created?.email || email.trim(),
        password,
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return {
    canCreate,
    canViewBatches,
    isAdmin,
    roleOptions,
    batchOptions,
    name,
    setName,
    email,
    setEmail,
    role,
    setRole,
    batchId,
    setBatchId,
    useBatch,
    setUseBatch,
    password,
    setPassword,
    permissions,
    togglePermission,
    errors,
    submitError,
    busy,
    creds,
    setCreds,
    onGenerate,
    onCreate,
  };
}
