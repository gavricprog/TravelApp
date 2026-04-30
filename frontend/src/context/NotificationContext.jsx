import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const notify = useCallback((type, message) => {
    setNotification({ id: Date.now(), type, message });
  }, []);

  const notifySuccess = useCallback((message) => notify('success', message), [notify]);
  const notifyError = useCallback((message) => notify('error', message), [notify]);

  useEffect(() => {
    const onApiError = (event) => {
      notifyError(event.detail?.message || 'Request failed.');
    };

    const onUnauthorized = (event) => {
      notifyError(event.detail?.message || 'Your session expired. Please log in again.');
    };

    window.addEventListener('api:error', onApiError);
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => {
      window.removeEventListener('api:error', onApiError);
      window.removeEventListener('auth:unauthorized', onUnauthorized);
    };
  }, [notifyError]);

  useEffect(() => {
    if (!notification) return undefined;
    const timeout = window.setTimeout(() => setNotification(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [notification]);

  const value = useMemo(
    () => ({
      notifySuccess,
      notifyError,
    }),
    [notifyError, notifySuccess]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification && (
        <div className="fixed right-4 top-4 z-[100] max-w-sm">
          <div
            className={`rounded-xl border px-4 py-3 text-sm shadow-soft ${
              notification.type === 'success'
                ? 'border-teal-200 bg-teal-50 text-teal-900'
                : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <span className="font-semibold">{notification.type === 'success' ? 'Success' : 'Error'}</span>
              <p>{notification.message}</p>
              <button
                type="button"
                className="ml-auto text-xs font-semibold uppercase tracking-wide opacity-70 hover:opacity-100"
                onClick={() => setNotification(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
