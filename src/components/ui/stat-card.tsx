import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { tones, type Tone } from './tone';

/**
 * Stat card: tone badge on top, the figure and a one-line caption below.
 * The whole card links to the page behind the figure.
 */
export function StatCard({
  tone,
  icon: Icon,
  label,
  value,
  caption,
  href,
  className,
}: {
  tone: Tone;
  icon: LucideIcon;
  label: string;
  value: string;
  caption: string;
  href: string;
  className?: string;
}) {
  const t = tones[tone];
  const external = href.startsWith('http');
  const classes = cn(
    'flex h-28 flex-col justify-between rounded-xl bg-white p-3 transition-shadow hover:shadow-md active:scale-[0.99] dark:bg-neutral-900',
    className,
  );
  const inner = (
    <>
      <span className={cn('inline-flex h-7 w-fit items-center gap-2 rounded-lg px-2 text-[14px] font-medium', t.badge)}>
        <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
        {label}
      </span>
      <span className="block min-w-0">
        <span className={cn('block truncate text-3xl leading-none font-semibold tabular-nums', t.value)}>{value}</span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">{caption}</span>
      </span>
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {inner}
    </a>
  ) : (
    <Link to={href} className={classes}>
      {inner}
    </Link>
  );
}
