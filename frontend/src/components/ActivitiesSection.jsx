import { useEffect, useState } from 'react';
import { ACTIVITY_STATUSES } from '../models/index.js';
import { validateDateInsideRange, validateNonNegativeNumber } from '../utils/validation.js';

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

function dateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getInitialCalendarMonth(activities) {
  const first = (activities || [])
    .map((activity) => activity.dayDate)
    .filter(Boolean)
    .sort()[0];
  const date = first ? new Date(first) : new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildCalendarDays(monthDate) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
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

function createEmptyActivity(planStartDate = '') {
  return {
    ...emptyActivity,
    dayDate: planStartDate,
  };
}

export default function ActivitiesSection({
  activities = [],
  planStartDate = '',
  planEndDate = '',
  onAdd,
  onUpdate,
  onRemove,
  onValidationError,
}) {
  const [form, setForm] = useState(emptyActivity);
  const [editing, setEditing] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => getInitialCalendarMonth(activities));
  const grouped = groupActivitiesByDate(activities);
  const calendarDays = buildCalendarDays(calendarMonth);
  const activitiesByIsoDate = (activities || []).reduce((acc, activity) => {
    const key = dateKey(activity.dayDate);
    acc[key] = acc[key] || [];
    acc[key].push(activity);
    return acc;
  }, {});
  const monthLabel = calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateEditing = (field, value) => setEditing((current) => ({ ...current, [field]: value }));
  const changeMonth = (offset) =>
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));

  useEffect(() => {
    if (activities.length > 0) setCalendarMonth(getInitialCalendarMonth(activities));
  }, [activities.length]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      dayDate: current.dayDate || planStartDate,
    }));
  }, [planStartDate]);

  const validateCost = (value) => {
    if (value === '' || value == null) return null;
    return validateNonNegativeNumber(value, 'Activity cost');
  };

  const submit = async (e) => {
    e.preventDefault();
    const error = validateDateInsideRange(form.dayDate, planStartDate, planEndDate, 'Activity date') || validateCost(form.cost);
    if (error) {
      onValidationError(error);
      return;
    }

    await onAdd(toPayload(form));
    setForm(createEmptyActivity(planStartDate));
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;

    const error = validateDateInsideRange(editing.dayDate, planStartDate, planEndDate, 'Activity date') || validateCost(editing.cost);
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
      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button type="button" className="btn-secondary !py-1.5 !text-xs" onClick={() => changeMonth(-1)}>
            Previous
          </button>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">{monthLabel}</h3>
          <button type="button" className="btn-secondary !py-1.5 !text-xs" onClick={() => changeMonth(1)}>
            Next
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-slate-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const key = dateKey(day);
            const items = activitiesByIsoDate[key] || [];
            const inMonth = day.getMonth() === calendarMonth.getMonth();
            return (
              <div
                key={key}
                className={`min-h-24 rounded-xl border p-2 text-left ${
                  inMonth ? 'border-slate-100 bg-slate-50/80' : 'border-slate-50 bg-slate-50/30 text-slate-400'
                }`}
              >
                <p className="mb-1 text-xs font-semibold">{day.getDate()}</p>
                <div className="space-y-1">
                  {items.slice(0, 3).map((activity) => (
                    <button
                      key={activity.id}
                      type="button"
                      className="block w-full truncate rounded-md bg-teal-100 px-1.5 py-1 text-left text-[11px] font-medium text-teal-900"
                      title={activity.title}
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
                      {activity.time ? `${activity.time} ` : ''}
                      {activity.title}
                    </button>
                  ))}
                  {items.length > 3 && <p className="text-[11px] text-slate-500">+{items.length - 3} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <form className="mb-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <div>
          <label className="field-label">Day</label>
          <input
            className="field"
            type="date"
            value={form.dayDate}
            min={planStartDate}
            max={planEndDate}
            onChange={(e) => updateForm('dayDate', e.target.value)}
            required
          />
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
                    <input
                      className="field"
                      type="date"
                      value={editing.dayDate}
                      min={planStartDate}
                      max={planEndDate}
                      onChange={(e) => updateEditing('dayDate', e.target.value)}
                      required
                    />
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
