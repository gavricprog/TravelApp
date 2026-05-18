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
