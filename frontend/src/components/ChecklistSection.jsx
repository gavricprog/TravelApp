import { useState } from 'react';

export default function ChecklistSection({ items = [], onAdd, onToggle, onRemove }) {
  const [text, setText] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [notes, setNotes] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    await onAdd({
      text,
      reminderDate: reminderDate || null,
      notes: notes.trim() || null,
    });
    setText('');
    setReminderDate('');
    setNotes('');
  };

  return (
    <div className="surface">
      <h2 className="section-title">
        <span aria-hidden>✅</span> Checklist & reminders
      </h2>
      <form className="mb-4 grid gap-3 sm:grid-cols-3" onSubmit={submit}>
        <input className="field !mb-0 sm:col-span-2" placeholder="e.g. Pack charger" value={text} onChange={(e) => setText(e.target.value)} required maxLength={500} />
        <input className="field !mb-0" type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
        <textarea
          className="field sm:col-span-3"
          rows="2"
          placeholder="Reminder note (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1000}
        />
        <button type="submit" className="btn-primary shrink-0 sm:col-span-3">
          Add
        </button>
      </form>
      {items.length === 0 && <p className="text-sm text-slate-500">No checklist items yet.</p>}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5">
            <label className="flex flex-1 cursor-pointer items-center gap-3 text-sm text-slate-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                checked={item.isDone}
                onChange={(e) => onToggle(item.id, e.target.checked)}
              />
              <span className={item.isDone ? 'text-slate-400 line-through' : ''}>
                <span className="font-medium">{item.text}</span>
                {(item.reminderDate || item.notes) && (
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {item.reminderDate && `Reminder: ${new Date(item.reminderDate).toLocaleDateString()}`}
                    {item.reminderDate && item.notes && ' · '}
                    {item.notes}
                  </span>
                )}
              </span>
            </label>
            <button type="button" className="btn-ghost text-rose-700 hover:bg-rose-50" onClick={() => onRemove(item.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
