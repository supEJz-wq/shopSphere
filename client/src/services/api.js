import axios from 'axios';
import { toAbsoluteUrl } from '../utils/assetUrl';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

function rewriteAssetUrls(node) {
  if (Array.isArray(node)) {
    for (const item of node) rewriteAssetUrls(item);
    return;
  }
  if (node && typeof node === 'object') {
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (typeof value === 'string') {
        node[key] = toAbsoluteUrl(value);
      } else {
        rewriteAssetUrls(value);
      }
    }
  }
}

api.interceptors.response.use((response) => {
  if (response.data && typeof response.data === 'object') {
    rewriteAssetUrls(response.data);
  }
  return response;
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('shopsphere_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.url !== '/auth/login') {
      sessionStorage.removeItem('shopsphere_token');
      sessionStorage.removeItem('shopsphere_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
