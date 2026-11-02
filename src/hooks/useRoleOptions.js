// Builds the role filter list from core roles and custom roles returned by the API.
// Core roles come first; duplicates by name are removed.
import { useMemo } from 'react';
import { ROLE_LABELS } from '../constants/permissions';
import { COMMON } from '../constants/strings';

export function useRoleOptions(customRoles = [], includeAll = false) {
  return useMemo(() => {
    const core = Object.entries(ROLE_LABELS).map(([value, label]) => ({
      value,
      label,
    }));
    const custom = customRoles
      .filter((item) => item?.name && !ROLE_LABELS[item.name])
      .map((item) => ({ value: item.name, label: item.label || item.name }));
    const seen = new Set();
    const options = includeAll
      ? [{ value: '', label: COMMON.all }, ...core, ...custom]
      : [...core, ...custom];

    return options.filter((item) => {
      if (seen.has(item.value)) return false;
      seen.add(item.value);
      return true;
    });
  }, [customRoles, includeAll]);
}
