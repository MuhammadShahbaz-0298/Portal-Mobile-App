import { ENDPOINTS } from '../constants/endpoints';
import { buildQuery } from '../utils/query';
import { apiRequest } from './client';

export async function listComments(submissionId, params = {}) {
  const { data, meta } = await apiRequest(
    `${ENDPOINTS.submissions.comments.list(submissionId)}${buildQuery(params)}`
  );
  return { items: data || [], meta };
}

export async function createComment(submissionId, text) {
  const { data } = await apiRequest(ENDPOINTS.submissions.comments.list(submissionId), {
    method: 'POST',
    body: { text },
  });
  return data;
}
