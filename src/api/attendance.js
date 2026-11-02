// Attendance list, mark, edit, and per-student summary calls.
import { ENDPOINTS } from '../constants/endpoints';
import { buildQuery } from '../utils/query';
import { apiRequest } from './client';

export async function listAttendance(params = {}) {
  const { data, meta } = await apiRequest(
    `${ENDPOINTS.attendance.list}${buildQuery(params)}`
  );
  return { items: data || [], meta };
}

export async function addAttendance(payload) {
  const { data } = await apiRequest(ENDPOINTS.attendance.list, {
    method: 'POST',
    body: payload,
  });
  return data;
}

export async function updateAttendance(id, payload) {
  const { data } = await apiRequest(ENDPOINTS.attendance.byId(id), {
    method: 'PATCH',
    body: payload,
  });
  return data;
}

export async function getAttendanceSummary(studentId) {
  const { data } = await apiRequest(ENDPOINTS.attendance.byStudent(studentId));
  return data;
}
