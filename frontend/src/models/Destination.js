/**
 * @typedef {Object} Destination
 * @property {number} id
 * @property {string} name
 * @property {string} location
 * @property {string} startDate
 * @property {string} endDate
 * @property {string | null} description
 * @property {string | null} notes
 * @property {number} sortOrder
 */

export function toDestination(data) {
  return {
    id: Number(data.id),
    name: data.name || '',
    location: data.location || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    description: data.description || null,
    notes: data.notes || null,
    sortOrder: Number(data.sortOrder || 0),
  };
}
