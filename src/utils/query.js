// Builds a query string while skipping empty filters.
export function buildQuery(params = {}) {
  const parts = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    );
  return parts.length ? `?${parts.join('&')}` : '';
}
