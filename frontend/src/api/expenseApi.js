import client from './axiosClient';

export async function addExpense(travelPlanId, payload) {
  const { data } = await client.post(`/api/travel-plans/${travelPlanId}/expenses`, payload);
  return data;
}

export async function deleteExpense(travelPlanId, expenseId) {
  await client.delete(`/api/travel-plans/${travelPlanId}/expenses/${expenseId}`);
}
