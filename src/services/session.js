// Tokens live only in SecureStore. A memory cache avoids a native read per request.
import * as SecureStore from 'expo-secure-store';
import { ERRORS } from '../constants/strings';

const ACCESS_KEY = 'portal_access_token';
const REFRESH_KEY = 'portal_refresh_token';
const cache = { access: null, refresh: null, loaded: false };

async function readKey(key) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeKey(key, value) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    throw new Error(ERRORS.localStorage);
  }
}

export async function loadTokens() {
  if (cache.loaded) return cache;
  const [access, refresh] = await Promise.all([
    readKey(ACCESS_KEY),
    readKey(REFRESH_KEY),
  ]);
  cache.access = access;
  cache.refresh = refresh;
  cache.loaded = true;
  return cache;
}

export async function getAccessToken() {
  await loadTokens();
  return cache.access;
}

export async function getRefreshToken() {
  await loadTokens();
  return cache.refresh;
}

export async function saveTokens(accessToken, refreshToken) {
  cache.access = accessToken || null;
  cache.refresh = refreshToken || null;
  cache.loaded = true;
  if (accessToken) await writeKey(ACCESS_KEY, accessToken);
  if (refreshToken) await writeKey(REFRESH_KEY, refreshToken);
}

export async function clearTokens() {
  cache.access = null;
  cache.refresh = null;
  cache.loaded = true;
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY).catch(() => {}),
    SecureStore.deleteItemAsync(REFRESH_KEY).catch(() => {}),
  ]);
}
