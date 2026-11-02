// Runtime configuration. Only EXPO_PUBLIC_ values are safe to expose in a bundle.
const fallbackUrl = 'http://localhost:5000';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || fallbackUrl).replace(
  /\/+$/,
  ''
);

export const IS_DEFAULT_API_URL = !process.env.EXPO_PUBLIC_API_URL;
export const REQUEST_TIMEOUT_MS = 20000;
export const UPLOAD_TIMEOUT_MS = 120000;
export const CSRF_HEADER = 'x-csrf-protection';
export const CSRF_VALUE = '1';
export const CLIENT_HEADER = 'x-client';
export const CLIENT_VALUE = 'mobile';
