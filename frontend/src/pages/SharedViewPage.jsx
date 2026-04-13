import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as travelApi from '../api/travelApi';

/**
 * Read-only page for professors / friends — opened via /share/{token}.
 * No login required; backend only returns data if the token matches.
 */
export default function SharedViewPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const view = await travelApi.getSharedTravel(token);
        if (!cancelled) {
          setData(view);
          setError('');
        }
      } catch {
        if (!cancelled) {
          setError('Invalid or expired share link.');
          setData(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <div className="surface text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-2xl">🔒</div>
          <h1 className="text-xl font-bold text-slate-900">Shared trip</h1>
          <p className="mt-2 text-rose-700">{error}</p>
          <Link to="/login" className="btn-primary mt-6 inline-flex">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center gap-3 text-slate-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        Loading shared trip…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-glow">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-700 px-6 py-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-100">Shared itinerary · view only</p>
          <h1 className="mt-2 text-3xl font-bold">{data.title}</h1>
          <p className="mt-2 text-teal-100">
            {new Date(data.startDate).toLocaleDateString(undefined, { dateStyle: 'long' })} →{' '}
            {new Date(data.endDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
        </div>
        <div className="grid gap-px bg-slate-100 sm:grid-cols-3">
          <div className="bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Budget</p>
            <p className="text-lg font-bold text-slate-900">{Number(data.budget).toFixed(2)}</p>
          </div>
          <div className="bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Spent</p>
            <p className="text-lg font-bold text-slate-900">{Number(data.totalExpenses).toFixed(2)}</p>
          </div>
          <div className="bg-teal-50/80 p-4">
            <p className="text-xs font-semibold uppercase text-teal-800">Remaining</p>
            <p className="text-lg font-bold text-teal-900">{Number(data.remainingBudget).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="surface">
        <h2 className="section-title">
          <span aria-hidden>📍</span> Destinations
        </h2>
        <ul className="list-inside list-disc space-y-1 text-slate-700">
          {data.destinations?.map((d) => (
            <li key={d.id}>{d.name}</li>
          ))}
        </ul>
      </div>

      <div className="surface">
        <h2 className="section-title">
          <span aria-hidden>🗓️</span> Activities
        </h2>
        {data.activitiesByDay?.map((g) => (
          <div key={g.date} className="mb-6 last:mb-0">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-teal-800">{g.date}</h3>
            <ul className="space-y-2 text-slate-700">
              {g.items.map((a) => (
                <li key={a.id} className="rounded-lg bg-slate-50/80 px-2 py-1 text-sm">
                  <span className="font-medium">{a.title}</span>
                  {(a.time || a.location || a.cost != null || a.status) && (
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {a.time && `${a.time} · `}
                      {a.location && `${a.location} · `}
                      {a.cost != null && `${Number(a.cost).toFixed(2)} · `}
                      {a.status && <span className="font-medium text-teal-800">{a.status}</span>}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="surface">
        <h2 className="section-title">
          <span aria-hidden>💰</span> Expenses
        </h2>
        <ul className="divide-y divide-slate-100">
          {data.expenses?.map((e) => (
            <li key={e.id} className="flex justify-between gap-2 py-2 text-sm">
              <span className="text-slate-700">
                <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs">{e.category || 'General'}</span>
                {e.description}
              </span>
              <span className="shrink-0 font-semibold text-teal-800">{Number(e.amount).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="surface">
        <h2 className="section-title">
          <span aria-hidden>✅</span> Checklist
        </h2>
        <ul className="space-y-2">
          {data.checklist?.map((c) => (
            <li
              key={c.id}
              className={`rounded-xl border border-slate-100 px-3 py-2 text-sm ${c.isDone ? 'bg-slate-50 text-slate-400 line-through' : 'bg-white text-slate-800'}`}
            >
              {c.text}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-xs text-slate-500">Editing is disabled on shared links.</p>
    </div>
  );
}
