// Submission list, upload, replace, and grade calls.
// ZIP-only multipart; the backend enforces size, type, and ownership.
import { ENDPOINTS } from '../constants/endpoints';
import { UPLOAD_TIMEOUT_MS } from '../config/env';
import { buildQuery } from '../utils/query';
import { apiRequest } from './client';

export async function listSubmissions(params = {}) {
  const { data, meta } = await apiRequest(
    `${ENDPOINTS.submissions.list}${buildQuery(params)}`
  );
  return { items: data || [], meta };
}

function zipForm(file) {
  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type || 'application/zip',
  });
  return form;
}

export async function createSubmission(assignmentId, file) {
  const form = zipForm(file);
  form.append('assignmentId', assignmentId);
  const { data } = await apiRequest(ENDPOINTS.submissions.create, {
    method: 'POST',
    body: form,
    timeout: UPLOAD_TIMEOUT_MS,
  });
  return data;
}

export async function replaceSubmission(id, file) {
  const { data } = await apiRequest(ENDPOINTS.submissions.file(id), {
    method: 'PATCH',
    body: zipForm(file),
    timeout: UPLOAD_TIMEOUT_MS,
  });
  return data;
}

export async function gradeSubmission(id, payload) {
  const { data } = await apiRequest(ENDPOINTS.submissions.grade(id), {
    method: 'PATCH',
    body: payload,
  });
  return data;
}

// Ask the server to build a new AI draft. It returns the submission with
// aiDraft.status set to "pending" and finishes the work in the background.
export async function regenerateAiDraft(id) {
  const { data } = await apiRequest(ENDPOINTS.submissions.aiDraft(id), {
    method: 'POST',
  });
  return data;
}

// Mark the current AI draft as discarded. Returns the updated submission.
export async function discardAiDraft(id) {
  const { data } = await apiRequest(ENDPOINTS.submissions.aiDraftDiscard(id), {
    method: 'PATCH',
  });
  return data;
}
