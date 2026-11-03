// Authentication calls. Token persistence belongs to AuthContext.
import { ENDPOINTS } from '../constants/endpoints';
import { apiRequest } from './client';

export async function login(email, password) {
  const { data } = await apiRequest(ENDPOINTS.auth.login, {
    method: 'POST',
    auth: false,
    retry: false,
    body: { email, password },
  });
  return data;
}

export async function fetchMe({ skipForcedHandler = false } = {}) {
  const { data } = await apiRequest(ENDPOINTS.auth.me, { skipForcedHandler });
  return data;
}

export async function changePassword(currentPassword, newPassword) {
  const { data } = await apiRequest(ENDPOINTS.auth.changePassword, {
    method: 'POST',
    body: { currentPassword, newPassword },
  });
  return data;
}

export async function logoutRequest(refreshToken) {
  const { data } = await apiRequest(ENDPOINTS.auth.logout, {
    method: 'POST',
    auth: false,
    retry: false,
    body: { refreshToken },
  });
  return data;
}

export async function registerUser(payload) {
  const { data } = await apiRequest(ENDPOINTS.auth.register, {
    method: 'POST',
    body: payload,
  });
  return data.user;
}
