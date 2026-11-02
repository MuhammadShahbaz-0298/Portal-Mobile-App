// Small validators return an error string or an empty string.
import { VALIDATION } from '../constants/strings';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rolePattern = /^[a-z0-9_-]+$/;

export function required(value, field) {
  return String(value ?? '').trim() ? '' : VALIDATION.required(field);
}

export function validEmail(value) {
  if (!String(value ?? '').trim()) return VALIDATION.required('Email');
  return emailPattern.test(String(value).trim()) ? '' : VALIDATION.email;
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
  return text.length >= 8 && text.length <= 128
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

export function validNumber(value, field, { min = 0, max = Infinity } = {}) {
  const number = Number(value);
  if (String(value ?? '').trim() === '' || Number.isNaN(number)) {
    return VALIDATION.number(field);
  }
  if (number < min || number > max) return VALIDATION.positive(field);
  return '';
}

export function firstError(errors) {
  return Object.values(errors).find(Boolean) || '';
}
