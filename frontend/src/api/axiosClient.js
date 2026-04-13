import axios from 'axios';

// Requests go to same origin; Vite proxies /api → ASP.NET (see vite.config.js).
const client = axios.create({
  baseURL: '/',
});

// Attach JWT from localStorage for every call (except login/register which clear it).
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
