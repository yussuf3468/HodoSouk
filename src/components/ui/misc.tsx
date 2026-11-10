import { useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { site } from '@/content/site';
import { showPlaceholders } from '@/lib/env';
import { cn } from '@/lib/cn';
import { Button } from './button';
import { toast } from './toaster';

/** Google Maps embed pinned to the building. Lazy-loaded. */
export function MapEmbed({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-muted', className)}>
      <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground" aria-hidden="true">
        Loading map…
      </div>
      <iframe
        title="Map showing Hodo Souk on Major Muriithi Street, Eastleigh, Nairobi"
        src={site.maps.embed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0 dark:opacity-90 dark:invert-[0.9] dark:hue-rotate-180"
      />
    </div>
  );
}

/** Copies text and confirms with a toast. */
export function CopyButton({ text, label, toastTitle }: { text: string; label: string; toastTitle: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          toast({ title: toastTitle, description: text });
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast({ title: 'Couldn’t copy', description: 'Select the text and copy it instead.', tone: 'error' });
        }
      }}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? 'Copied' : label}
    </Button>
  );
}

/**
 * Marks content still awaiting the building management. Shown in
 * development (and review builds with VITE_SHOW_PLACEHOLDERS); invisible on
 * the live site, where the surrounding component degrades gracefully.
 */
export function Pending({ children, file, className }: { children: ReactNode; file: string; className?: string }) {
  if (!showPlaceholders) return null;
  return (
    <div
      role="note"
      className={cn(
        'rounded-lg border border-dashed border-amber-400/70 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-900 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200',
        className,
      )}
    >
      <span className="font-semibold">Pending · </span>
      {children}
      <code className="mt-0.5 block text-[11px] opacity-75">{file}</code>
    </div>
  );
}

/** Label / value rows inside a card. Null values hide on the live site. */
export function FactRows({ facts }: { facts: ReadonlyArray<{ label: string; value: string | null }> }) {
  const rows = facts.filter((f) => f.value !== null || showPlaceholders);
  return (
    <dl className="divide-y divide-border">
      {rows.map((f) => (
        <div key={f.label} className="flex items-baseline justify-between gap-6 py-3">
          <dt className="text-sm text-muted-foreground">{f.label}</dt>
          <dd className="text-right text-sm font-medium tabular-nums">
            {f.value ?? (
              <span className="rounded-md bg-amber-50 px-1.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                Pending
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
