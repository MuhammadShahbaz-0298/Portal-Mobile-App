// One API error type keeps status, server message, and field details together.
export class ApiError extends Error {
  constructor(message, { status = 0, details = [], code = 'api' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = Array.isArray(details) ? details : [];
    this.code = code;
  }
}

export function isForcedPasswordError(error) {
  return (
    error?.status === 403 &&
    typeof error.message === 'string' &&
    error.message.toLowerCase().includes('change your password')
  );
}

export function isSessionExpiredError(error) {
  return error?.status === 401 && error?.code === 'session-expired';
}
