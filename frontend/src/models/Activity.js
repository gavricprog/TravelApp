export const ACTIVITY_STATUSES = ['Planned', 'Done', 'Cancelled'];

/**
 * @typedef {Object} Activity
 * @property {number} id
 * @property {string} dayDate
 * @property {string} title
 * @property {string | null} notes
 * @property {string | null} time
 * @property {string | null} location
 * @property {number | null} cost
 * @property {'Planned' | 'Done' | 'Cancelled'} status
 */

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
