// Generates a strong, one-time password without transmitting it anywhere.
import * as Crypto from 'expo-crypto';

const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const lower = 'abcdefghijkmnopqrstuvwxyz';
const digits = '23456789';
const special = '!@#$%&*?';
const all = upper + lower + digits + special;

function pick(source) {
  const bytes = Crypto.getRandomBytes(1);
  return source[bytes[0] % source.length];
}

export function generatePassword(length = 16) {
  const required = [pick(upper), pick(lower), pick(digits), pick(special)];
  while (required.length < length) required.push(pick(all));
  const bytes = Crypto.getRandomBytes(required.length);
  return required
    .map((character, index) => ({ character, order: bytes[index] }))
    .sort((left, right) => left.order - right.order)
    .map((item) => item.character)
    .join('');
}
