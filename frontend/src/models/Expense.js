export const EXPENSE_CATEGORIES = ['General', 'Food', 'Transport', 'Lodging', 'Activities', 'Other'];

export function toExpense(data) {
  return {
    id: Number(data.id),
    amount: Number(data.amount || 0),
    description: data.description || '',
    category: data.category || 'General',
    spentOn: data.spentOn || null,
  };
}
