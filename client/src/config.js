/** Base URL of the API (no trailing slash). Needed in production when frontend and API differ. */
export const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || '').replace(/\/$/, '');

export function assetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
}
