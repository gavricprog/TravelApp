import client from './axiosClient';

/** Admin JWT only — GET /api/admin/stats */
export async function getAdminStats() {
  const { data } = await client.get('/api/admin/stats');
  return data;
}
