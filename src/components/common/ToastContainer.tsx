import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-200 bg-white/95 dark:border-emerald-500/30 dark:bg-zinc-900/95',
          info: 'border-sky-200 bg-white/95 dark:border-sky-500/30 dark:bg-zinc-900/95',
          warning: 'border-amber-200 bg-white/95 dark:border-amber-500/30 dark:bg-zinc-900/95',
          error: 'border-rose-200 bg-white/95 dark:border-rose-500/30 dark:bg-zinc-900/95',
        };

        const type = toast.type || 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borders[type]} shadow-xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
          >
            {icons[type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{toast.title}</h4>
              {toast.message && (
                <p className="mt-0.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
