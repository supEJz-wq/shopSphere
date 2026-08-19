const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export function toAbsoluteUrl(value) {
  if (typeof value !== 'string') return value;
  if (value.startsWith('/uploads/')) return `${API_ORIGIN}${value}`;
  return value;
}
