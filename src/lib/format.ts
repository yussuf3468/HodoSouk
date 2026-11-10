import type { Area, Availability, Money } from '@/content/types';

export function formatMoney(m: Money): string {
  const amount = new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 }).format(m.amount);
  const per = m.per ? ` / ${m.per}` : '';
  return `${m.currency} ${amount}${per}`;
}

export function formatArea(a: Area): string {
  return `${new Intl.NumberFormat('en-KE').format(a.value)} ${a.unit}`;
}

export const availabilityLabel: Record<Availability, string> = {
  available: 'Available',
  limited: 'Limited availability',
  reserved: 'Reserved',
  occupied: 'Currently let',
  'on-request': 'On request',
};

/** wa.me link with an optional pre-filled message. */
export function whatsappHref(e164: string, message?: string): string {
  const number = e164.replace(/[^\d]/g, '');
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
