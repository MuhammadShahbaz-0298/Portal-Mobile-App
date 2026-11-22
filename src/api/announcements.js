import { ENDPOINTS } from '../constants/endpoints';
import { buildQuery } from '../utils/query';
import { apiRequest } from './client';

export async function listAnnouncements(params = {}) {
  const { data, meta } = await apiRequest(
    `${ENDPOINTS.announcements.list}${buildQuery(params)}`
  );
  return { items: data || [], meta };
}

export async function createAnnouncement(payload) {
  const { data } = await apiRequest(ENDPOINTS.announcements.list, {
    method: 'POST',
    body: payload,
  });
  return data;
}

export async function archiveAnnouncement(id) {
  const { data } = await apiRequest(ENDPOINTS.announcements.archive(id), {
    method: 'PATCH',
  });
  return data;
}
