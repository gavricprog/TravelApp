import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('Missing VITE_API_BASE_URL. Add it to frontend/.env before starting the app.');
}

const client = axios.create({
  baseURL: apiBaseUrl,
});

function dispatchApiEvent(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Request failed.';

    if (status === 401) {
      dispatchApiEvent('auth:unauthorized', { message: 'Your session expired. Please log in again.' });
    }

    dispatchApiEvent('api:error', { message, status });
    return Promise.reject(error);
  }
);

export default client;
