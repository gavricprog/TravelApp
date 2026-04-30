import { useState } from 'react';

export default function ChecklistSection({ items = [], onAdd, onToggle, onRemove }) {
  const [text, setText] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    await onAdd({ text });
    setText('');
  };

  return (
    <div className="surface">
      <h2 className="section-title">
        <span aria-hidden>✅</span> Checklist
      </h2>
      <form className="mb-4 flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
        <input className="field flex-1 !mb-0" placeholder="e.g. Pack charger" value={text} onChange={(e) => setText(e.target.value)} required maxLength={500} />
        <button type="submit" className="btn-primary shrink-0">
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
              <span className={item.isDone ? 'text-slate-400 line-through' : ''}>{item.text}</span>
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
