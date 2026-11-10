import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Page heading: title, a muted one-line description, actions on the right. */
export function PageHeading({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Section header inside a page: title plus optional actions. */
export function SectionHeader({
  title,
  description,
  actions,
  id,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        <h2 id={id} className="text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Borderless white card on the canvas. */
export function Card({ children, className, as: As = 'div', id, ...rest }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article'; id?: string; 'aria-labelledby'?: string }) {
  return (
    <As id={id} className={cn('rounded-xl bg-card text-card-foreground', className)} {...rest}>
      {children}
    </As>
  );
}

/** The torn-ticket tear line. */
export function Tear({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('border-t border-dashed border-border/70', className)} />;
}
