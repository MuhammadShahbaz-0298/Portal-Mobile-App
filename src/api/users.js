// User list and account lifecycle calls.
import { ENDPOINTS } from '../constants/endpoints';
import { buildQuery } from '../utils/query';
import { apiRequest } from './client';

export async function listUsers(params = {}) {
  const { data, meta } = await apiRequest(
    `${ENDPOINTS.users.list}${buildQuery(params)}`
  );
  return { items: data || [], meta };
}

export async function updateUser(id, payload) {
  const { data } = await apiRequest(ENDPOINTS.users.byId(id), {
    method: 'PATCH',
    body: payload,
  });
  return data;
}

export async function archiveUser(id) {
  const { data } = await apiRequest(ENDPOINTS.users.archive(id), {
    method: 'PATCH',
  });
  return data;
}

export async function restoreUser(id) {
  return updateUser(id, { active: true });
}

export async function resetUserPassword(id) {
  const { data } = await apiRequest(ENDPOINTS.users.resetPassword(id), {
    method: 'PATCH',
  });
  return data.temporaryPassword;
}

export async function deleteUser(id) {
  const { data } = await apiRequest(ENDPOINTS.users.byId(id), {
    method: 'DELETE',
  });
  return data;
}
