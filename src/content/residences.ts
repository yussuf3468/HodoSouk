/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  RESIDENTIAL LIVING — ACCOMMODATION & SPECIFICATION
 * ─────────────────────────────────────────────────────────────────────────────
 *  While `residenceTypes` is empty, the Residential Living page shows an
 *  "accommodation on request" panel and the enquiry form offers a free-text
 *  field. Add types here and they appear as a schedule AND as options in the
 *  form's "preferred accommodation" select.
 *
 *  Example:
 *
 *    {
 *      id: 'two-bed',
 *      name: 'Two-bedroom apartment',
 *      bedrooms: 2,
 *      bathrooms: 1,
 *      size: { value: 80, unit: 'm²' },
 *      rent: { amount: 55000, currency: 'KES', per: 'month' },
 *      status: 'limited',
 *      description: 'Open-plan living and kitchen with a private balcony.',
 *    },
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Area, Availability, Fact, Money } from './types';

export interface ResidenceType {
  readonly id: string;
  readonly name: string;
  readonly bedrooms: number | null;
  readonly bathrooms: number | null;
  readonly size: Area | null;
  readonly rent: Money | null;
  readonly status: Availability;
  readonly description: string | null;
}

/** ◌ PENDING — accommodation types offered. */
export const residenceTypes: readonly ResidenceType[] = [];

/** ◌ PENDING — residential specification. `null` rows are hidden on the live site. */
export const residentialSpecifications: readonly Fact[] = [
  { label: 'Accommodation types', value: null },
  { label: 'Furnishing', value: null },
  { label: 'Tenancy terms', value: null },
  { label: 'Deposit', value: null },
  { label: 'Water supply', value: null },
  { label: 'Power backup', value: null },
  { label: 'Security', value: null },
  { label: 'Parking', value: null },
];
