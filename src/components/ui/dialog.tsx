import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useDragToClose, useEscape, useFocusTrap, useIsMobile, useMounted, useScrollLock } from '@/lib/hooks';
import { EASE_SHEET } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { Button } from './button';

/**
 * One component, two forms:
 *  · desktop — a centred dialog (zoom-in-95 + fade, 100ms) over a soft blur;
 *  · phone   — a bottom sheet rising from below (300ms, sheet easing) with a
 *              grab handle, a centred title, × and an optional ✓ action.
 *              Drag the header down to close.
 *
 * Rendered through a portal so page-transition transforms never trap it.
 */
export function ResponsiveDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  confirm,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Desktop footer (actions). */
  footer?: ReactNode;
  /** Phone ✓ action in the sheet header. */
  confirm?: { label: string; onConfirm: () => void; disabled?: boolean };
  className?: string;
}) {
  const isMobile = useIsMobile();
  const panel = useRef<HTMLDivElement>(null);
  useScrollLock(open);
  useFocusTrap(panel, open);
  useEscape(open, onClose);
  const drag = useDragToClose(onClose);
  const mounted = useMounted();

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90]">
          <m.div
            aria-hidden="true"
            className="absolute inset-0 bg-black/20 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: isMobile ? 0.3 : 0.1 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            onClick={onClose}
          />

          {isMobile ? (
            <m.div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              tabIndex={-1}
              className={cn(
                'absolute inset-x-0 bottom-0 flex max-h-[94dvh] flex-col rounded-t-[1.75rem] bg-popover text-popover-foreground outline-none',
                className,
              )}
              initial={{ y: '100%' }}
              animate={{ y: 0, transition: { duration: 0.3, ease: EASE_SHEET } }}
              exit={{ y: '100%', transition: { duration: 0.25, ease: EASE_SHEET } }}
              style={drag.offset ? { translate: `0 ${drag.offset}px` } : undefined}
              {...drag.handlers}
            >
              <div data-drag-handle className="shrink-0 touch-none px-4 pt-2 pb-3 select-none">
                <div aria-hidden="true" className="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/30" />
                <div className="mt-3 grid grid-cols-[4.75rem_1fr_4.75rem] items-center">
                  <span />
                  <h2 className="truncate text-center text-base font-semibold">{title}</h2>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close"
                      data-autofocus
                      data-close
                      className="grid size-9 place-items-center rounded-full bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                    {confirm && (
                      <button
                        type="button"
                        onClick={confirm.onConfirm}
                        disabled={confirm.disabled}
                        aria-label={confirm.label}
                        className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                      >
                        <Check className="size-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
                {description && <p className="mt-2 text-center text-[13px] text-muted-foreground">{description}</p>}
              </div>
              <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
                {children}
              </div>
            </m.div>
          ) : (
            <div className="pointer-events-none absolute inset-0 grid place-items-center p-4">
              <m.div
                ref={panel}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                tabIndex={-1}
                className={cn(
                  'scrollbar-pill pointer-events-auto relative max-h-[90svh] w-full max-w-lg overflow-y-auto rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 outline-none',
                  className,
                )}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.1 } }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
              >
                <div className="pr-10">
                  <h2 className="text-base font-semibold">{title}</h2>
                  {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="absolute top-3 right-3" data-autofocus data-close>
                  <X aria-hidden="true" />
                </Button>
                <div className="mt-4">{children}</div>
                {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
              </m.div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
