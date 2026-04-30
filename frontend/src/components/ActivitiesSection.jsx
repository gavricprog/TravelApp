import { useState } from 'react';
import { ACTIVITY_STATUSES } from '../models/index.js';
import { validateNonNegativeNumber } from '../utils/validation.js';

const emptyActivity = {
  dayDate: '',
  title: '',
  notes: '',
  time: '',
  location: '',
  cost: '',
  status: 'Planned',
};

function groupActivitiesByDate(activities) {
  const map = new Map();
  (activities || []).forEach((activity) => {
    const key = new Date(activity.dayDate).toLocaleDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(activity);
  });
  return Array.from(map.entries());
}

function toPayload(fields) {
  return {
    dayDate: fields.dayDate,
    title: fields.title,
    notes: fields.notes?.trim() ? fields.notes.trim() : null,
    time: fields.time?.trim() ? fields.time.trim() : null,
    location: fields.location?.trim() ? fields.location.trim() : null,
    cost: fields.cost === '' || fields.cost == null ? null : Number(fields.cost),
    status: fields.status || 'Planned',
  };
}

export default function ActivitiesSection({ activities = [], onAdd, onUpdate, onRemove, onValidationError }) {
  const [form, setForm] = useState(emptyActivity);
  const [editing, setEditing] = useState(null);
  const grouped = groupActivitiesByDate(activities);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateEditing = (field, value) => setEditing((current) => ({ ...current, [field]: value }));

  const validateCost = (value) => {
    if (value === '' || value == null) return null;
    return validateNonNegativeNumber(value, 'Activity cost');
  };

  const submit = async (e) => {
    e.preventDefault();
    const error = validateCost(form.cost);
    if (error) {
      onValidationError(error);
      return;
    }

    await onAdd(toPayload(form));
    setForm(emptyActivity);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;

    const error = validateCost(editing.cost);
    if (error) {
      onValidationError(error);
      return;
    }

    await onUpdate(editing.id, toPayload(editing));
    setEditing(null);
  };

  return (
    <div className="surface">
      <h2 className="section-title">
        <span aria-hidden>🗓️</span> Activities by day
      </h2>
      <p className="mb-4 text-sm text-slate-600">
        Each activity has a <strong>name</strong>, <strong>date</strong>, optional <strong>time</strong>,{' '}
        <strong>location</strong>, optional <strong>cost</strong>, and <strong>status</strong>.
        When an activity with cost is marked <strong>Done</strong>, that cost is counted against the remaining budget.
      </p>
      <form className="mb-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <div>
          <label className="field-label">Day</label>
          <input className="field" type="date" value={form.dayDate} onChange={(e) => updateForm('dayDate', e.target.value)} required />
        </div>
        <div>
          <label className="field-label">Time (optional)</label>
          <input className="field" type="time" value={form.time} onChange={(e) => updateForm('time', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label">Name</label>
          <input className="field" value={form.title} onChange={(e) => updateForm('title', e.target.value)} required maxLength={200} />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label">Location (optional)</label>
          <input className="field" value={form.location} onChange={(e) => updateForm('location', e.target.value)} maxLength={300} />
        </div>
        <div>
          <label className="field-label">Cost (optional)</label>
          <input className="field" type="number" min="0" step="0.01" value={form.cost} onChange={(e) => updateForm('cost', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Status</label>
          <select className="field" value={form.status} onChange={(e) => updateForm('status', e.target.value)}>
            {ACTIVITY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="field-label">Notes (optional)</label>
          <input className="field" value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} maxLength={2000} />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary">
            Add activity
          </button>
        </div>
      </form>

      {grouped.length === 0 && <p className="text-sm text-slate-500">No activities yet.</p>}
      {grouped.map(([day, items]) => (
        <div key={day} className="mb-6 last:mb-0">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-teal-800">{day}</h3>
          <ul className="space-y-3 rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-100">
            {items.map((activity) =>
              editing?.id === activity.id ? (
                <li key={activity.id} className="rounded-lg border border-teal-200 bg-white p-3 text-sm">
                  <form className="grid gap-2 sm:grid-cols-2" onSubmit={saveEdit}>
                    <input className="field" type="date" value={editing.dayDate} onChange={(e) => updateEditing('dayDate', e.target.value)} required />
                    <input className="field" type="time" value={editing.time} onChange={(e) => updateEditing('time', e.target.value)} />
                    <input className="field sm:col-span-2" value={editing.title} onChange={(e) => updateEditing('title', e.target.value)} required />
                    <input className="field sm:col-span-2" value={editing.location} onChange={(e) => updateEditing('location', e.target.value)} />
                    <input className="field" type="number" min="0" step="0.01" value={editing.cost} onChange={(e) => updateEditing('cost', e.target.value)} />
                    <select className="field" value={editing.status} onChange={(e) => updateEditing('status', e.target.value)}>
                      {ACTIVITY_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <input className="field sm:col-span-2" value={editing.notes} onChange={(e) => updateEditing('notes', e.target.value)} />
                    <div className="flex gap-2 sm:col-span-2">
                      <button type="submit" className="btn-primary !py-2">
                        Save
                      </button>
                      <button type="button" className="btn-secondary !py-2" onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </li>
              ) : (
                <li key={activity.id} className="flex flex-col gap-2 rounded-lg bg-white/90 px-3 py-2 text-sm sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-500">
                      {activity.time && <span>{activity.time} · </span>}
                      {activity.location && <span>{activity.location} · </span>}
                      {activity.cost != null && <span>Cost {Number(activity.cost).toFixed(2)} · </span>}
                      <span className="font-medium text-teal-800">{activity.status}</span>
                    </p>
                    {activity.notes && <p className="mt-1 text-slate-600">{activity.notes}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className="btn-ghost text-teal-800"
                      onClick={() =>
                        setEditing({
                          id: activity.id,
                          dayDate: activity.dayDate?.slice(0, 10),
                          title: activity.title,
                          notes: activity.notes || '',
                          time: activity.time || '',
                          location: activity.location || '',
                          cost: activity.cost != null ? String(activity.cost) : '',
                          status: activity.status || 'Planned',
                        })
                      }
                    >
                      Edit
                    </button>
                    <button type="button" className="btn-ghost text-rose-700 hover:bg-rose-50" onClick={() => onRemove(activity.id)}>
                      Remove
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
