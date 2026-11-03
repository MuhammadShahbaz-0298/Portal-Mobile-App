// Roles and permission catalog. Roles are not paginated.
import { ENDPOINTS } from '../constants/endpoints';
import { apiRequest } from './client';

export async function listRoles() {
  const { data } = await apiRequest(ENDPOINTS.roles.list);
  return {
    roles: data?.roles || [],
    permissions: data?.permissions || [],
  };
}

export async function createRole(payload) {
  const { data } = await apiRequest(ENDPOINTS.roles.list, {
    method: 'POST',
    body: payload,
  });
  return data;
}

export async function updateRole(id, payload) {
  const { data } = await apiRequest(ENDPOINTS.roles.byId(id), {
    method: 'PATCH',
    body: payload,
  });
  return data;
}

export async function deleteRole(id) {
  const { data } = await apiRequest(ENDPOINTS.roles.byId(id), {
    method: 'DELETE',
  });
  return data;
}
