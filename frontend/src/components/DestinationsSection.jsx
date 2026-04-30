import { useState } from 'react';
import { validateDateRange } from '../utils/validation.js';

const emptyDestination = {
  name: '',
  location: '',
  startDate: '',
  endDate: '',
  description: '',
  notes: '',
};

function toPayload(fields) {
  return {
    name: fields.name,
    location: fields.location,
    startDate: fields.startDate,
    endDate: fields.endDate,
    description: fields.description?.trim() ? fields.description.trim() : null,
    notes: fields.notes?.trim() ? fields.notes.trim() : null,
  };
}

export default function DestinationsSection({ destinations = [], onAdd, onUpdate, onRemove, onValidationError }) {
  const [form, setForm] = useState(emptyDestination);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyDestination);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateEditForm = (field, value) => setEditForm((current) => ({ ...current, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();
    const error = validateDateRange(form.startDate, form.endDate, 'Destination end date');
    if (error) {
      onValidationError(error);
      return;
    }

    await onAdd(toPayload(form));
    setForm(emptyDestination);
  };

  const saveEdit = async () => {
    const error = validateDateRange(editForm.startDate, editForm.endDate, 'Destination end date');
    if (error) {
      onValidationError(error);
      return;
    }

    await onUpdate(editingId, toPayload(editForm));
    setEditingId(null);
  };

  const startEdit = (destination) => {
    setEditingId(destination.id);
    setEditForm({
      name: destination.name || '',
      location: destination.location || '',
      startDate: destination.startDate?.slice(0, 10) || '',
      endDate: destination.endDate?.slice(0, 10) || '',
      description: destination.description || '',
      notes: destination.notes || '',
    });
  };

  return (
    <div className="surface">
      <h2 className="section-title">
        <span aria-hidden>📍</span> Destinations
      </h2>
      <form className="mb-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <div>
          <label className="field-label">Name</label>
          <input className="field" value={form.name} onChange={(e) => updateForm('name', e.target.value)} required maxLength={200} />
        </div>
        <div>
          <label className="field-label">Location</label>
          <input className="field" value={form.location} onChange={(e) => updateForm('location', e.target.value)} required maxLength={300} />
        </div>
        <div>
          <label className="field-label">Start date</label>
          <input className="field" type="date" value={form.startDate} onChange={(e) => updateForm('startDate', e.target.value)} required />
        </div>
        <div>
          <label className="field-label">End date</label>
          <input className="field" type="date" value={form.endDate} onChange={(e) => updateForm('endDate', e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label">Description (optional)</label>
          <textarea className="field" rows="3" value={form.description} onChange={(e) => updateForm('description', e.target.value)} maxLength={2000} />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label">Notes (optional)</label>
          <textarea className="field" rows="3" value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} maxLength={2000} />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary">
            Add destination
          </button>
        </div>
      </form>

      {destinations.length === 0 && <p className="text-sm text-slate-500">No destinations yet.</p>}
      <ul className="divide-y divide-slate-100">
        {destinations.map((destination) => (
          <li key={destination.id} className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
            {editingId === destination.id ? (
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <input className="field" value={editForm.name} onChange={(e) => updateEditForm('name', e.target.value)} required />
                <input className="field" value={editForm.location} onChange={(e) => updateEditForm('location', e.target.value)} required />
                <input className="field" type="date" value={editForm.startDate} onChange={(e) => updateEditForm('startDate', e.target.value)} required />
                <input className="field" type="date" value={editForm.endDate} onChange={(e) => updateEditForm('endDate', e.target.value)} required />
                <textarea
                  className="field sm:col-span-2"
                  rows="2"
                  value={editForm.description}
                  onChange={(e) => updateEditForm('description', e.target.value)}
                  maxLength={2000}
                  placeholder="Description (optional)"
                />
                <textarea
                  className="field sm:col-span-2"
                  rows="2"
                  value={editForm.notes}
                  onChange={(e) => updateEditForm('notes', e.target.value)}
                  maxLength={2000}
                  placeholder="Notes (optional)"
                />
                <div className="flex gap-2">
                  <button type="button" className="btn-primary !py-2" onClick={saveEdit}>
                    Save
                  </button>
                  <button type="button" className="btn-secondary !py-2" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-medium text-slate-800">{destination.name}</p>
                  <p className="text-xs text-slate-500">
                    {destination.location} · {new Date(destination.startDate).toLocaleDateString()} -{' '}
                    {new Date(destination.endDate).toLocaleDateString()}
                  </p>
                  {destination.description && <p className="text-sm text-slate-600">{destination.description}</p>}
                  {destination.notes && <p className="text-sm text-slate-600">Notes: {destination.notes}</p>}
                </div>
                <div className="flex gap-1">
                  <button type="button" className="btn-ghost text-teal-800" onClick={() => startEdit(destination)}>
                    Edit
                  </button>
                  <button type="button" className="btn-ghost text-rose-700 hover:bg-rose-50" onClick={() => onRemove(destination.id)}>
                    Remove
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
