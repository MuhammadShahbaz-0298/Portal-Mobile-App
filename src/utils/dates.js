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

const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

// Date-only strings must be parsed as local dates, not UTC midnight.
function toLocalDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  }
  return new Date(value);
}

export function formatLongDate(value) {
  const date = value ? toLocalDate(value) : new Date();
  return longDateFormatter.format(date);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = toLocalDate(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date);
}

export function formatTimeInput(value) {
  if (!/^\d{2}:\d{2}$/.test(value || '')) return '';
  const [hour, minute] = value.split(':').map(Number);
  const date = new Date(2024, 0, 1, hour, minute);
  return Number.isNaN(date.getTime()) ? '' : timeFormatter.format(date);
}

export function toDateInput(value) {
  if (!value) return '';
  const date = toLocalDate(value);
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

export function fromDateInput(value) {
  if (!value) return null;
  const date = toLocalDate(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addMonths(value, amount) {
  return new Date(value.getFullYear(), value.getMonth() + amount, 1);
}

export function monthLabel(value) {
  return monthFormatter.format(value);
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
