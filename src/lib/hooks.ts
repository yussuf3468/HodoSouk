import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';

/* ── Mounted ─────────────────────────────────────────────────────────────────
   False on the server and during hydration, true after. Portals render only
   once mounted, so the hydrated tree always matches the prerendered HTML. */
const noopSubscribe = () => () => {};
export function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/* ── Media queries ──────────────────────────────────────────────────────────
   useSyncExternalStore returns the SERVER snapshot during hydration and the
   real value straight after, so prerendered markup always matches. */
function useMedia(query: string, serverValue: boolean): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** Below the 768px breakpoint: phone layout (bottom bar, sheets). */
export const useIsMobile = () => useMedia('(max-width: 767.98px)', false);
export const usePrefersReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)', false);

/* ── Theme (.dark on <html>, remembered) ─────────────────────────────────── */
type Theme = 'light' | 'dark';
const themeListeners = new Set<() => void>();

export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore<Theme>(
    (cb) => {
      themeListeners.add(cb);
      return () => themeListeners.delete(cb);
    },
    () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'),
    () => 'light',
  );
  const toggle = useCallback(() => {
    const next = document.documentElement.classList.toggle('dark') ? 'dark' : 'light';
    try {
      localStorage.setItem('hodo-theme', next);
    } catch {
      /* storage unavailable — the choice lasts for this visit */
    }
    themeListeners.forEach((l) => l());
  }, []);
  return [theme, toggle];
}

/* ── Scroll lock for overlays (compensates for the scrollbar width) ───────── */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const { body, documentElement } = document;
    const bar = window.innerWidth - documentElement.clientWidth;
    const prev = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = 'hidden';
    if (bar > 0) body.style.paddingRight = `${bar}px`;
    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
    };
  }, [active]);
}

/* ── Focus trap ──────────────────────────────────────────────────────────── */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean): void {
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    restoreTo.current = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => {
      // Content (e.g. a search input) wins over the dialog's own close button.
      const first =
        node.querySelector<HTMLElement>('[data-autofocus]:not([data-close])') ??
        node.querySelector<HTMLElement>('[data-autofocus]') ??
        node;
      first.focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0]!;
      const lastEl = items[items.length - 1]!;
      if (e.shiftKey && (document.activeElement === firstEl || document.activeElement === node)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      restoreTo.current?.focus?.({ preventScroll: true });
    };
  }, [active, ref]);
}

/* ── Escape key ─────────────────────────────────────────────────────────── */
export function useEscape(active: boolean, onEscape: () => void): void {
  const cb = useRef(onEscape);
  useEffect(() => {
    cb.current = onEscape;
  });
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cb.current();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]);
}

/* ── Drag down to close (bottom sheets) ──────────────────────────────────── */
export function useDragToClose(onClose: () => void) {
  const [offset, setOffset] = useState(0);
  const start = useRef<{ y: number; t: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    // Only start from the sheet header / handle (data-drag-handle).
    if (!(e.target as HTMLElement).closest('[data-drag-handle]')) return;
    start.current = { y: e.clientY, t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    setOffset(Math.max(0, e.clientY - start.current.y));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dy = e.clientY - start.current.y;
    const velocity = dy / Math.max(1, performance.now() - start.current.t);
    start.current = null;
    if (dy > 120 || velocity > 0.6) onClose();
    setOffset(0);
  };

  return { offset, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp } };
}
