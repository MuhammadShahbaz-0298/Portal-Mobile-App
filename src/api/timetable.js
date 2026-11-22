import { ENDPOINTS } from '../constants/endpoints';
import { buildQuery } from '../utils/query';
import { apiRequest } from './client';

export async function listTimetable(params = {}) {
  const { data, meta } = await apiRequest(
    `${ENDPOINTS.timetable.list}${buildQuery(params)}`
  );
  return { items: data || [], meta };
}

export async function createTimetableEntry(payload) {
  const { data } = await apiRequest(ENDPOINTS.timetable.list, {
    method: 'POST',
    body: payload,
  });
  return data;
}
