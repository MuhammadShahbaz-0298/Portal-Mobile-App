// Converts every API failure into short, safe user-facing text.
// Rules: classify by error.code first (offline/timeout), then by status.
// The server's own message is shown ONLY for 400/409/422, a wrong-password
// login (401 on an auth=false request) and a 429 lockout. Everything else
// falls back to constants from strings/validation.js.
// Never leaks URLs, endpoint paths, status codes, or raw backend text.
import { ApiError } from '../api/errors';
import { ERRORS } from '../constants/strings';

export function isOfflineError(error) {
  return error?.code === 'network' || error?.code === 'timeout';
}

function serverMessage(error) {
  const details = error.details?.filter(Boolean).join(' ').trim();
  if (error.message && details) return `${error.message} ${details}`;
  return error.message || details || ERRORS.validation;
}

export function getErrorMessage(error, fallback = ERRORS.generic) {
  if (!error) return fallback;
  // Download failures already carry a short, safe message.
  if (error.code === 'download') return error.message || ERRORS.download;
  if (error.code === 'network') return ERRORS.network;
  if (error.code === 'timeout') return ERRORS.timeout;
  if (error instanceof ApiError) {
    const { status } = error;
    if (status === 400 || status === 409 || status === 422) {
      return serverMessage(error);
    }
    if (status === 429) return serverMessage(error);
    if (status === 401) {
      return error.code === 'auth'
        ? serverMessage(error)
        : ERRORS.unauthorized;
    }
    if (status === 403) return ERRORS.forbidden;
    if (status === 404) return ERRORS.notFound;
    return ERRORS.serverError;
  }
  // Unknown error type: never print its message.
  return fallback;
}