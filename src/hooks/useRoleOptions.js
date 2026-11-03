// Builds the role dropdown options: core roles first, then custom roles from the API.
// Used by the user form and the role form.
import { useMemo } from 'react';
import { ROLE_LABELS } from '../constants/permissions';

export function useRoleOptions(customRoles = []) {
  return useMemo(() => {
    const core = Object.entries(ROLE_LABELS).map(([value, label]) => ({
      value,
      label,
    }));
    const custom = customRoles
      .filter((item) => item?.name && !ROLE_LABELS[item.name])
      .map((item) => ({ value: item.name, label: item.label || item.name }));
    return [...core, ...custom];
  }, [customRoles]);
}
