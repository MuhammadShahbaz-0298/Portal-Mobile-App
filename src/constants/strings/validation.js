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
  dateFormat: 'Use the format YYYY-MM-DD.',
  fileSize: (max) => `The file must be ${max} MB or smaller.`,
  gradeRange: 'Marks must be between 0 and 100.',
});

export const ERRORS = Object.freeze({
  generic: 'Something went wrong. Please try again.',
  network: 'Could not reach the server. Check your connection and try again.',
  timeout: 'The request took too long. Please try again.',
  unauthorized: 'Please sign in to continue.',
  forbidden: 'You do not have permission to do that.',
  notFound: 'The requested item could not be found.',
  validation: 'Check the highlighted fields and try again.',
  conflict: 'That change conflicts with existing data.',
  serverError: 'Server error. Please try again later.',
  configMissing:
    'The app is not set up yet. Please contact your administrator.',
  configInvalid:
    'The app could not start because its settings are invalid. Please contact your administrator.',
  configApiSuffix:
    'The app could not start because its settings are invalid. Please contact your administrator.',
  download: 'The file could not be downloaded.',
  upload: 'The file could not be uploaded.',
});

export const FILES = Object.freeze({
  pick: 'Choose a file',
  replace: 'Replace file',
  zipOnly: 'Only ZIP files are accepted.',
  tooLarge: 'The selected file is too large.',
  shareTitle: 'Share submission',
  downloadComplete: 'Download ready.',
});

export const OFFLINE = Object.freeze({
  banner: 'You are offline',
  title: 'You are offline',
  body: 'Check your connection and try again.',
  serverWait: 'Waking up the server, please wait',
});
