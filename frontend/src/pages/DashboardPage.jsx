import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as adminApi from '../api/adminApi';
import * as adminService from '../api/adminService';
import * as travelApi from '../api/travelApi';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { validateDateRange, validateNonNegativeNumber } from '../utils/validation.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotifications();
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminPlans, setAdminPlans] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
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

  const loadAdminData = async () => {
    setAdminLoading(true);
    try {
      const [stats, users, allPlans] = await Promise.all([
        adminApi.getAdminStats(),
        adminService.getUsers(),
        adminService.getAllPlans(),
      ]);
      setAdminStats(stats);
      setAdminUsers(users);
      setAdminPlans(allPlans);
    } catch (err) {
      setAdminStats(null);
      setAdminUsers([]);
      setAdminPlans([]);
      notifyError(err.response?.data?.message || 'Could not load admin data.');
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'Admin') {
      setAdminStats(null);
      setAdminUsers([]);
      setAdminPlans([]);
      return;
    }
    let cancelled = false;
    setAdminLoading(true);
    Promise.all([adminApi.getAdminStats(), adminService.getUsers(), adminService.getAllPlans()])
      .then(([stats, users, allPlans]) => {
        if (cancelled) return;
        setAdminStats(stats);
        setAdminUsers(users);
        setAdminPlans(allPlans);
      })
      .catch(() => {
        if (cancelled) return;
        setAdminStats(null);
        setAdminUsers([]);
        setAdminPlans([]);
      })
      .finally(() => {
        if (!cancelled) setAdminLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const changeUserRole = async (targetUser) => {
    const nextRole = targetUser.role === 'Admin' ? 'User' : 'Admin';
    try {
      await adminService.updateUserRole(targetUser.id, nextRole);
      await loadAdminData();
      notifySuccess(`${targetUser.email} is now ${nextRole}.`);
    } catch (err) {
      notifyError(err.response?.data?.message || 'Could not update user role.');
    }
  };

  const deleteAdminUser = async (targetUser) => {
    if (targetUser.id === user?.userId) return;
    if (!window.confirm(`Delete user ${targetUser.email}? This also deletes their travel plans.`)) return;
    try {
      await adminService.deleteUser(targetUser.id);
      await loadAdminData();
      notifySuccess('User deleted successfully.');
    } catch (err) {
      notifyError(err.response?.data?.message || 'Could not delete user.');
    }
  };

  const deleteAnyPlan = async (plan) => {
    if (!window.confirm(`Delete travel plan "${plan.title}" owned by ${plan.ownerEmail}?`)) return;
    try {
      await adminService.deletePlan(plan.id);
      await Promise.all([load(), loadAdminData()]);
      notifySuccess('Travel plan deleted successfully.');
    } catch (err) {
      notifyError(err.response?.data?.message || 'Could not delete travel plan.');
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setError('');
    const dateError = validateDateRange(startDate, endDate);
    const budgetError = validateNonNegativeNumber(budget, 'Budget');
    if (dateError || budgetError) {
      setError(dateError || budgetError);
      return;
    }

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
      notifySuccess('Trip created successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create trip (check dates & budget).');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this trip?')) return;
    try {
      await travelApi.deleteTravelPlan(id);
      await load();
      notifySuccess('Trip deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete.');
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

      {user?.role === 'Admin' && (
        <div className="space-y-6">
          <div className="surface">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="section-title !mb-1">Admin users</h2>
                <p className="text-sm text-slate-600">Promote, demote, or remove user accounts.</p>
              </div>
              {adminLoading && <span className="text-sm text-slate-500">Loading admin data…</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Role</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminUsers.map((adminUser) => {
                    const isCurrentUser = adminUser.id === user?.userId;
                    return (
                      <tr key={adminUser.id}>
                        <td className="py-3 pr-3 font-medium text-slate-800">{adminUser.email}</td>
                        <td className="py-3 pr-3">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                            {adminUser.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex justify-end gap-2">
                            <button type="button" className="btn-secondary !py-1.5 !text-xs" onClick={() => changeUserRole(adminUser)}>
                              {adminUser.role === 'Admin' ? 'Demote' : 'Promote'}
                            </button>
                            <button
                              type="button"
                              className="btn-danger !py-1.5 !text-xs"
                              onClick={() => deleteAdminUser(adminUser)}
                              disabled={isCurrentUser}
                              title={isCurrentUser ? 'You cannot delete your own admin account.' : undefined}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {adminUsers.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-6 text-center text-slate-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="surface">
            <div className="mb-4">
              <h2 className="section-title !mb-1">All travel plans</h2>
              <p className="text-sm text-slate-600">Review and delete plans across all users.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">Title</th>
                    <th className="py-2 pr-3">Owner</th>
                    <th className="py-2 pr-3">Dates</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminPlans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="py-3 pr-3 font-medium text-slate-800">{plan.title}</td>
                      <td className="py-3 pr-3 text-slate-600">{plan.ownerEmail}</td>
                      <td className="py-3 pr-3 text-slate-500">
                        {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <button type="button" className="btn-danger !py-1.5 !text-xs" onClick={() => deleteAnyPlan(plan)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {adminPlans.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-slate-500">
                        No travel plans found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
          <strong className="text-slate-800">≥ 0</strong>.
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
