import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { MoonStar, Settings2, Sun } from 'lucide-react';
import { site } from '@/content/site';
import { useTheme } from '@/lib/hooks';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { LogoBadge } from '@/components/ui/logo';
import { useEnquiry } from './enquiry-provider';
import { PropertySheet } from './mobile';
import { navItems } from './nav';

/**
 * The website header. Sticky, on the canvas colour with a soft blur once the
 * page scrolls. Page links on large screens; on phones and tablets the
 * floating bottom bar carries navigation instead.
 */
export function SiteHeader() {
  const { openEnquiry } = useEnquiry();
  const [theme, toggleTheme] = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [sheet, setSheet] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setSheet(false), [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 pt-[env(safe-area-inset-top)] transition-[background-color,box-shadow] duration-300',
        scrolled ? 'bg-canvas/85 shadow-[0_1px_0_0_var(--color-border)] backdrop-blur-xl' : 'bg-canvas',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 md:px-6">
        <Link to="/" aria-label="Hodo Souk — home" className="flex shrink-0 items-center gap-2.5">
          <LogoBadge className="size-8" />
          <span className="text-base font-semibold tracking-tight">{site.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {navItems.map((n) => (
              <li key={n.href}>
                <NavLink
                  to={n.href}
                  end={n.href === '/'}
                  className="flex h-9 items-center rounded-lg px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:bg-black/[0.04] hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-black/[0.06] aria-[current=page]:text-foreground dark:hover:bg-white/[0.06] dark:aria-[current=page]:bg-white/10"
                >
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="hidden size-9 place-items-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 lg:grid"
          >
            {theme === 'dark' ? <Sun className="size-[18px]" aria-hidden="true" /> : <MoonStar className="size-[18px]" aria-hidden="true" />}
          </button>
          <Button size="lg" className="hidden sm:inline-flex" onClick={() => openEnquiry()}>
            Enquire
          </Button>
          <button
            type="button"
            onClick={() => setSheet(true)}
            aria-label="About Hodo Souk and settings"
            className="grid size-11 place-items-center rounded-full text-muted-foreground active:bg-muted lg:hidden"
          >
            <Settings2 className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <PropertySheet open={sheet} onClose={() => setSheet(false)} />
    </header>
  );
}
