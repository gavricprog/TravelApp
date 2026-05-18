export function toTravelPlan(data) {
  return {
    id: Number(data.id),
    title: data.title || '',
    description: data.description || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    budget: Number(data.budget || 0),
    notes: data.notes || '',
    totalExpenses: Number(data.totalExpenses || 0),
    shareToken: data.shareToken || null,
    destinations: data.destinations || [],
    activities: data.activities || [],
    expenses: data.expenses || [],
    checklist: data.checklist || [],
  };
}
