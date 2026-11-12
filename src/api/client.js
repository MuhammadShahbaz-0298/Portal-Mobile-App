// Authorized fetch wrapper: base URL, headers, CSRF, bearer, refresh-once retry-once.
// Tokens live in SecureStore (see services/session) and are never logged.
// Network and timeout failures carry code 'network' / 'timeout' so callers
// can tell them apart from server rejections. 401 redirects through the
// refresh flow; only a refresh that got a 401/403 signs the user out.
import {
  API_URL,
  REQUEST_TIMEOUT_MS,
} from '../config/env';
import { Platform } from 'react-native';
import { ERRORS } from '../constants/strings';
import {
  clearTokens,
  getAccessToken,
} from '../services/session';
import {
  buildHeaders,
  getHandlers,
  parseMeta,
  parseBody,
  sendFormDataRequest,
  setAuthHandlers,
  timeoutSignal,
  toApiError,
} from './http';
import { refreshAccessToken } from './refresh';
import { ApiError, isForcedPasswordError } from './errors';

export { setAuthHandlers };

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

  try {
    const url = `${API_URL}${path}`;
    const response =
      isForm && Platform.OS !== 'web'
        ? await sendFormDataRequest(
            url,
            method,
            finalHeaders,
            body,
            request.signal
          )
        : await fetch(url, {
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
      // auth=false calls (login, logout) get code 'auth' so callers may show
      // the server's own credential/lockout message; other failures stay generic.
      const error = new ApiError(data?.error || ERRORS.generic, {
        status: response.status,
        details: data?.details || [],
        code: auth ? undefined : 'auth',
      });
      if (isForcedPasswordError(error) && !skipForcedHandler) {
        getHandlers().onForcedPassword();
      }
      if (response.status === 401 && auth) {
        await clearTokens();
        getHandlers().onSessionExpired();
        error.code = 'session-expired';
      }
      throw error;
    }

    return { data, meta: parseMeta(response) };
  } catch (error) {
    throw toApiError(error);
  } finally {
    request.clear();
  }
}