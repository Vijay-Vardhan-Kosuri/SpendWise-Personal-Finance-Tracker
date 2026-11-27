import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 4200);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const isError = toast.type === "error";
          const isInfo = toast.type === "info";
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-elevated transition-all ${
                isError
                  ? "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/90 dark:border-red-900 dark:text-red-100"
                  : isInfo
                  ? "bg-white border-gray-200 text-gray-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                  : "bg-forest-50 border-forest-200 text-forest-900 dark:bg-forest-900/90 dark:border-forest-700 dark:text-forest-50"
              }`}
            >
              {isError ? (
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" strokeWidth={1.75} />
              ) : isInfo ? (
                <Info className="h-5 w-5 shrink-0 text-forest-700 mt-0.5" strokeWidth={1.75} />
              ) : (
                <CheckCircle2
                  className="h-5 w-5 shrink-0 text-forest-600 mt-0.5"
                  strokeWidth={1.75}
                />
              )}
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
