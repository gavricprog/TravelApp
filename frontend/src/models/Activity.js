export const ACTIVITY_STATUSES = ['Planned', 'Reserved', 'Done', 'Cancelled'];

export function toActivity(data) {
  return {
    id: Number(data.id),
    dayDate: data.dayDate || '',
    title: data.title || '',
    notes: data.notes || null,
    time: data.time || null,
    location: data.location || null,
    cost: data.cost == null ? null : Number(data.cost),
    status: data.status || 'Planned',
  };
}
