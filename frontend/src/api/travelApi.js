import client from './axiosClient';

export async function listTravelPlans() {
  const { data } = await client.get('/api/travel-plans');
  return data;
}

export async function getTravelPlan(id) {
  const { data } = await client.get(`/api/travel-plans/${id}`);
  return data;
}

export async function createTravelPlan(payload) {
  const { data } = await client.post('/api/travel-plans', payload);
  return data;
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

export async function getPlanShare(id) {
  const { data } = await client.get(`/api/plans/${id}/share`);
  return data;
}

export async function addDestination(travelPlanId, payload) {
  const { data } = await client.post(`/api/travel-plans/${travelPlanId}/destinations`, payload);
  return data;
}

export async function updateDestination(destinationId, payload) {
  const { data } = await client.put(`/api/travel-plans/destinations/${destinationId}`, payload);
  return data;
}

export async function removeDestination(destinationId) {
  await client.delete(`/api/travel-plans/destinations/${destinationId}`);
}

export async function addActivity(travelPlanId, payload) {
  const { data } = await client.post(`/api/travel-plans/${travelPlanId}/activities`, payload);
  return data;
}

export async function updateActivity(activityId, payload) {
  const { data } = await client.put(`/api/travel-plans/activities/${activityId}`, payload);
  return data;
}

export async function removeActivity(activityId) {
  await client.delete(`/api/travel-plans/activities/${activityId}`);
}

export async function addChecklistItem(travelPlanId, payload) {
  const { data } = await client.post(`/api/travel-plans/${travelPlanId}/checklist`, payload);
  return data;
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
  return data;
}
