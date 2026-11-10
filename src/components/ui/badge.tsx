import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { tones, type Tone } from './tone';

type Variant = 'default' | 'secondary' | 'outline' | 'destructive';

const variants: Record<Variant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  outline: 'border-border text-foreground',
  destructive: 'border-transparent bg-destructive/10 text-destructive',
};

export function Badge({
  children,
  variant = 'secondary',
  tone,
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1 rounded-4xl border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3',
        tone ? cn('border-transparent', tones[tone].badge) : variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Tiny coloured square + italic label — the card status. */
export function CardStatus({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground italic">
      <span aria-hidden="true" className="size-2 rounded-[2px]" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

/** The table status pill. */
export function StatusPill({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center gap-2 rounded-lg border border-border/70 px-2.5 text-[13px]">
      <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}
