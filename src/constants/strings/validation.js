// Validation messages, API errors, and file messages.
// Split from strings.js so every constant file stays small.

export const VALIDATION = Object.freeze({
  required: (field) => `${field} is required.`,
  email: 'Enter a valid email address.',
    minLength: (field, length) =>
      `${field} must be at least ${length} characters.`,
    maxLength: (field, length) =>
      `${field} must be ${length} characters or fewer.`,
  passwordLength: 'Password must be at least 8 characters.',
  passwordMatch: 'Passwords do not match.',
  passwordDifferent: 'Choose a different password from your current one.',
  number: (field) => `${field} must be a number.`,
  positive: (field) => `${field} must be greater than zero.`,
  maxScore: 'Maximum score must be greater than zero.',
  dateFormat: 'Use the format YYYY-MM-DD.',
  dateOrder: 'End date must be after the start date.',
  attempts: 'Attempts must be between 1 and 10.',
  permission: 'Select at least one permission.',
  file: 'Choose a file to upload.',
  fileSize: (max) => `The file must be ${max} MB or smaller.`,
});

export const ERRORS = Object.freeze({
  generic: 'Something went wrong. Please try again.',
  network:
    'Could not reach the server. Check your connection and the API URL, then try again.',
  timeout: 'The request took too long. Please try again.',
  configMissing:
    'EXPO_PUBLIC_API_URL is not set. Create a .env file from .env.example with EXPO_PUBLIC_API_URL=https://backend-58gd.onrender.com, then restart the app.',
  configInvalid:
    'EXPO_PUBLIC_API_URL is invalid. It must start with http:// or https://, for example https://backend-58gd.onrender.com.',
  configApiSuffix:
    'EXPO_PUBLIC_API_URL must NOT end with /api. The app adds /api itself. Use https://backend-58gd.onrender.com instead.',
  serverWaking:
    'The server is waking up. This can take up to a minute.',
  unauthorized: 'Please sign in to continue.',
  forbidden: 'You do not have permission to do that.',
  notFound: 'The requested item could not be found.',
  validation: 'Check the highlighted fields and try again.',
  conflict: 'That change conflicts with existing data.',
  localStorage: 'Secure storage is unavailable on this device.',
  download: 'The file could not be downloaded.',
  upload: 'The file could not be uploaded.',
  copy: 'Could not copy to clipboard.',
  unsupportedShare: 'Sharing is not available on this device.',
});

export const FILES = Object.freeze({
  pick: 'Choose a file',
  replace: 'Replace file',
  picking: 'Opening file picker...',
  cancel: 'File selection cancelled.',
  tooLarge: 'The selected file is too large.',
  zipOnly: 'Only ZIP files are accepted.',
  attachment: 'Attachment',
  downloads: 'Downloads',
  downloadComplete: 'Download ready.',
  shareTitle: 'Share submission',
});
