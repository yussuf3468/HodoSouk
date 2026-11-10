import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { BedDouble, Briefcase, Copy, CornerDownLeft, MoonStar, Navigation, Search, Sun } from 'lucide-react';
import { addressLine, site } from '@/content/site';
import { useTheme } from '@/lib/hooks';
import { cn } from '@/lib/cn';
import { ResponsiveDialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toaster';
import { useEnquiry } from './enquiry-provider';
import { navItems } from './nav';

/** Command search — ⌘K / Ctrl+K anywhere, or the search box in the top bar. */
const PaletteContext = createContext<{ openPalette: () => void }>({ openPalette: () => {} });
export const usePalette = () => useContext(PaletteContext);

interface Command {
  id: string;
  group: 'Pages' | 'Actions';
  label: string;
  hint?: string;
  icon: typeof Search;
  keywords?: string;
  run: () => void;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openPalette = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(() => ({ openPalette }), [openPalette]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </PaletteContext.Provider>
  );
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { openEnquiry } = useEnquiry();
  const [theme, toggleTheme] = useTheme();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const commands: Command[] = useMemo(
    () => [
      ...navItems.map((n) => ({
        id: n.href,
        group: 'Pages' as const,
        label: n.label,
        icon: n.icon,
        run: () => navigate(n.href),
      })),
      { id: 'enq-office', group: 'Actions', label: 'Enquire about office space', icon: Briefcase, keywords: 'business rent lease', run: () => openEnquiry('office') },
      { id: 'enq-res', group: 'Actions', label: 'Enquire about a home', icon: BedDouble, keywords: 'residential apartment rent live', run: () => openEnquiry('residential') },
      { id: 'directions', group: 'Actions', label: 'Get directions', hint: 'Google Maps', icon: Navigation, keywords: 'map route', run: () => window.open(site.maps.directions, '_blank', 'noopener') },
      {
        id: 'copy',
        group: 'Actions',
        label: 'Copy the address',
        hint: site.address.plusCode,
        icon: Copy,
        keywords: 'plus code location',
        run: () => {
          navigator.clipboard
            .writeText(`${site.name}, ${addressLine}, ${site.address.country}`)
            .then(() => toast({ title: 'Address copied', description: `${site.name}, ${addressLine}` }))
            .catch(() => undefined);
        },
      },
      {
        id: 'theme',
        group: 'Actions',
        label: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
        icon: theme === 'dark' ? Sun : MoonStar,
        keywords: 'theme appearance',
        run: toggleTheme,
      },
    ],
    [navigate, openEnquiry, theme, toggleTheme],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.keywords ?? ''} ${c.hint ?? ''}`.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);
  useEffect(() => setActive(0), [query]);

  const run = (c: Command) => {
    onClose();
    // Let the palette close before opening another dialog.
    setTimeout(c.run, 60);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      run(results[active]);
    }
  };

  let index = -1;
  const groups = (['Pages', 'Actions'] as const).map((g) => ({ g, items: results.filter((r) => r.group === g) }));

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Search" className="md:max-w-xl">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          data-autofocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search pages and actions…"
          aria-label="Search pages and actions"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
          className="h-10 w-full rounded-lg bg-muted pr-3 pl-9 text-[15px] outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <div id="palette-list" role="listbox" aria-label="Results" className="mt-3 flex max-h-[50svh] flex-col gap-3 overflow-y-auto">
        {results.length === 0 && <p className="px-2 py-8 text-center text-sm text-muted-foreground">Nothing matches “{query}”.</p>}
        {groups.map(
          ({ g, items }) =>
            items.length > 0 && (
              <div key={g}>
                <p className="px-2 pb-1 font-sans text-xs font-medium text-muted-foreground">{g}</p>
                {items.map((c) => {
                  index += 1;
                  const i = index;
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.id}
                      id={`cmd-${c.id}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseMove={() => setActive(i)}
                      onClick={() => run(c)}
                      className={cn(
                        'flex h-10 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm',
                        i === active ? 'bg-muted text-foreground' : 'text-foreground/90',
                      )}
                    >
                      <Icon className="size-[18px] text-muted-foreground" aria-hidden="true" />
                      <span className="flex-1 truncate">{c.label}</span>
                      {c.hint && <span className="text-xs text-muted-foreground">{c.hint}</span>}
                      {i === active && <CornerDownLeft className="size-3.5 text-muted-foreground" aria-hidden="true" />}
                    </div>
                  );
                })}
              </div>
            ),
        )}
      </div>
    </ResponsiveDialog>
  );
}
