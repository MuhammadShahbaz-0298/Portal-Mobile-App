import { ENDPOINTS } from '../constants/endpoints';
import { buildQuery } from '../utils/query';
import { apiRequest } from './client';

export async function listEvents(params = {}) {
  const { data, meta } = await apiRequest(
    `${ENDPOINTS.events.list}${buildQuery(params)}`
  );
  return { items: data || [], meta };
}

export async function createEvent(payload) {
  const { data } = await apiRequest(ENDPOINTS.events.list, {
    method: 'POST',
    body: payload,
  });
  return data;
}
