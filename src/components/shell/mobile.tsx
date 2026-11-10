import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { AnimatePresence, m } from 'framer-motion';
import { Mail, MessageCircle, MoonStar, MoreHorizontal, Navigation, Phone, Plus, Sun, X } from 'lucide-react';
import { addressLine, coordinatesLabel, site } from '@/content/site';
import type { Channels } from '@/content/types';
import { useTheme } from '@/lib/hooks';
import { whatsappHref } from '@/lib/format';
import { EASE_APP } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { LogoBadge } from '@/components/ui/logo';
import { ResponsiveDialog } from '@/components/ui/dialog';
import { useEnquiry } from './enquiry-provider';
import { bottomTabs, moreTiles } from './nav';

function ChannelRows({ label, channels }: { label: string; channels: Channels }) {
  const rows = [
    channels.phone && { href: `tel:${channels.phone.e164}`, icon: Phone, text: channels.phone.display },
    channels.email && { href: `mailto:${channels.email}`, icon: Mail, text: channels.email },
    channels.whatsapp && { href: whatsappHref(channels.whatsapp.e164), icon: MessageCircle, text: 'WhatsApp' },
  ].filter(Boolean) as Array<{ href: string; icon: typeof Phone; text: string }>;
  if (rows.length === 0) return null;
  return (
    <div>
      <p className="mb-1 px-1 font-sans text-xs font-medium text-muted-foreground">{label}</p>
      <div className="divide-y divide-border rounded-xl bg-muted/60">
        {rows.map((r) => (
          <a key={r.href} href={r.href} className="flex h-12 items-center gap-3 px-3 text-[15px]">
            <r.icon className="size-[18px] text-muted-foreground" aria-hidden="true" />
            {r.text}
          </a>
        ))}
      </div>
    </div>
  );
}

/** The property, its contacts and appearance — opened from the phone header. */
export function PropertySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [theme, toggleTheme] = useTheme();
  return (
    <ResponsiveDialog open={open} onClose={onClose} title={site.name}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
          <LogoBadge className="size-12 rounded-xl" />
          <div className="min-w-0">
            <p className="font-sans text-[15px] font-semibold">{site.name}</p>
            <p className="text-[13px] text-muted-foreground">{addressLine}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {site.address.plusCode} · {coordinatesLabel}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <a href={site.maps.directions} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-lg bg-muted text-[15px] font-medium">
            <Navigation className="size-4" aria-hidden="true" /> Directions
          </a>
          <button type="button" onClick={toggleTheme} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-muted text-[15px] font-medium">
            {theme === 'dark' ? <Sun className="size-4" aria-hidden="true" /> : <MoonStar className="size-4" aria-hidden="true" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
        <ChannelRows label="Office enquiries" channels={site.contact.office} />
        <ChannelRows label="Residential enquiries" channels={site.contact.residential} />
        {site.hours && (
          <div className="divide-y divide-border rounded-xl bg-muted/60 px-3">
            {site.hours.map((h) => (
              <div key={h.days} className="flex h-11 items-center justify-between text-[15px]">
                <span className="text-muted-foreground">{h.days}</span>
                <span>{h.hours}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ResponsiveDialog>
  );
}

/* ── Floating glass bottom bar (phones and tablets) ─────────────────────── */
export function BottomBar() {
  const { pathname } = useLocation();
  const { openEnquiry } = useEnquiry();
  const [theme, toggleTheme] = useTheme();
  const [more, setMore] = useState(false);
  const [tapped, setTapped] = useState<string | null>(null);

  useEffect(() => {
    setTapped(null);
    setMore(false);
  }, [pathname]);

  const current = tapped ?? pathname;
  const tabIndex = bottomTabs.findIndex((t) => t.href === current);
  // Pages reached from the More panel light the More tab.
  const activeIndex = more ? 4 : tabIndex === -1 ? 4 : tabIndex;

  const tile = 'flex flex-col items-center gap-1.5 text-[13px]';
  const tileBox = 'grid size-16 place-items-center rounded-2xl bg-black/5 dark:bg-white/10 [&_svg]:size-6';

  return (
    <>
      {/* The bottom of the screen fades into a blur behind the bar. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-28 bg-gradient-to-t from-canvas via-canvas/60 to-transparent backdrop-blur-md [mask-image:linear-gradient(to_top,black_40%,transparent)] lg:hidden"
      />

      {more && <div className="fixed inset-0 z-30 lg:hidden" onClick={() => setMore(false)} aria-hidden="true" />}

      <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 mx-auto flex max-w-xl items-end gap-2.5 lg:hidden">
        <nav aria-label="Primary" className="glass flex-1 overflow-hidden rounded-[30px] p-1.5">
          <AnimatePresence initial={false}>
            {more && (
              <m.div
                key="more"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1, transition: { duration: 0.32, ease: EASE_APP } }}
                exit={{ height: 0, opacity: 0, transition: { duration: 0.22, ease: EASE_APP } }}
                className="overflow-hidden"
              >
                <ul className="grid grid-cols-3 gap-y-4 px-2 pt-4 pb-5">
                  {moreTiles.map((t) => (
                    <li key={t.href}>
                      <Link to={t.href} className={tile} onClick={() => setTapped(t.href)}>
                        <span className={tileBox}>
                          <t.icon aria-hidden="true" strokeWidth={1.75} />
                        </span>
                        {t.short}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <a href={site.maps.directions} target="_blank" rel="noopener noreferrer" className={tile}>
                      <span className={tileBox}>
                        <Navigation aria-hidden="true" strokeWidth={1.75} />
                      </span>
                      Directions
                    </a>
                  </li>
                  <li>
                    <button type="button" className={cn(tile, 'w-full')} onClick={toggleTheme}>
                      <span className={tileBox}>
                        {theme === 'dark' ? <Sun aria-hidden="true" strokeWidth={1.75} /> : <MoonStar aria-hidden="true" strokeWidth={1.75} />}
                      </span>
                      {theme === 'dark' ? 'Light' : 'Dark'}
                    </button>
                  </li>
                </ul>
              </m.div>
            )}
          </AnimatePresence>

          <ul className="relative flex">
            {/* The single active pill, sliding between tabs. */}
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1/5 rounded-full bg-black/[0.07] transition-transform duration-[260ms] ease-app dark:bg-white/15"
              style={{ transform: `translateX(${activeIndex * 100}%)` }}
            />
            {bottomTabs.map((t, i) => (
              <li key={t.href} className="relative flex-1">
                <Link
                  to={t.href}
                  onClick={() => {
                    setTapped(t.href);
                    setMore(false);
                  }}
                  aria-current={pathname === t.href ? 'page' : undefined}
                  className={cn(
                    'flex h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
                    activeIndex === i ? 'text-foreground' : 'text-foreground/55',
                  )}
                >
                  <t.icon className="size-5" strokeWidth={activeIndex === i ? 2.25 : 1.75} aria-hidden="true" />
                  {t.short}
                </Link>
              </li>
            ))}
            <li className="relative flex-1">
              <button
                type="button"
                onClick={() => setMore((o) => !o)}
                aria-expanded={more}
                className={cn(
                  'flex h-12 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
                  activeIndex === 4 ? 'text-foreground' : 'text-foreground/55',
                )}
              >
                {more ? <X className="size-5" aria-hidden="true" /> : <MoreHorizontal className="size-5" aria-hidden="true" />}
                {more ? 'Close' : 'More'}
              </button>
            </li>
          </ul>
        </nav>

        {/* Round + : opens the Enquire sheet. Steps aside while More is open. */}
        <button
          type="button"
          onClick={() => openEnquiry()}
          aria-label="Make an enquiry"
          tabIndex={more ? -1 : 0}
          className={cn(
            'glass grid size-[3.75rem] shrink-0 place-items-center rounded-full transition-all duration-300 ease-app',
            more ? 'pointer-events-none w-0 scale-50 opacity-0' : 'scale-100 opacity-100',
          )}
        >
          <Plus className="size-6" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
