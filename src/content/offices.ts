/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  OFFICE SPACES — AVAILABILITY & SPECIFICATION
 * ─────────────────────────────────────────────────────────────────────────────
 *  While `units` is empty, the Office Spaces page shows an elegant
 *  "availability on request" panel. Add units here and a schedule of
 *  accommodation appears automatically.
 *
 *  Example unit (every field except id/name/status may be null):
 *
 *    {
 *      id: 'f1-04',
 *      name: 'Office F1-04',
 *      floor: 'First floor',
 *      size: { value: 450, unit: 'sq ft' },
 *      rent: { amount: 45000, currency: 'KES', per: 'month' },
 *      serviceCharge: null,
 *      status: 'available',
 *      note: 'Corner unit',
 *    },
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Area, Availability, Fact, Money } from './types';

export interface OfficeUnit {
  readonly id: string;
  readonly name: string;
  readonly floor: string | null;
  readonly size: Area | null;
  readonly rent: Money | null;
  readonly serviceCharge: Money | null;
  readonly status: Availability;
  readonly note: string | null;
}

/** ◌ PENDING — current office units. */
export const officeUnits: readonly OfficeUnit[] = [];

/** ◌ PENDING — commercial specification. `null` rows are hidden on the live site. */
export const officeSpecifications: readonly Fact[] = [
  { label: 'Unit sizes', value: null },
  { label: 'Floor levels', value: null },
  { label: 'Lease terms', value: null },
  { label: 'Service charge', value: null },
  { label: 'Internet connectivity', value: null },
  { label: 'Power backup', value: null },
  { label: 'Parking', value: null },
  { label: 'Access hours', value: null },
];

/**
 * Suggestions offered in the office enquiry form's "requirements" field.
 * These describe what the ENQUIRER needs — they make no claim about what
 * the building offers.
 */
export const officeRequirementOptions = [
  'A private office for 1–3 people',
  'An office for a team of 4–10',
  'Space for a team larger than 10',
  'Not sure yet — I would like advice',
] as const;
