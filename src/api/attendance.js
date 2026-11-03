// Attendance: list the register and mark a batch (upsert per student).
import { ENDPOINTS } from '../constants/endpoints';
import { buildQuery } from '../utils/query';
import { apiRequest } from './client';

export async function listAttendance(params = {}) {
  const { data, meta } = await apiRequest(
    `${ENDPOINTS.attendance.list}${buildQuery(params)}`
  );
  return { items: data || [], meta };
}

export async function markAttendance(payload) {
  const { data } = await apiRequest(ENDPOINTS.attendance.list, {
    method: 'POST',
    body: payload,
  });
  return data;
}
