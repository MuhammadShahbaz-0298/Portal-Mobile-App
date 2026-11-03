// Runtime configuration. Only EXPO_PUBLIC_ values are safe to expose in a bundle.
// Missing or invalid configuration shows a full-screen error instead of broken requests.
import { ERRORS } from '../constants/strings';

function validateApiUrl() {
  const raw = process.env.EXPO_PUBLIC_API_URL;
  if (!raw) return { url: null, error: ERRORS.configMissing };
  if (!/^https?:\/\//.test(raw)) return { url: null, error: ERRORS.configInvalid };
  const trimmed = raw.replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) return { url: null, error: ERRORS.configApiSuffix };
  return { url: trimmed, error: null };
}

const { url, error } = validateApiUrl();

export const API_URL = url;
export const CONFIG_ERROR = error;
// Long enough for a Render free-tier cold start (~1 minute).
export const REQUEST_TIMEOUT_MS = 90000;
export const UPLOAD_TIMEOUT_MS = 120000;
export const CSRF_HEADER = 'x-csrf-protection';
export const CSRF_VALUE = '1';
export const CLIENT_HEADER = 'x-client';
export const CLIENT_VALUE = 'mobile';
