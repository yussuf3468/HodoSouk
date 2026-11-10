import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TabDef<T extends string> {
  id: T;
  label: string;
  count?: number;
  color?: string;
}

/** Arrow / Home / End keyboard support shared by both tab styles. */
function useRovingKeys<T extends string>(tabs: TabDef<T>[], value: T, onChange: (v: T) => void) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onKeyDown = (e: KeyboardEvent) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === value);
    const n =
      e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    const next = tabs[n]!.id;
    onChange(next);
    refs.current[next]?.focus();
  };
  return { refs, onKeyDown };
}

/**
 * Folder tabs across the top of a card. Only the open tab is outlined, with
 * a 3px top edge in its colour and a count chip tinted with that colour.
 */
export function FolderTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  idBase,
}: {
  tabs: TabDef<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  idBase: string;
}) {
  const { refs, onKeyDown } = useRovingKeys(tabs, value, onChange);
  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="scrollbar-none -mb-px flex gap-1 overflow-x-auto">
      {tabs.map((t) => {
        const active = t.id === value;
        const color = t.color ?? '#3b82f6';
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            type="button"
            role="tab"
            id={`${idBase}-tab-${t.id}`}
            aria-selected={active}
            aria-controls={`${idBase}-panel`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={cn(
              'relative flex h-10 shrink-0 items-center gap-2 rounded-t-xl px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              active
                ? 'border border-b-0 border-border bg-card text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active && (
              <span aria-hidden="true" className="absolute inset-x-[-1px] top-[-1px] h-[3px] rounded-t-xl" style={{ backgroundColor: color }} />
            )}
            {t.label}
            {t.count !== undefined && (
              <span
                className={cn(
                  'min-w-5 rounded-md px-1.5 text-center text-xs font-semibold tabular-nums',
                  active ? '' : 'bg-muted text-muted-foreground',
                )}
                style={active ? { backgroundColor: `color-mix(in oklch, ${color} 16%, transparent)`, color } : undefined}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Underline tabs inside a card header, with round count badges. */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  idBase,
  trailing,
}: {
  tabs: TabDef<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  idBase: string;
  trailing?: ReactNode;
}) {
  const { refs, onKeyDown } = useRovingKeys(tabs, value, onChange);
  return (
    <div className="flex items-end justify-between gap-4 border-b border-border">
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="scrollbar-none flex gap-5 overflow-x-auto">
        {tabs.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`${idBase}-tab-${t.id}`}
              aria-selected={active}
              aria-controls={`${idBase}-panel`}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(t.id)}
              className={cn(
                '-mb-px flex shrink-0 items-center gap-2 border-b-2 pb-2.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:text-foreground',
                active ? 'border-primary font-semibold text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground tabular-nums">
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {trailing}
    </div>
  );
}
