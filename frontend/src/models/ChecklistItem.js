export function toChecklistItem(data) {
  return {
    id: Number(data.id),
    text: data.text || '',
    reminderDate: data.reminderDate || null,
    notes: data.notes || '',
    isDone: Boolean(data.isDone),
  };
}
