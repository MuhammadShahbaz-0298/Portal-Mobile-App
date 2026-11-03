// Authorized fetch wrapper: base URL, headers, CSRF, bearer, refresh-once retry-once.
// Tokens live in SecureStore (see services/session.js) and are never logged.
import {
  API_URL,
  CLIENT_HEADER,
  CLIENT_VALUE,
  CSRF_HEADER,
  CSRF_VALUE,
  REQUEST_TIMEOUT_MS,
  WAKE_UP_NOTICE_MS,
} from '../config/env';
import { ENDPOINTS } from '../constants/endpoints';
import { ERRORS } from '../constants/strings';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '../services/session';
import { ApiError, isForcedPasswordError } from './errors';

const handlers = {
  onForcedPassword: () => {},
  onSessionExpired: () => {},
  onWakeUp: () => {},
  onIdle: () => {},
};
let refreshPromise = null;
let pendingRequests = 0;
let wakeTimer = null;

// Why: the Render free tier sleeps; warn once while any request is in flight.
function noteRequestBegin() {
  pendingRequests += 1;
  if (pendingRequests === 1 && !wakeTimer) {
    wakeTimer = setTimeout(() => handlers.onWakeUp(), WAKE_UP_NOTICE_MS);
  }
}

function noteRequestEnd() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  if (pendingRequests === 0) {
    if (wakeTimer) clearTimeout(wakeTimer);
    wakeTimer = null;
    handlers.onIdle();
  }
}

export function setAuthHandlers(next) {
  Object.assign(handlers, next);
}

function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

function isUnsafe(method) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(String(method).toUpperCase());
}

function buildHeaders(method, token, extra = {}) {
  const headers = {
    Accept: 'application/json',
    [CLIENT_HEADER]: CLIENT_VALUE,
    ...extra,
  };
  if (isUnsafe(method)) headers[CSRF_HEADER] = CSRF_VALUE;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function parseMeta(response) {
  return {
    page: Number(response.headers.get('x-page')) || 1,
    limit: Number(response.headers.get('x-page-limit')) || 0,
    total: Number(response.headers.get('x-total-count')) || 0,
  };
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toApiError(error) {
  if (error instanceof ApiError) return error;
  if (error?.name === 'AbortError') {
    return new ApiError(ERRORS.timeout, { code: 'timeout' });
  }
  return new ApiError(ERRORS.network, { code: 'network' });
}

export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) throw new ApiError(ERRORS.unauthorized, { status: 401 });

    const request = timeoutSignal(REQUEST_TIMEOUT_MS);
    noteRequestBegin();
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.auth.refresh}`, {
        method: 'POST',
        signal: request.signal,
        headers: buildHeaders('POST', null, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ refreshToken }),
      });
      const data = await parseBody(response);
      if (!response.ok || !data?.accessToken || !data?.refreshToken) {
        throw new ApiError(ERRORS.unauthorized, { status: 401 });
      }
      await saveTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } finally {
      request.clear();
      noteRequestEnd();
    }
  })()
    .catch(async (error) => {
      await clearTokens();
      handlers.onSessionExpired();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = true,
    retry = true,
    timeout = REQUEST_TIMEOUT_MS,
    skipForcedHandler = false,
  } = options;

  let token = auth ? await getAccessToken() : null;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const finalHeaders = buildHeaders(method, token, headers);
  if (body !== undefined && !isForm) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const request = timeoutSignal(timeout);
  noteRequestBegin();

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      signal: request.signal,
      headers: finalHeaders,
      body:
        body === undefined || isForm
          ? body
          : typeof body === 'string'
            ? body
            : JSON.stringify(body),
    });

    if (response.status === 401 && auth && retry) {
      token = await refreshAccessToken();
      return apiRequest(path, {
        ...options,
        auth: true,
        retry: false,
        headers: { ...headers, Authorization: `Bearer ${token}` },
      });
    }

    const data = await parseBody(response);
    if (!response.ok) {
      const error = new ApiError(data?.error || ERRORS.generic, {
        status: response.status,
        details: data?.details || [],
      });
      if (isForcedPasswordError(error) && !skipForcedHandler) {
        handlers.onForcedPassword();
      }
      if (response.status === 401 && auth) {
        await clearTokens();
        handlers.onSessionExpired();
        error.code = 'session-expired';
      }
      throw error;
    }

    return { data, meta: parseMeta(response) };
  } catch (error) {
    throw toApiError(error);
  } finally {
    request.clear();
    noteRequestEnd();
  }
}
