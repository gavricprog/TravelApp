/**
 * @typedef {Object} TravelPlan
 * @property {number} id
 * @property {string} title
 * @property {string} startDate
 * @property {string} endDate
 * @property {number} budget
 * @property {number} totalExpenses
 * @property {string | null} shareToken
 * @property {import('./Destination.js').Destination[]} destinations
 * @property {import('./Activity.js').Activity[]} activities
 * @property {import('./Expense.js').Expense[]} expenses
 * @property {import('./ChecklistItem.js').ChecklistItem[]} checklist
 */

export function toTravelPlan(data) {
  return {
    id: Number(data.id),
    title: data.title || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    budget: Number(data.budget || 0),
    totalExpenses: Number(data.totalExpenses || 0),
    shareToken: data.shareToken || null,
    destinations: data.destinations || [],
    activities: data.activities || [],
    expenses: data.expenses || [],
    checklist: data.checklist || [],
  };
}
