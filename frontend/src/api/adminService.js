import client from './axiosClient';

export async function getUsers() {
  const { data } = await client.get('/api/admin/users');
  return data;
}

export async function deleteUser(id) {
  await client.delete(`/api/admin/users/${id}`);
}

export async function updateUserRole(id, role) {
  await client.put(`/api/admin/users/${id}/role`, { role });
}

export async function getAllPlans() {
  const { data } = await client.get('/api/admin/travel-plans');
  return data;
}

export async function deletePlan(id) {
  await client.delete(`/api/admin/travel-plans/${id}`);
}
