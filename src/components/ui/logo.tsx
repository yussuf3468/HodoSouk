import { cn } from '@/lib/cn';

/**
 * The Hodo Souk mark: two piers, a lintel and one slab between them — an H,
 * or a building in section with one level for work and one for living.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <rect x="4" y="4.5" width="16" height="2" rx="0.5" fill="currentColor" />
      <rect x="5.75" y="6.5" width="2.75" height="13" rx="0.5" fill="currentColor" />
      <rect x="15.5" y="6.5" width="2.75" height="13" rx="0.5" fill="currentColor" />
      <rect x="8.5" y="12" width="7" height="1.75" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/** The square badge used in the property menu and mobile header. */
export function LogoBadge({ className }: { className?: string }) {
  return (
    <span className={cn('grid size-7 shrink-0 place-items-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900', className)}>
      <LogoMark className="size-[70%]" />
    </span>
  );
}
