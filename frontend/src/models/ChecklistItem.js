/**
 * @typedef {Object} ChecklistItem
 * @property {number} id
 * @property {string} text
 * @property {boolean} isDone
 */

export function toChecklistItem(data) {
  return {
    id: Number(data.id),
    text: data.text || '',
    isDone: Boolean(data.isDone),
  };
}
