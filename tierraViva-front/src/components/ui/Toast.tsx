'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (title: string, message?: string, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((title: string, message?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-4), { id, title, message, type }]); // Keep max 5

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const value = {
    toast: addToast,
    success: (title: string, message?: string) => addToast(title, message, 'success'),
    error: (title: string, message?: string) => addToast(title, message, 'error'),
    warning: (title: string, message?: string) => addToast(title, message, 'warning'),
    info: (title: string, message?: string) => addToast(title, message, 'info'),
  };

  const getStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/40 bg-slate-950/95 text-emerald-300 shadow-emerald-500/10';
      case 'error':
        return 'border-rose-500/40 bg-slate-950/95 text-rose-300 shadow-rose-500/10';
      case 'warning':
        return 'border-amber-500/40 bg-slate-950/95 text-amber-300 shadow-amber-500/10';
      default:
        return 'border-teal-500/40 bg-slate-950/95 text-teal-300 shadow-teal-500/10';
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 cursor-pointer ${getStyle(
              t.type
            )}`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold">
              {getIcon(t.type)}
            </span>
            <div className="flex-1 text-xs">
              <p className="font-bold text-slate-100">{t.title}</p>
              {t.message ? <p className="mt-0.5 opacity-90 leading-relaxed">{t.message}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside Provider
    return {
      toast: (title: string, msg?: string) => console.log(`[Toast] ${title}: ${msg}`),
      success: (title: string, msg?: string) => console.log(`[Toast Success] ${title}: ${msg}`),
      error: (title: string, msg?: string) => console.log(`[Toast Error] ${title}: ${msg}`),
      warning: (title: string, msg?: string) => console.log(`[Toast Warning] ${title}: ${msg}`),
      info: (title: string, msg?: string) => console.log(`[Toast Info] ${title}: ${msg}`),
    };
  }
  return context;
};
