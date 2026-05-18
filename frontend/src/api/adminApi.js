import client from './axiosClient';

export async function getAdminStats() {
  const { data } = await client.get('/api/admin/stats');
  return data;
}
