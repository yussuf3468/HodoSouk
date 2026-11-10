import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'default' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';

// The border colour is owned by each variant (never set in `base`), so an
// outline button's border can't lose to a transparent default in the cascade.
const base =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-sm font-medium transition-all outline-none active:translate-y-px focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

const variants: Record<ButtonVariant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
  outline: 'border-border bg-background hover:bg-muted dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
  secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'border-transparent hover:bg-muted',
  destructive: 'border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20',
  link: 'border-transparent text-primary underline-offset-4 hover:underline',
};

const sizes: Record<ButtonSize, string> = {
  xs: 'h-6 gap-1 rounded-md px-2 text-xs [&_svg]:size-3',
  sm: 'h-7 gap-1.5 px-2.5 text-[13px]',
  default: 'h-8 px-2.5',
  lg: 'h-9 px-3',
  /** The one big button in an empty state. */
  xl: 'h-11 rounded-md px-6 text-[15px]',
  icon: 'size-8',
  'icon-sm': 'size-7',
  'icon-lg': 'size-9',
};

export function buttonVariants({
  variant = 'default',
  size = 'default',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type={type} className={buttonVariants({ variant, size, className })} {...props} />;
}

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

/** A link styled as a button. Internal paths use the router; web links open in a new tab. */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  'aria-label': ariaLabel,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
}) {
  const classes = buttonVariants({ variant, size, className });
  if (isExternal(href)) {
    const web = href.startsWith('http');
    return (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        {...(web ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={classes} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
