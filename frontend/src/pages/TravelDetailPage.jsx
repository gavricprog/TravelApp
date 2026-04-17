import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as travelApi from '../api/travelApi';
import * as expenseApi from '../api/expenseApi';

const EXPENSE_CATEGORIES = ['General', 'Food', 'Transport', 'Lodging', 'Activities', 'Other'];
const ACTIVITY_STATUSES = ['Planned', 'Done', 'Cancelled'];

function groupActivitiesByDate(activities) {
  const map = new Map();
  (activities || []).forEach((a) => {
    const key = new Date(a.dayDate).toLocaleDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(a);
  });
  return Array.from(map.entries());
}

function activityPayloadFromForm(fields) {
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

function destinationPayloadFromForm(fields) {
  return {
    name: fields.name,
    location: fields.location,
    startDate: fields.startDate,
    endDate: fields.endDate,
    description: fields.description?.trim() ? fields.description.trim() : null,
    notes: fields.notes?.trim() ? fields.notes.trim() : null,
  };
}

export default function TravelDetailPage() {
  const { id } = useParams();
  const travelId = Number(id);

  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editBudget, setEditBudget] = useState('');

  const [destName, setDestName] = useState('');
  const [destLocation, setDestLocation] = useState('');
  const [destStartDate, setDestStartDate] = useState('');
  const [destEndDate, setDestEndDate] = useState('');
  const [destDescription, setDestDescription] = useState('');
  const [destNotes, setDestNotes] = useState('');
  const [editingDestId, setEditingDestId] = useState(null);
  const [destEditName, setDestEditName] = useState('');
  const [destEditLocation, setDestEditLocation] = useState('');
  const [destEditStartDate, setDestEditStartDate] = useState('');
  const [destEditEndDate, setDestEditEndDate] = useState('');
  const [destEditDescription, setDestEditDescription] = useState('');
  const [destEditNotes, setDestEditNotes] = useState('');

  const [actDate, setActDate] = useState('');
  const [actTitle, setActTitle] = useState('');
  const [actNotes, setActNotes] = useState('');
  const [actTime, setActTime] = useState('');
  const [actLocation, setActLocation] = useState('');
  const [actCost, setActCost] = useState('');
  const [actStatus, setActStatus] = useState('Planned');

  const [editingAct, setEditingAct] = useState(null);

  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expCategory, setExpCategory] = useState('General');
  const [checkText, setCheckText] = useState('');
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [shareMessage, setShareMessage] = useState('');

  const load = async () => {
    try {
      const data = await travelApi.getTravelPlan(travelId);
      setPlan(data);
      setEditTitle(data.title);
      setEditStart(data.startDate?.slice(0, 10));
      setEditEnd(data.endDate?.slice(0, 10));
      setEditBudget(String(data.budget));
      setError('');
    } catch {
      setError('Trip not found or no access.');
      setPlan(null);
    }
  };

  useEffect(() => {
    load();
    loadShare();
  }, [travelId]);

  const remaining = useMemo(() => {
    if (!plan) return 0;
    return Number(plan.budget) - Number(plan.totalExpenses);
  }, [plan]);

  const savePlan = async (e) => {
    e.preventDefault();
    try {
      await travelApi.updateTravelPlan(travelId, {
        title: editTitle,
        startDate: editStart,
        endDate: editEnd,
        budget: Number(editBudget),
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed (dates / budget).');
    }
  };

  const addDest = async (e) => {
    e.preventDefault();
    if (new Date(destStartDate) > new Date(destEndDate)) {
      setError('Destination start date cannot be after end date.');
      return;
    }

    try {
      await travelApi.addDestination(
        travelId,
        destinationPayloadFromForm({
          name: destName,
          location: destLocation,
          startDate: destStartDate,
          endDate: destEndDate,
          description: destDescription,
          notes: destNotes,
        })
      );
      setDestName('');
      setDestLocation('');
      setDestStartDate('');
      setDestEndDate('');
      setDestDescription('');
      setDestNotes('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add destination.');
    }
  };

  const saveDestEdit = async () => {
    if (!editingDestId) return;
    if (new Date(destEditStartDate) > new Date(destEditEndDate)) {
      setError('Destination start date cannot be after end date.');
      return;
    }

    try {
      await travelApi.updateDestination(
        editingDestId,
        destinationPayloadFromForm({
          name: destEditName,
          location: destEditLocation,
          startDate: destEditStartDate,
          endDate: destEditEndDate,
          description: destEditDescription,
          notes: destEditNotes,
        })
      );
      setEditingDestId(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update destination.');
    }
  };

  const addAct = async (e) => {
    e.preventDefault();
    try {
      await travelApi.addActivity(
        travelId,
        activityPayloadFromForm({
          dayDate: actDate,
          title: actTitle,
          notes: actNotes,
          time: actTime,
          location: actLocation,
          cost: actCost,
          status: actStatus,
        })
      );
      setActTitle('');
      setActNotes('');
      setActTime('');
      setActLocation('');
      setActCost('');
      setActStatus('Planned');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add activity.');
    }
  };

  const saveActEdit = async (e) => {
    e.preventDefault();
    if (!editingAct) return;
    try {
      await travelApi.updateActivity(editingAct.id, activityPayloadFromForm(editingAct));
      setEditingAct(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update activity.');
    }
  };

  const addExp = async (e) => {
    e.preventDefault();
    try {
      await expenseApi.addExpense(travelId, {
        amount: Number(expAmount),
        description: expDesc,
        category: expCategory,
        spentOn: null,
      });
      setExpAmount('');
      setExpDesc('');
      setExpCategory('General');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add expense.');
    }
  };

  const addCheck = async (e) => {
    e.preventDefault();
    try {
      await travelApi.addChecklistItem(travelId, { text: checkText });
      setCheckText('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add checklist item.');
    }
  };

  const loadShare = async () => {
    try {
      const data = await travelApi.getPlanShare(travelId);
      setShareData(data);
      setShareMessage('');
    } catch {
      setError('Could not load share details.');
    }
  };

  const regenerateShare = async () => {
    try {
      await travelApi.regenerateShareToken(travelId);
      await load();
      await loadShare();
      setShareMessage('Share token regenerated.');
    } catch {
      setError('Could not regenerate share token.');
    }
  };

  const copyShareLink = async () => {
    if (!shareData?.shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setShareMessage('Share link copied to clipboard.');
    } catch {
      setError('Could not copy share link.');
    }
  };

  const downloadQrCode = () => {
    if (!shareData?.qrCode) return;
    const a = document.createElement('a');
    a.href = shareData.qrCode;
    a.download = `travel-plan-${travelId}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadPdf = async () => {
    try {
      setIsPdfLoading(true);
      const { blob, fileName } = await travelApi.downloadTravelPlanPdf(travelId);
      const downloadName = fileName || `travel-plan-${travelId}.pdf`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate PDF report.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  if (!plan && !error) {
    return (
      <div className="flex items-center gap-3 text-slate-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        Loading trip…
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="surface max-w-lg">
        <p className="text-rose-700">{error}</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-teal-700 hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const grouped = groupActivitiesByDate(plan.activities);
  const remainingOk = remaining >= 0;

  return (
    <div className="space-y-8">
      <div>
        <Link to="/" className="text-sm font-semibold text-teal-700 hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{plan.title}</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-700 p-4 text-white shadow-glow">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-100">Budget</p>
          <p className="mt-1 text-2xl font-bold">{Number(plan.budget).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Spent</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{Number(plan.totalExpenses).toFixed(2)}</p>
        </div>
        <div
          className={`rounded-2xl border p-4 shadow-soft ${
            remainingOk ? 'border-teal-100 bg-teal-50/50' : 'border-rose-200 bg-rose-50'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Remaining</p>
          <p className={`mt-1 text-2xl font-bold ${remainingOk ? 'text-teal-900' : 'text-rose-800'}`}>
            {remaining.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="surface">
        <h2 className="section-title">
          <span aria-hidden>✎</span> Edit trip
        </h2>
        <form className="space-y-4" onSubmit={savePlan}>
          <div>
            <label className="field-label">Title</label>
            <input className="field" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="field-label">Start</label>
              <input
                className="field"
                type="date"
                value={editStart}
                onChange={(e) => setEditStart(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="field-label">End</label>
              <input className="field" type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} required />
            </div>
            <div>
              <label className="field-label">Budget</label>
              <input
                className="field"
                type="number"
                min="0"
                step="0.01"
                value={editBudget}
                onChange={(e) => setEditBudget(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary">
              Save changes
            </button>
            <button type="button" className="btn-secondary" onClick={downloadPdf} disabled={isPdfLoading}>
              {isPdfLoading ? 'Generating PDF…' : 'Download PDF'}
            </button>
          </div>
        </form>
      </div>

      <div className="surface">
        <h2 className="section-title">
          <span aria-hidden>🔗</span> Share
        </h2>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn-secondary" onClick={regenerateShare}>
              Regenerate share token
            </button>
            <button type="button" className="btn-primary" onClick={copyShareLink} disabled={!shareData?.shareUrl}>
              Copy link
            </button>
            <button type="button" className="btn-secondary" onClick={downloadQrCode} disabled={!shareData?.qrCode}>
              Download QR
            </button>
            {shareData?.accessLevel && (
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Access: {shareData.accessLevel}
              </span>
            )}
          </div>

          <div className="flex justify-center">
            {shareData?.qrCode ? (
              <img
                src={shareData.qrCode}
                alt="Travel plan share QR code"
                className="h-56 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-soft"
              />
            ) : (
              <div className="h-56 w-56 rounded-xl border border-dashed border-slate-300 bg-slate-50" />
            )}
          </div>

          <div className="rounded-lg bg-slate-50 px-3 py-2 text-center text-sm text-slate-700 break-all">
            {shareData?.shareUrl || 'Share link unavailable.'}
          </div>

          {shareMessage && (
            <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">{shareMessage}</div>
          )}
        </div>
      </div>

      <div className="surface">
        <h2 className="section-title">
          <span aria-hidden>📍</span> Destinations
        </h2>
        <form className="mb-6 grid gap-4 sm:grid-cols-2" onSubmit={addDest}>
          <div>
            <label className="field-label">Name</label>
            <input
              className="field"
              placeholder="Destination name"
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Location</label>
            <input
              className="field"
              placeholder="City, country, or place"
              value={destLocation}
              onChange={(e) => setDestLocation(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Start date</label>
            <input
              className="field"
              type="date"
              value={destStartDate}
              onChange={(e) => setDestStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">End date</label>
            <input
              className="field"
              type="date"
              value={destEndDate}
              onChange={(e) => setDestEndDate(e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Description (optional)</label>
            <textarea
              className="field"
              rows="3"
              value={destDescription}
              onChange={(e) => setDestDescription(e.target.value)}
              maxLength={2000}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Notes (optional)</label>
            <textarea
              className="field"
              rows="3"
              value={destNotes}
              onChange={(e) => setDestNotes(e.target.value)}
              maxLength={2000}
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">
              Add destination
            </button>
          </div>
        </form>
        {plan.destinations?.length === 0 && <p className="text-sm text-slate-500">No destinations yet.</p>}
        <ul className="divide-y divide-slate-100">
          {plan.destinations?.map((d) => (
            <li key={d.id} className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
              {editingDestId === d.id ? (
                <div className="grid flex-1 gap-2 sm:grid-cols-2">
                  <input className="field" value={destEditName} onChange={(e) => setDestEditName(e.target.value)} required />
                  <input
                    className="field"
                    value={destEditLocation}
                    onChange={(e) => setDestEditLocation(e.target.value)}
                    required
                  />
                  <input
                    className="field"
                    type="date"
                    value={destEditStartDate}
                    onChange={(e) => setDestEditStartDate(e.target.value)}
                    required
                  />
                  <input
                    className="field"
                    type="date"
                    value={destEditEndDate}
                    onChange={(e) => setDestEditEndDate(e.target.value)}
                    required
                  />
                  <textarea
                    className="field sm:col-span-2"
                    rows="2"
                    value={destEditDescription}
                    onChange={(e) => setDestEditDescription(e.target.value)}
                    maxLength={2000}
                    placeholder="Description (optional)"
                  />
                  <textarea
                    className="field sm:col-span-2"
                    rows="2"
                    value={destEditNotes}
                    onChange={(e) => setDestEditNotes(e.target.value)}
                    maxLength={2000}
                    placeholder="Notes (optional)"
                  />
                  <div className="flex gap-2">
                    <button type="button" className="btn-primary !py-2" onClick={saveDestEdit}>
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn-secondary !py-2"
                      onClick={() => setEditingDestId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium text-slate-800">{d.name}</p>
                    <p className="text-xs text-slate-500">
                      {d.location} · {new Date(d.startDate).toLocaleDateString()} - {new Date(d.endDate).toLocaleDateString()}
                    </p>
                    {d.description && <p className="text-sm text-slate-600">{d.description}</p>}
                    {d.notes && <p className="text-sm text-slate-600">Notes: {d.notes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="btn-ghost text-teal-800"
                      onClick={() => {
                        setEditingDestId(d.id);
                        setDestEditName(d.name);
                        setDestEditLocation(d.location || '');
                        setDestEditStartDate(d.startDate?.slice(0, 10) || '');
                        setDestEditEndDate(d.endDate?.slice(0, 10) || '');
                        setDestEditDescription(d.description || '');
                        setDestEditNotes(d.notes || '');
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-ghost text-rose-700 hover:bg-rose-50"
                      onClick={() => travelApi.removeDestination(d.id).then(load)}
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="surface">
        <h2 className="section-title">
          <span aria-hidden>🗓️</span> Activities by day
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Each activity has a <strong>name</strong>, <strong>date</strong>, optional <strong>time</strong>,{' '}
          <strong>location</strong>, optional <strong>cost</strong>, and <strong>status</strong>.
        </p>
        <form className="mb-6 grid gap-4 sm:grid-cols-2" onSubmit={addAct}>
          <div>
            <label className="field-label">Day</label>
            <input className="field" type="date" value={actDate} onChange={(e) => setActDate(e.target.value)} required />
          </div>
          <div>
            <label className="field-label">Time (optional)</label>
            <input className="field" type="time" value={actTime} onChange={(e) => setActTime(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Name</label>
            <input className="field" value={actTitle} onChange={(e) => setActTitle(e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Location (optional)</label>
            <input className="field" value={actLocation} onChange={(e) => setActLocation(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Cost (optional)</label>
            <input
              className="field"
              type="number"
              min="0"
              step="0.01"
              value={actCost}
              onChange={(e) => setActCost(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Status</label>
            <select className="field" value={actStatus} onChange={(e) => setActStatus(e.target.value)}>
              {ACTIVITY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Notes (optional)</label>
            <input className="field" value={actNotes} onChange={(e) => setActNotes(e.target.value)} />
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
              {items.map((a) =>
                editingAct?.id === a.id ? (
                  <li key={a.id} className="rounded-lg border border-teal-200 bg-white p-3 text-sm">
                    <form className="grid gap-2 sm:grid-cols-2" onSubmit={saveActEdit}>
                      <div>
                        <label className="field-label">Day</label>
                        <input
                          className="field"
                          type="date"
                          value={editingAct.dayDate}
                          onChange={(e) => setEditingAct({ ...editingAct, dayDate: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="field-label">Time</label>
                        <input
                          className="field"
                          type="time"
                          value={editingAct.time}
                          onChange={(e) => setEditingAct({ ...editingAct, time: e.target.value })}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="field-label">Name</label>
                        <input
                          className="field"
                          value={editingAct.title}
                          onChange={(e) => setEditingAct({ ...editingAct, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="field-label">Location</label>
                        <input
                          className="field"
                          value={editingAct.location}
                          onChange={(e) => setEditingAct({ ...editingAct, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="field-label">Cost</label>
                        <input
                          className="field"
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingAct.cost}
                          onChange={(e) => setEditingAct({ ...editingAct, cost: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="field-label">Status</label>
                        <select
                          className="field"
                          value={editingAct.status}
                          onChange={(e) => setEditingAct({ ...editingAct, status: e.target.value })}
                        >
                          {ACTIVITY_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="field-label">Notes</label>
                        <input
                          className="field"
                          value={editingAct.notes}
                          onChange={(e) => setEditingAct({ ...editingAct, notes: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2 sm:col-span-2">
                        <button type="submit" className="btn-primary !py-2">
                          Save
                        </button>
                        <button type="button" className="btn-secondary !py-2" onClick={() => setEditingAct(null)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </li>
                ) : (
                  <li key={a.id} className="flex flex-col gap-2 rounded-lg bg-white/90 px-3 py-2 text-sm sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{a.title}</p>
                      <p className="text-xs text-slate-500">
                        {a.time && <span>{a.time} · </span>}
                        {a.location && <span>{a.location} · </span>}
                        {a.cost != null && <span>Cost {Number(a.cost).toFixed(2)} · </span>}
                        <span className="font-medium text-teal-800">{a.status}</span>
                      </p>
                      {a.notes && <p className="mt-1 text-slate-600">{a.notes}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        className="btn-ghost text-teal-800"
                        onClick={() =>
                          setEditingAct({
                            id: a.id,
                            dayDate: a.dayDate?.slice(0, 10),
                            title: a.title,
                            notes: a.notes || '',
                            time: a.time || '',
                            location: a.location || '',
                            cost: a.cost != null ? String(a.cost) : '',
                            status: a.status || 'Planned',
                          })
                        }
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-ghost text-rose-700 hover:bg-rose-50"
                        onClick={() => travelApi.removeActivity(a.id).then(load)}
                      >
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

      <div className="surface">
        <h2 className="section-title">
          <span aria-hidden>💰</span> Expenses
        </h2>
        <form className="mb-6 grid gap-4 sm:grid-cols-3" onSubmit={addExp}>
          <div>
            <label className="field-label">Amount</label>
            <input
              className="field"
              type="number"
              min="0.01"
              step="0.01"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Category</label>
            <select className="field" value={expCategory} onChange={(e) => setExpCategory(e.target.value)}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="field-label">Description</label>
            <input className="field" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} required />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" className="btn-primary">
              Add expense
            </button>
          </div>
        </form>
        <ul className="divide-y divide-slate-100">
          {plan.expenses?.map((ex) => (
            <li key={ex.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
              <span className="text-slate-800">
                <span className="mr-2 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {ex.category || 'General'}
                </span>
                {ex.description}{' '}
                <span className="font-semibold text-teal-800">{Number(ex.amount).toFixed(2)}</span>
              </span>
              <button
                type="button"
                className="btn-ghost text-rose-700 hover:bg-rose-50"
                onClick={() => expenseApi.deleteExpense(travelId, ex.id).then(load)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="surface">
        <h2 className="section-title">
          <span aria-hidden>✅</span> Checklist
        </h2>
        <form className="mb-4 flex flex-col gap-3 sm:flex-row" onSubmit={addCheck}>
          <input
            className="field flex-1 !mb-0"
            placeholder="e.g. Pack charger"
            value={checkText}
            onChange={(e) => setCheckText(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary shrink-0">
            Add
          </button>
        </form>
        <ul className="space-y-2">
          {plan.checklist?.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5"
            >
              <label className="flex flex-1 cursor-pointer items-center gap-3 text-sm text-slate-800">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  checked={c.isDone}
                  onChange={(e) => travelApi.updateChecklistItem(c.id, { isDone: e.target.checked }).then(load)}
                />
                <span className={c.isDone ? 'text-slate-400 line-through' : ''}>{c.text}</span>
              </label>
              <button type="button" className="btn-ghost text-rose-700 hover:bg-rose-50" onClick={() => travelApi.removeChecklistItem(c.id).then(load)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
