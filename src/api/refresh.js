// Refresh-token flow, isolated so the client stays small.
// Tokens live in SecureStore (see services/session) and are never logged.
// A 401/403 from the server means the session is dead: clear it and refresh
// through the handlers. A cold start (5xx), an offline device, or a timeout
// keeps the session so the user is not signed out by losing coverage.
import { API_URL, REQUEST_TIMEOUT_MS } from '../config/env';
import { ENDPOINTS } from '../constants/endpoints';
import { ERRORS } from '../constants/strings';
import { clearTokens, getRefreshToken, saveTokens } from '../services/session';
import { buildHeaders, getHandlers, parseBody, timeoutSignal } from './http';
import { ApiError } from './errors';

let refreshPromise = null;

export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) throw new ApiError(ERRORS.unauthorized, { status: 401 });

    const request = timeoutSignal(REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.auth.refresh}`, {
        method: 'POST',
        signal: request.signal,
        headers: buildHeaders('POST', null, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ refreshToken }),
      });
      const responseBody = await parseBody(response);
      if (!response.ok || !responseBody?.accessToken || !responseBody?.refreshToken) {
        throw new ApiError(responseBody?.error || ERRORS.unauthorized, {
          status: response.status,
          details: responseBody?.details || [],
        });
      }
      await saveTokens(responseBody.accessToken, responseBody.refreshToken);
      return responseBody.accessToken;
    } finally {
      request.clear();
    }
  })()
    .catch(async (error) => {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        await clearTokens();
        getHandlers().onSessionExpired();
      }
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}