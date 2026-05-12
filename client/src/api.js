import axios from 'axios';

const origin = (import.meta.env.VITE_API_ORIGIN || '').replace(/\/$/, '');
const baseURL = origin ? `${origin}/api` : '/api';

const api = axios.create({ baseURL });

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export default api;
