import client from './axiosClient';

/** All auth HTTP calls live here — not inside React components. */
export async function register(payload) {
  const { data } = await client.post('/api/auth/register', payload);
  return data;
}

export async function login(payload) {
  const { data } = await client.post('/api/auth/login', payload);
  return data;
}
