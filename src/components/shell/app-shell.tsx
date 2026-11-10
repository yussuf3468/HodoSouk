import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { useIsMobile } from '@/lib/hooks';
import { EASE_APP } from '@/lib/motion';
import { Seo } from '@/components/seo/Seo';
import { Toaster } from '@/components/ui/toaster';
import { CommandPaletteProvider } from './command-palette';
import { EnquiryProvider } from './enquiry-provider';
import { BottomBar } from './mobile';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { navIndex } from './nav';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/* ── Scroll: top of page on new navigation, remembered position on back ─── */
const positions = new Map<string, number>();
let firstMount = true;

function PageScroll() {
  const { key, hash } = useLocation();
  const type = useNavigationType();
  useIsoLayoutEffect(() => {
    if (firstMount) {
      firstMount = false;
      return;
    }
    if (type === 'POP' && positions.has(key)) {
      window.scrollTo(0, positions.get(key)!);
      return;
    }
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) target.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
    // Mount-only by design: runs once per page, after the transition swaps it in.
  }, []);
  return null;
}

function ScrollRecorder() {
  const { key, pathname, hash } = useLocation();
  useEffect(() => {
    const onScroll = () => positions.set(key, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [key]);
  // Same-page #hash links scroll smoothly.
  const prev = useRef(pathname);
  useEffect(() => {
    if (prev.current === pathname && hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prev.current = pathname;
  }, [pathname, hash, key]);
  return null;
}

/* ── Swipe right from the left edge to go back (phones) ─────────────────── */
function useSwipeBack() {
  const navigate = useNavigate();
  useEffect(() => {
    let start: { x: number; y: number } | null = null;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      start = t && t.clientX < 28 ? { x: t.clientX, y: t.clientY } : null;
    };
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!start || !t) return;
      const dx = t.clientX - start.x;
      const dy = Math.abs(t.clientY - start.y);
      start = null;
      if (dx > 80 && dy < 60 && window.history.length > 1) navigate(-1);
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [navigate]);
}

/* ── Page transitions: a quick fade on desktop; a slide on phones ───────── */
const pageVariants = {
  enter: ({ dir, mobile }: { dir: number; mobile: boolean }) =>
    mobile ? { opacity: 0.5, x: `${dir * 10}%` } : { opacity: 0, x: 0 },
  center: { opacity: 1, x: 0, transition: { duration: 0.24, ease: EASE_APP } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

/** The website frame: sticky header, page content, footer — and the phone bottom bar. */
export function AppShell({ children }: { children: (location: ReturnType<typeof useLocation>) => ReactNode }) {
  const location = useLocation();
  const mobile = useIsMobile();
  const index = navIndex(location.pathname);
  const prevIndex = useRef(index);
  const dir = index === prevIndex.current ? 0 : index > prevIndex.current ? 1 : -1;
  useEffect(() => {
    prevIndex.current = index;
  }, [index]);
  useSwipeBack();

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <EnquiryProvider>
          <CommandPaletteProvider>
            <a
              href="#main"
              className="fixed top-2 left-2 z-[110] -translate-y-20 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-transform focus:translate-y-0"
            >
              Skip to content
            </a>
            <Seo />
            <ScrollRecorder />

            <div className="flex min-h-svh flex-col bg-canvas">
              <SiteHeader />
              <main id="main" tabIndex={-1} className="flex-1 overflow-x-clip outline-none">
                <AnimatePresence mode="wait" initial={false} custom={{ dir, mobile }}>
                  <m.div
                    key={location.pathname}
                    custom={{ dir, mobile }}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="@container/main mx-auto w-full max-w-7xl px-4 pt-2 pb-12 md:px-6 md:pt-6 md:pb-16"
                  >
                    <PageScroll />
                    {children(location)}
                  </m.div>
                </AnimatePresence>
              </main>
              <SiteFooter />
              <BottomBar />
            </div>

            <Toaster />
          </CommandPaletteProvider>
        </EnquiryProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
