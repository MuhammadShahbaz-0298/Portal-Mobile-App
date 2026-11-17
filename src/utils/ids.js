// Mongo documents use _id; auth users use id. Always read both safely.
export function getId(item) {
  return item?._id || item?.id || '';
}

export function getDisplayName(person) {
  return person?.name || person?.email || 'Unknown user';
}

export function getBatchName(value) {
  return value?.name || 'Unknown class';
}
