// Assignment list, detail, create, edit, and archive calls.
import { ENDPOINTS } from '../constants/endpoints';
import { buildQuery } from '../utils/query';
import { apiRequest } from './client';

export async function listAssignments(params = {}) {
  const { data, meta } = await apiRequest(
    `${ENDPOINTS.assignments.list}${buildQuery(params)}`
  );
  return { items: data || [], meta };
}

export async function getAssignment(id) {
  const { data } = await apiRequest(ENDPOINTS.assignments.byId(id));
  return data;
}

export async function createAssignment(payload) {
  const { data } = await apiRequest(ENDPOINTS.assignments.create, {
    method: 'POST',
    body: payload,
  });
  return data;
}

export async function updateAssignment(id, payload) {
  const { data } = await apiRequest(ENDPOINTS.assignments.byId(id), {
    method: 'PATCH',
    body: payload,
  });
  return data;
}

export async function archiveAssignment(id) {
  const { data } = await apiRequest(ENDPOINTS.assignments.byId(id), {
    method: 'DELETE',
  });
  return data;
}
