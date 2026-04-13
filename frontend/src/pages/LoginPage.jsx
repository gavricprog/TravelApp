import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 shadow-glow sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">Welcome back</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Log in</h1>
          <p className="mt-2 text-sm text-slate-600">Access your trips, budget, and shared plans.</p>

          {error && (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
          )}

          <form className="mt-8 space-y-5" onSubmit={submit}>
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="field"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="field"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-base">
              Continue
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            No account?{' '}
            <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
