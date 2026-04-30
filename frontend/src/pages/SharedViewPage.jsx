import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as travelApi from '../api/travelApi';
import ActivitiesSection from '../components/ActivitiesSection.jsx';
import ChecklistSection from '../components/ChecklistSection.jsx';
import DestinationsSection from '../components/DestinationsSection.jsx';
import ExpensesSection from '../components/ExpensesSection.jsx';
import TripSummaryForm from '../components/TripSummaryForm.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';

function toEditablePlan(data) {
  return {
    ...data,
    shareToken: null,
    activities: (data.activitiesByDay || []).flatMap((group) => group.items || []),
    destinations: data.destinations || [],
    expenses: data.expenses || [],
    checklist: data.checklist || [],
  };
}

export default function SharedViewPage() {
  const { token } = useParams();
  const { notifySuccess, notifyError } = useNotifications();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const isEdit = data?.accessLevel === 'EDIT';
  const editablePlan = useMemo(() => (data ? toEditablePlan(data) : null), [data]);

  const load = async () => {
    try {
      const view = await travelApi.getSharedTravel(token);
      setData(view);
      setError('');
    } catch {
      setError('Invalid or expired share link.');
      setData(null);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const showError = (message) => {
    setError(message);
    notifyError(message);
  };

  const runSharedMutation = async (action, successMessage) => {
    try {
      setError('');
      await action();
      await load();
      notifySuccess(successMessage);
    } catch (err) {
      showError(err.response?.data?.message || 'Shared edit failed.');
    }
  };

  if (error && !data) {
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

  if (isEdit) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm">
          <strong className="font-semibold">Shared itinerary · edit access</strong> — changes are saved to the original trip.
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}

        <TripSummaryForm
          plan={editablePlan}
          remaining={Number(data.remainingBudget)}
          onSave={(payload) => runSharedMutation(() => travelApi.updateSharedTravelPlan(token, payload), 'Shared trip updated.')}
          onValidationError={showError}
        />

        <DestinationsSection
          destinations={editablePlan.destinations}
          onAdd={(payload) => runSharedMutation(() => travelApi.addSharedDestination(token, payload), 'Destination added.')}
          onUpdate={(id, payload) => runSharedMutation(() => travelApi.updateSharedDestination(token, id, payload), 'Destination updated.')}
          onRemove={(id) => runSharedMutation(() => travelApi.removeSharedDestination(token, id), 'Destination removed.')}
          onValidationError={showError}
        />

        <ActivitiesSection
          activities={editablePlan.activities}
          onAdd={(payload) => runSharedMutation(() => travelApi.addSharedActivity(token, payload), 'Activity added.')}
          onUpdate={(id, payload) => runSharedMutation(() => travelApi.updateSharedActivity(token, id, payload), 'Activity updated.')}
          onRemove={(id) => runSharedMutation(() => travelApi.removeSharedActivity(token, id), 'Activity removed.')}
          onValidationError={showError}
        />

        <ExpensesSection
          expenses={editablePlan.expenses}
          onAdd={(payload) => runSharedMutation(() => travelApi.addSharedExpense(token, payload), 'Expense added.')}
          onRemove={(id) => runSharedMutation(() => travelApi.removeSharedExpense(token, id), 'Expense removed.')}
          onValidationError={showError}
        />

        <ChecklistSection
          items={editablePlan.checklist}
          onAdd={(payload) => runSharedMutation(() => travelApi.addSharedChecklistItem(token, payload), 'Checklist item added.')}
          onToggle={(id, isDone) => runSharedMutation(() => travelApi.updateSharedChecklistItem(token, id, { isDone }), 'Checklist item updated.')}
          onRemove={(id) => runSharedMutation(() => travelApi.removeSharedChecklistItem(token, id), 'Checklist item removed.')}
        />
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
        <ul className="space-y-2 text-slate-700">
          {data.destinations?.map((destination) => (
            <li key={destination.id} className="rounded-lg bg-slate-50/80 px-3 py-2 text-sm">
              <p className="font-medium text-slate-900">{destination.name}</p>
              <p className="text-xs text-slate-500">
                {destination.location} · {new Date(destination.startDate).toLocaleDateString()} -{' '}
                {new Date(destination.endDate).toLocaleDateString()}
              </p>
              {destination.description && <p className="mt-1 text-slate-600">{destination.description}</p>}
              {destination.notes && <p className="mt-1 text-slate-600">Notes: {destination.notes}</p>}
            </li>
          ))}
        </ul>
      </div>

      <div className="surface">
        <h2 className="section-title">
          <span aria-hidden>🗓️</span> Activities
        </h2>
        {data.activitiesByDay?.map((group) => (
          <div key={group.date} className="mb-6 last:mb-0">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-teal-800">{group.date}</h3>
            <ul className="space-y-2 text-slate-700">
              {group.items.map((activity) => (
                <li key={activity.id} className="rounded-lg bg-slate-50/80 px-2 py-1 text-sm">
                  <span className="font-medium">{activity.title}</span>
                  {(activity.time || activity.location || activity.cost != null || activity.status) && (
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {activity.time && `${activity.time} · `}
                      {activity.location && `${activity.location} · `}
                      {activity.cost != null && `${Number(activity.cost).toFixed(2)} · `}
                      {activity.status && <span className="font-medium text-teal-800">{activity.status}</span>}
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
          {data.expenses?.map((expense) => (
            <li key={expense.id} className="flex justify-between gap-2 py-2 text-sm">
              <span className="text-slate-700">
                <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs">{expense.category || 'General'}</span>
                {expense.description}
              </span>
              <span className="shrink-0 font-semibold text-teal-800">{Number(expense.amount).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="surface">
        <h2 className="section-title">
          <span aria-hidden>✅</span> Checklist
        </h2>
        <ul className="space-y-2">
          {data.checklist?.map((item) => (
            <li
              key={item.id}
              className={`rounded-xl border border-slate-100 px-3 py-2 text-sm ${item.isDone ? 'bg-slate-50 text-slate-400 line-through' : 'bg-white text-slate-800'}`}
            >
              {item.text}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-xs text-slate-500">Editing is disabled on this shared link.</p>
    </div>
  );
}
