// Quiz list, student quiz, and the full backend-controlled attempt lifecycle.
import { ENDPOINTS } from '../constants/endpoints';
import { buildQuery } from '../utils/query';
import { apiRequest } from './client';

export async function listQuizzes(params = {}) {
  const { data, meta } = await apiRequest(
    `${ENDPOINTS.quizzes.list}${buildQuery(params)}`
  );
  return { items: data || [], meta };
}

export async function getQuiz(id) {
  const { data } = await apiRequest(ENDPOINTS.quizzes.byId(id));
  return data;
}

export async function createQuiz(payload) {
  const { data } = await apiRequest(ENDPOINTS.quizzes.create, {
    method: 'POST',
    body: payload,
  });
  return data;
}

export async function updateQuiz(id, payload) {
  const { data } = await apiRequest(ENDPOINTS.quizzes.byId(id), {
    method: 'PATCH',
    body: payload,
  });
  return data;
}

// The server decides what answers look like for an in-progress attempt.
function attemptPayload(payload) {
  if (Array.isArray(payload)) return { answers: payload };
  return payload || { answers: [] };
}

export async function startAttempt(id) {
  const { data } = await apiRequest(ENDPOINTS.quizzes.attemptStart(id), {
    method: 'POST',
  });
  return data;
}

export async function saveAttemptAnswers(id, payload) {
  const { data } = await apiRequest(ENDPOINTS.quizzes.attemptAnswers(id), {
    method: 'PATCH',
    body: attemptPayload(payload),
  });
  return data;
}

export async function submitAttempt(id, payload) {
  const { data } = await apiRequest(ENDPOINTS.quizzes.attempt(id), {
    method: 'POST',
    body: attemptPayload(payload),
  });
  return data;
}

export async function recordFocusViolation(id) {
  const { data } = await apiRequest(ENDPOINTS.quizzes.attemptViolation(id), {
    method: 'POST',
  });
  return data;
}

export async function listAttempts(id, params = {}) {
  const { data, meta } = await apiRequest(
    `${ENDPOINTS.quizzes.attempts(id)}${buildQuery(params)}`
  );
  return { items: data || [], meta };
}
