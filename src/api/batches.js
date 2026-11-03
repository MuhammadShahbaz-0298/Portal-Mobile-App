// Batch list, create, update, archive, delete, and enrollment calls.
// Admins see all batches; teachers their own; students enrolled ones (enforced by backend).
import { ENDPOINTS } from '../constants/endpoints';
import { buildQuery } from '../utils/query';
import { apiRequest } from './client';

export async function listBatches(params = {}) {
  const { data, meta } = await apiRequest(
    `${ENDPOINTS.batches.list}${buildQuery(params)}`
  );
  return { items: data || [], meta };
}

export async function getBatchStudents(batchId, params = {}) {
  const { data, meta } = await apiRequest(
    `${ENDPOINTS.batches.students(batchId)}${buildQuery(params)}`
  );
  return { items: data || [], meta };
}

export async function createBatch(payload) {
  const { data } = await apiRequest(ENDPOINTS.batches.create, {
    method: 'POST',
    body: payload,
  });
  return data;
}

export async function updateBatch(id, payload) {
  const { data } = await apiRequest(ENDPOINTS.batches.byId(id), {
    method: 'PATCH',
    body: payload,
  });
  return data;
}

export async function archiveBatch(id) {
  const { data } = await apiRequest(ENDPOINTS.batches.archive(id), {
    method: 'PATCH',
  });
  return data;
}

export async function deleteBatch(id) {
  const { data } = await apiRequest(ENDPOINTS.batches.byId(id), {
    method: 'DELETE',
  });
  return data;
}

export async function enrollStudent(batchId, studentId) {
  const { data } = await apiRequest(ENDPOINTS.batches.enroll(batchId), {
    method: 'POST',
    body: { studentId },
  });
  return data;
}
