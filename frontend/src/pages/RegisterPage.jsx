import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { PASSWORD_RULE_TEXT, validatePassword } from '../utils/validation.js';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const { notifySuccess } = useNotifications();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validatePassword(password)) {
      setError(PASSWORD_RULE_TEXT);
      return;
    }

    try {
      await register(email, password);
      notifySuccess('Account created successfully.');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 shadow-glow sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-24 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-teal-400/15 blur-3xl" />

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">Join Voyage</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Create account</h1>
          <p className="mt-2 text-sm text-slate-600">Start planning trips with destinations, activities, and budget.</p>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
              />
              <p className="mt-1 text-xs text-slate-500">{PASSWORD_RULE_TEXT}</p>
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-base">
              Register
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
