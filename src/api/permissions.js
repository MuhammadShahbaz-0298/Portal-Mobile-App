// Permission catalog and per-user extra permissions.
import { ENDPOINTS } from '../constants/endpoints';
import { apiRequest } from './client';

export async function getPermissionCatalog() {
  const { data } = await apiRequest(ENDPOINTS.permissions.catalog);
  return {
    permissions: data?.permissions || [],
    roleDefaults: data?.roleDefaults || {},
  };
}

export async function updateUserPermissions(id, permissions) {
  const { data } = await apiRequest(ENDPOINTS.permissions.user(id), {
    method: 'PATCH',
    body: { permissions },
  });
  return data;
}
