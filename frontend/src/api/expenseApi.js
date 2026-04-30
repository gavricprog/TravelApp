import client from './axiosClient';
import { toExpense } from '../models/index.js';

export async function addExpense(travelPlanId, payload) {
  const { data } = await client.post(`/api/travel-plans/${travelPlanId}/expenses`, payload);
  return toExpense(data);
}

export async function deleteExpense(travelPlanId, expenseId) {
  await client.delete(`/api/travel-plans/${travelPlanId}/expenses/${expenseId}`);
}
