import client from './axiosClient';
import { toActivity, toChecklistItem, toDestination, toExpense, toTravelPlan } from '../models/index.js';

export async function listTravelPlans() {
  const { data } = await client.get('/api/travel-plans');
  return data.map(toTravelPlan);
}

export async function getTravelPlan(id) {
  const { data } = await client.get(`/api/travel-plans/${id}`);
  return toTravelPlan(data);
}

export async function createTravelPlan(payload) {
  const { data } = await client.post('/api/travel-plans', payload);
  return toTravelPlan(data);
}

export async function updateTravelPlan(id, payload) {
  await client.put(`/api/travel-plans/${id}`, payload);
}

export async function deleteTravelPlan(id) {
  await client.delete(`/api/travel-plans/${id}`);
}

export async function regenerateShareToken(id) {
  const { data } = await client.post(`/api/travel-plans/${id}/share`);
  return data;
}

export async function createShare(planId, accessType) {
  const { data } = await client.post('/api/share', { planId, accessType });
  return data;
}

export async function getPlanShare(id) {
  const { data } = await client.get(`/api/plans/${id}/share`);
  return data;
}

export async function addDestination(travelPlanId, payload) {
  const { data } = await client.post(`/api/travel-plans/${travelPlanId}/destinations`, payload);
  return toDestination(data);
}

export async function updateDestination(destinationId, payload) {
  const { data } = await client.put(`/api/travel-plans/destinations/${destinationId}`, payload);
  return toDestination(data);
}

export async function removeDestination(destinationId) {
  await client.delete(`/api/travel-plans/destinations/${destinationId}`);
}

export async function addActivity(travelPlanId, payload) {
  const { data } = await client.post(`/api/travel-plans/${travelPlanId}/activities`, payload);
  return toActivity(data);
}

export async function updateActivity(activityId, payload) {
  const { data } = await client.put(`/api/travel-plans/activities/${activityId}`, payload);
  return toActivity(data);
}

export async function removeActivity(activityId) {
  await client.delete(`/api/travel-plans/activities/${activityId}`);
}

export async function addChecklistItem(travelPlanId, payload) {
  const { data } = await client.post(`/api/travel-plans/${travelPlanId}/checklist`, payload);
  return toChecklistItem(data);
}

export async function updateChecklistItem(itemId, payload) {
  await client.patch(`/api/travel-plans/checklist/${itemId}`, payload);
}

export async function removeChecklistItem(itemId) {
  await client.delete(`/api/travel-plans/checklist/${itemId}`);
}

export async function downloadTravelPlanPdf(id) {
  const { data, headers } = await client.get(`/api/plans/${id}/pdf`, {
    responseType: 'blob',
  });
  return { blob: data, fileName: parseFileName(headers['content-disposition']) };
}

function parseFileName(contentDisposition) {
  if (!contentDisposition) return null;
  const match = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i);
  const rawName = match?.[1] || match?.[2];
  return rawName ? decodeURIComponent(rawName) : null;
}

/** Public read-only view — no Authorization header required on backend. */
export async function getSharedTravel(token) {
  const { data } = await client.get(`/api/share/${encodeURIComponent(token)}`);
  return {
    ...data,
    destinations: (data.destinations || []).map(toDestination),
    activitiesByDay: data.activitiesByDay || [],
    expenses: (data.expenses || []).map(toExpense),
    checklist: (data.checklist || []).map(toChecklistItem),
  };
}

export async function updateSharedTravelPlan(token, payload) {
  await client.put(`/api/share/${encodeURIComponent(token)}/travel-plan`, payload);
}

export async function addSharedDestination(token, payload) {
  const { data } = await client.post(`/api/share/${encodeURIComponent(token)}/destinations`, payload);
  return toDestination(data);
}

export async function updateSharedDestination(token, destinationId, payload) {
  const { data } = await client.put(`/api/share/${encodeURIComponent(token)}/destinations/${destinationId}`, payload);
  return toDestination(data);
}

export async function removeSharedDestination(token, destinationId) {
  await client.delete(`/api/share/${encodeURIComponent(token)}/destinations/${destinationId}`);
}

export async function addSharedActivity(token, payload) {
  const { data } = await client.post(`/api/share/${encodeURIComponent(token)}/activities`, payload);
  return toActivity(data);
}

export async function updateSharedActivity(token, activityId, payload) {
  const { data } = await client.put(`/api/share/${encodeURIComponent(token)}/activities/${activityId}`, payload);
  return toActivity(data);
}

export async function removeSharedActivity(token, activityId) {
  await client.delete(`/api/share/${encodeURIComponent(token)}/activities/${activityId}`);
}

export async function addSharedExpense(token, payload) {
  const { data } = await client.post(`/api/share/${encodeURIComponent(token)}/expenses`, payload);
  return toExpense(data);
}

export async function removeSharedExpense(token, expenseId) {
  await client.delete(`/api/share/${encodeURIComponent(token)}/expenses/${expenseId}`);
}

export async function addSharedChecklistItem(token, payload) {
  const { data } = await client.post(`/api/share/${encodeURIComponent(token)}/checklist`, payload);
  return toChecklistItem(data);
}

export async function updateSharedChecklistItem(token, itemId, payload) {
  await client.patch(`/api/share/${encodeURIComponent(token)}/checklist/${itemId}`, payload);
}

export async function removeSharedChecklistItem(token, itemId) {
  await client.delete(`/api/share/${encodeURIComponent(token)}/checklist/${itemId}`);
}
