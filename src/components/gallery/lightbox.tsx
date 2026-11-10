import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { categoryLabel, type GalleryItem } from '@/content/gallery';
import { localSrcSet, photoEntry } from '@/components/ui/photo';
import { useEscape, useFocusTrap, useMounted, useScrollLock } from '@/lib/hooks';
import { EASE_APP } from '@/lib/motion';

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.32, ease: EASE_APP } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.18 } }),
};

/**
 * Full-screen photo viewer: ← / → and Esc on a keyboard, swipe on a phone,
 * focus kept inside while open, each change announced to screen readers.
 */
export function Lightbox({
  items,
  index,
  onClose,
  onIndexChange,
}: {
  items: readonly GalleryItem[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const open = index !== null;
  const panel = useRef<HTMLDivElement>(null);
  const [dir, setDir] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  useScrollLock(open);
  useFocusTrap(panel, open);
  useEscape(open, onClose);

  const go = useCallback(
    (d: number) => {
      if (index === null || items.length < 2) return;
      setDir(d);
      onIndexChange((index + d + items.length) % items.length);
    },
    [index, items.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, go]);

  const mounted = useMounted();
  if (!mounted) return null;
  const item = index !== null ? items[index] : undefined;
  const entry = item ? photoEntry(item.photo) : null;

  return createPortal(
    <AnimatePresence>
      {open && item && item.photo && entry && (
        <m.div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          tabIndex={-1}
          className="fixed inset-0 z-[95] flex flex-col bg-neutral-950 text-white outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (t) touch.current = { x: t.clientX, y: t.clientY };
          }}
          onTouchEnd={(e) => {
            const s = touch.current;
            const t = e.changedTouches[0];
            touch.current = null;
            if (!s || !t) return;
            const dx = t.clientX - s.x;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(t.clientY - s.y) * 1.4) go(dx < 0 ? 1 : -1);
          }}
        >
          <div className="flex h-14 shrink-0 items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
            <p className="text-sm text-white/70 tabular-nums">
              {index + 1} / {items.length} · {categoryLabel(item.category)}
            </p>
            <button type="button" onClick={onClose} data-autofocus aria-label="Close" className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <m.figure key={item.id} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" className="flex h-full w-full flex-col items-center justify-center">
                <img
                  src={`/images/${item.photo.slug}-${entry.widths[entry.widths.length - 1]}.webp`}
                  srcSet={localSrcSet(item.photo.slug, entry.widths)}
                  sizes="100vw"
                  alt={item.photo.alt}
                  width={entry.width}
                  height={entry.height}
                  draggable={false}
                  className="max-h-[calc(100svh-9rem)] w-auto max-w-full rounded-lg object-contain select-none"
                />
                <figcaption className="mt-3 text-sm text-white/80">{item.title}</figcaption>
              </m.figure>
            </AnimatePresence>
            {items.length > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 hidden size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:grid">
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 hidden size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:grid">
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
          <div className="h-[calc(env(safe-area-inset-bottom)+1.5rem)] shrink-0" />
          <p className="sr-only" aria-live="polite">
            Photo {index + 1} of {items.length}: {item.title}
          </p>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
