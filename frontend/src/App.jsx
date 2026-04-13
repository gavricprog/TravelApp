import { Navigate, Route, Routes, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TravelDetailPage from './pages/TravelDetailPage.jsx';
import SharedViewPage from './pages/SharedViewPage.jsx';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function Layout({ children }) {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const isShare = location.pathname.startsWith('/share/');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/75 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            to={isAuthenticated ? '/' : '/login'}
            className="group flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 no-underline"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-lg text-white shadow-glow">
              ✈
            </span>
            <span>
              Voyage
              <span className="block text-[10px] font-medium uppercase tracking-widest text-teal-600 group-hover:text-teal-700">
                Travel planner
              </span>
            </span>
          </Link>

          {!isShare && isAuthenticated && (
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <span className="hidden max-w-[200px] truncate text-sm text-slate-600 sm:inline">{user?.email}</span>
              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-teal-800 ring-1 ring-teal-200/80">
                {user?.role}
              </span>
              <button type="button" className="btn-secondary !py-2 !text-xs sm:!text-sm" onClick={logout}>
                Log out
              </button>
            </div>
          )}

          {!isShare && !isAuthenticated && (
            <nav className="flex items-center gap-2 text-sm font-medium">
              <Link to="/login" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-teal-600 px-3 py-2 text-white shadow-sm hover:bg-teal-700"
              >
                Sign up
              </Link>
            </nav>
          )}
        </div>
      </header>

      <main
        className={`mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 ${isAuthPage ? 'flex flex-col items-center justify-start pt-12 sm:pt-16' : ''}`}
      >
        {children}
      </main>

      <footer className="mt-auto border-t border-slate-200/80 bg-white/50 py-4 text-center text-xs text-slate-500 backdrop-blur-sm">
        Student project — plan trips, track budget, share read-only links.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/travel/:id"
          element={
            <PrivateRoute>
              <TravelDetailPage />
            </PrivateRoute>
          }
        />
        <Route path="/share/:token" element={<SharedViewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
