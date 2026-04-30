import { useEffect, useState } from 'react';
import { validateDateRange, validateNonNegativeNumber } from '../utils/validation.js';

export default function TripSummaryForm({ plan, remaining, onSave, onDownloadPdf, isPdfLoading, onValidationError }) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('0');

  useEffect(() => {
    setTitle(plan.title || '');
    setStartDate(plan.startDate?.slice(0, 10) || '');
    setEndDate(plan.endDate?.slice(0, 10) || '');
    setBudget(String(plan.budget ?? 0));
  }, [plan]);

  const remainingOk = remaining >= 0;

  const submit = async (e) => {
    e.preventDefault();
    const dateError = validateDateRange(startDate, endDate);
    const budgetError = validateNonNegativeNumber(budget, 'Budget');
    if (dateError || budgetError) {
      onValidationError(dateError || budgetError);
      return;
    }

    await onSave({
      title,
      startDate,
      endDate,
      budget: Number(budget),
    });
  };

  return (
    <>
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
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="field-label">Title</label>
            <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="field-label">Start</label>
              <input className="field" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label className="field-label">End</label>
              <input className="field" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            <div>
              <label className="field-label">Budget</label>
              <input
                className="field"
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary">
              Save changes
            </button>
            {onDownloadPdf && (
              <button type="button" className="btn-secondary" onClick={onDownloadPdf} disabled={isPdfLoading}>
                {isPdfLoading ? 'Generating PDF…' : 'Download PDF'}
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
