// Locale-aware date helpers. API writes use ISO strings; date-only input stays local.
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const longDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export function formatLongDate(value) {
  const date = value ? new Date(value) : new Date();
  return longDateFormatter.format(date);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date);
}

export function toDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toTimeInput(value) {
  if (!value) return '23:59';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '23:59';
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

export function todayInput() {
  return toDateInput(new Date());
}

export function isPast(value) {
  return Boolean(value) && new Date(value).getTime() <= Date.now();
}

export function dateTimeToIso(dateValue, timeValue) {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T${timeValue || '23:59'}:00`);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}
