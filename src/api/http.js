// Shared fetch helpers for the API client: timeouts, headers, parsing.
// Only modules in src/api import this file; screens never see it.
import {
  CLIENT_HEADER,
  CLIENT_VALUE,
  CSRF_HEADER,
  CSRF_VALUE,
} from '../config/env';
import { ERRORS } from '../constants/strings';
import { ApiError } from './errors';

const handlers = {
  onForcedPassword: () => {},
  onSessionExpired: () => {},
};

export function getHandlers() {
  return handlers;
}

export function setAuthHandlers(next) {
  Object.assign(handlers, next);
}

export function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

export function isUnsafe(method) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(String(method).toUpperCase());
}

export function buildHeaders(method, token, extra = {}) {
  const headers = {
    Accept: 'application/json',
    [CLIENT_HEADER]: CLIENT_VALUE,
    ...extra,
  };
  if (isUnsafe(method)) headers[CSRF_HEADER] = CSRF_VALUE;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function parseMeta(response) {
  return {
    page: Number(response.headers.get('x-page')) || 1,
    limit: Number(response.headers.get('x-page-limit')) || 0,
    total: Number(response.headers.get('x-total-count')) || 0,
  };
}

export async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function toApiError(error) {
  if (error instanceof ApiError) return error;
  if (error?.name === 'AbortError') {
    return new ApiError(ERRORS.timeout, { code: 'timeout' });
  }
  return new ApiError(ERRORS.network, { code: 'network' });
}