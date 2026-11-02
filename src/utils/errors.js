// Converts network, API, and validation failures into short user-facing text.
import { ApiError } from '../api/errors';
import { ERRORS } from '../constants/strings';

export function getErrorMessage(error, fallback = ERRORS.generic) {
  if (!error) return fallback;
  if (error.name === 'AbortError') return ERRORS.timeout;
  if (error instanceof ApiError) {
    const details = error.details?.filter(Boolean).join(' ');
    return details ? `${error.message} ${details}` : error.message;
  }
  if (error instanceof TypeError) return ERRORS.network;
  return error.message || fallback;
}

export function statusMessage(status) {
  if (status === 401) return ERRORS.unauthorized;
  if (status === 403) return ERRORS.forbidden;
  if (status === 404) return ERRORS.notFound;
  if (status === 409) return ERRORS.conflict;
  if (status === 400 || status === 422) return ERRORS.validation;
  return ERRORS.generic;
}
