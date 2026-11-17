// Small validators return an error string or an empty string.
import { VALIDATION } from '../constants/strings';
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../constants/options';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rolePattern = /^[a-z0-9_-]+$/;

export function required(value, field) {
  return String(value ?? '').trim() ? '' : VALIDATION.required(field);
}

export function validEmail(value) {
  const text = String(value ?? '').trim();
  if (!text) return VALIDATION.required('Email');
  if (text.length > EMAIL_MAX_LENGTH) {
    return VALIDATION.maxLength('Email', EMAIL_MAX_LENGTH);
  }
  return emailPattern.test(text) ? '' : VALIDATION.email;
}

export function minLength(value, field, length) {
  return String(value ?? '').trim().length >= length
    ? ''
    : VALIDATION.minLength(field, length);
}

export function maxLength(value, field, length) {
  return String(value ?? '').trim().length <= length
    ? ''
    : VALIDATION.maxLength(field, length);
}

export function validPassword(value, field = 'Password') {
  const text = String(value ?? '');
  if (!text) return VALIDATION.required(field);
  return text.length >= PASSWORD_MIN_LENGTH && text.length <= PASSWORD_MAX_LENGTH
    ? ''
    : VALIDATION.passwordLength;
}

export function passwordsMatch(password, confirmation) {
  return password === confirmation ? '' : VALIDATION.passwordMatch;
}

export function validRoleName(value) {
  const text = String(value ?? '').trim();
  if (!text) return VALIDATION.required('Role name');
  if (text.length > 50) return VALIDATION.maxLength('Role name', 50);
  return rolePattern.test(text) ? '' : 'Use lowercase letters, numbers, - or _.';
}

export function firstError(errors) {
  return Object.values(errors).find(Boolean) || '';
}
