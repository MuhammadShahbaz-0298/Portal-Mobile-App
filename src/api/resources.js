import { ENDPOINTS } from '../constants/endpoints';
import { UPLOAD_TIMEOUT_MS } from '../config/env';
import { apiRequest } from './client';

export async function listResources(assignmentId) {
  const { data } = await apiRequest(ENDPOINTS.assignments.resources.list(assignmentId));
  return data || [];
}

export async function uploadResource(assignmentId, file) {
  const form = new FormData();
  form.append('resource', {
    uri: file.uri,
    name: file.name,
    type: file.type || 'application/octet-stream',
  });
  const { data } = await apiRequest(ENDPOINTS.assignments.resources.list(assignmentId), {
    method: 'POST',
    body: form,
    timeout: UPLOAD_TIMEOUT_MS,
  });
  return data;
}
