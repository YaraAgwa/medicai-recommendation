// On your own computer this stays '/api' (the dev server forwards it to the
// backend). When deployed, set VITE_API_URL to the backend's address so the
// website knows where to find the brain.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getLang() {
  return localStorage.getItem('language') || 'en';
}

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const [path, queryString] = endpoint.split('?');
  const params = new URLSearchParams(queryString || '');
  params.set('lang', getLang());
  const url = `${API_BASE}${path}?${params}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}
