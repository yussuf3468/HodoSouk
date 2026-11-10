import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { EASE_APP } from '@/lib/motion';
import { useMounted } from '@/lib/hooks';
import { cn } from '@/lib/cn';

/**
 * Toasts at top-centre, just below the iOS safe area. Say what happened, for
 * whom, with a description line and an optional follow-up action.
 */
export interface ToastInput {
  title: string;
  description?: string;
  tone?: 'success' | 'error' | 'info';
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastItem extends ToastInput {
  id: number;
}

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

export function toast(input: ToastInput): number {
  const id = nextId++;
  items = [...items.slice(-2), { id, tone: 'success', ...input }];
  emit();
  setTimeout(() => dismissToast(id), input.duration ?? 5000);
  return id;
}

const EMPTY: ToastItem[] = [];

export function Toaster() {
  const list = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => items,
    () => EMPTY,
  );

  const mounted = useMounted();
  if (!mounted) return null;

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[100] flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence initial={false}>
        {list.map((t) => {
          const Icon = t.tone === 'error' ? AlertCircle : t.tone === 'info' ? Info : CheckCircle2;
          return (
            <m.div
              key={t.id}
              layout={false}
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: EASE_APP } }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-popover px-4 py-3 text-popover-foreground shadow-lg ring-1 ring-foreground/10"
            >
              <Icon
                className={cn(
                  'mt-0.5 size-[18px] shrink-0',
                  t.tone === 'error' ? 'text-destructive' : t.tone === 'info' ? 'text-blue-500' : 'text-ocean-green',
                )}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm font-semibold">{t.title}</p>
                {t.description && <p className="mt-0.5 text-[13px] break-words text-muted-foreground">{t.description}</p>}
                {t.action && (
                  <button
                    type="button"
                    onClick={() => {
                      t.action!.onClick();
                      dismissToast(t.id);
                    }}
                    className="mt-1.5 text-[13px] font-semibold underline-offset-4 hover:underline"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="Dismiss"
                className="-mr-1 grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </m.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
