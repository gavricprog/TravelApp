import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as adminApi from '../api/adminApi';
import * as travelApi from '../api/travelApi';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('0');

  const load = async () => {
    setLoading(true);
    try {
      const data = await travelApi.listTravelPlans();
      setPlans(data);
      setError('');
    } catch {
      setError('Could not load trips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (user?.role !== 'Admin') {
      setAdminStats(null);
      return;
    }
    let cancelled = false;
    adminApi
      .getAdminStats()
      .then((s) => {
        if (!cancelled) setAdminStats(s);
      })
      .catch(() => {
        if (!cancelled) setAdminStats(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await travelApi.createTravelPlan({
        title,
        startDate,
        endDate,
        budget: Number(budget),
      });
      setTitle('');
      setStartDate('');
      setEndDate('');
      setBudget('0');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create trip (check dates & budget).');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this trip?')) return;
    try {
      await travelApi.deleteTravelPlan(id);
      await load();
    } catch {
      setError('Could not delete.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your trips</h1>
        <p className="mt-1 text-slate-600">Create a plan, then add destinations, days, expenses, and a checklist.</p>
      </div>

      {adminStats && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm">
          <strong className="font-semibold">Admin overview</strong> — users: {adminStats.userCount}, trips (all):{' '}
          {adminStats.travelPlanCount}. <span className="text-amber-800/90">{adminStats.note}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      )}

      <div className="surface-tint">
        <h2 className="section-title">
          <span className="text-xl" aria-hidden>
            ➕
          </span>
          New trip
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          End date must be <strong className="text-slate-800">after</strong> start date; budget must be{' '}
          <strong className="text-slate-800">≥ 0</strong> (validated on the server).
        </p>
        <form className="space-y-4" onSubmit={create}>
          <div>
            <label className="field-label">Title</label>
            <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="field-label">Start</label>
              <input
                className="field"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
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
          <button type="submit" className="btn-primary">
            Create trip
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/80 px-6 py-8 text-slate-600 shadow-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          Loading your trips…
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center text-slate-500">
          <p className="text-lg font-medium text-slate-700">No trips yet</p>
          <p className="mt-1 text-sm">Use the form above to create your first itinerary.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {plans.map((p) => (
            <li key={p.id} className="surface group flex flex-col transition hover:shadow-glow">
              <div className="flex flex-1 flex-col">
                <Link
                  to={`/travel/${p.id}`}
                  className="text-lg font-bold text-slate-900 no-underline group-hover:text-teal-700"
                >
                  {p.title}
                </Link>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(p.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' })} →{' '}
                  {new Date(p.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                    <span className="text-xs font-medium uppercase text-slate-500">Budget</span>
                    <p className="font-semibold text-slate-900">{Number(p.budget).toFixed(2)}</p>
                  </div>
                  <div className="rounded-xl bg-teal-50/80 px-3 py-2 ring-1 ring-teal-100">
                    <span className="text-xs font-medium uppercase text-teal-700">Spent</span>
                    <p className="font-semibold text-teal-900">{Number(p.totalExpenses).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="divider" />
              <div className="flex justify-end">
                <button type="button" className="btn-danger !text-xs" onClick={() => remove(p.id)}>
                  Delete trip
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
