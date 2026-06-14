'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  push: (kind: ToastKind, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) return { push: () => undefined };
  return ctx;
}

const TONE: Record<ToastKind, { color: string; Icon: typeof Info }> = {
  success: { color: '#34f5c5', Icon: CheckCircle2 },
  error: { color: '#ff5470', Icon: AlertTriangle },
  info: { color: '#22d3ee', Icon: Info },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = Date.now() + Math.random();
      setItems((list) => [...list, { id, kind, message }]);
      window.setTimeout(() => remove(id), 6000);
    },
    [remove],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[120] flex w-[min(92vw,360px)] flex-col gap-2"
        aria-live="polite"
        aria-atomic="false"
      >
        {items.map((t) => {
          const tone = TONE[t.kind];
          const Icon = tone.Icon;
          return (
            <div
              key={t.id}
              className="glass rise flex items-start gap-3 p-3"
              role="alert"
              style={{ borderColor: `${tone.color}55` }}
            >
              <Icon size={18} style={{ color: tone.color, flexShrink: 0, marginTop: 1 }} aria-hidden />
              <p className="flex-1 text-sm" style={{ color: 'var(--ink)' }}>
                {t.message}
              </p>
              <button
                type="button"
                onClick={() => remove(t.id)}
                aria-label="Dismiss"
                style={{ color: 'var(--muted)', minHeight: 0 }}
              >
                <X size={16} aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
