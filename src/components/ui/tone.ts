/**
 * Semantic tones: a soft badge plus a strong value colour, light and dark.
 * Colour only ever MEANS something — a category, a status, a direction.
 */
export type Tone = 'blue' | 'violet' | 'sky' | 'green' | 'orange' | 'teal' | 'red' | 'neutral';

export const tones: Record<Tone, { badge: string; value: string; tile: string }> = {
  blue: {
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    value: 'text-blue-600 dark:text-blue-400',
    tile: 'bg-blue-500',
  },
  violet: {
    badge: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    value: 'text-violet-600 dark:text-violet-400',
    tile: 'bg-violet-500',
  },
  sky: {
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    value: 'text-sky-600 dark:text-sky-400',
    tile: 'bg-sky-500',
  },
  green: {
    badge: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
    value: 'text-green-600 dark:text-green-400',
    tile: 'bg-green-600',
  },
  orange: {
    badge: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    value: 'text-orange-600 dark:text-orange-400',
    tile: 'bg-orange-500',
  },
  teal: {
    badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
    value: 'text-teal-600 dark:text-teal-400',
    tile: 'bg-teal-500',
  },
  red: {
    badge: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
    value: 'text-red-600 dark:text-red-400',
    tile: 'bg-rose-500',
  },
  neutral: {
    badge: 'border border-border text-foreground',
    value: 'text-neutral-950 dark:text-neutral-50',
    tile: 'bg-neutral-900 dark:bg-neutral-700',
  },
};

/** Status colours, in folder-divider order. */
export const statusColor = {
  all: '#3b82f6',
  waiting: '#f59e0b',
  done: '#10b981',
  refused: '#ef4444',
  owed: '#f97316',
} as const;
