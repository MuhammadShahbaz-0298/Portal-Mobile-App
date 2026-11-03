// Permission catalog returned by the API (used by the role editor).
import { ENDPOINTS } from '../constants/endpoints';
import { apiRequest } from './client';

export async function getPermissionCatalog() {
  const { data } = await apiRequest(ENDPOINTS.permissions.catalog);
  return {
    permissions: data?.permissions || [],
    roleDefaults: data?.roleDefaults || {},
  };
}
