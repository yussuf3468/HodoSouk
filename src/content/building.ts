/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE BUILDING — FACTS
 * ─────────────────────────────────────────────────────────────────────────────
 *  Shown as the "at a glance" ledger on the Home and The Building pages.
 *  Rows with `value: null` are hidden on the live site, and shown as pending
 *  markers in development so it is obvious what is still needed.
 *
 *  Fill these in ONLY with figures the building management has confirmed.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { site } from './site';
import type { Fact } from './types';

export const buildingFacts: readonly Fact[] = [
  /* ✔ Verified */
  { label: 'Building', value: site.name },
  { label: 'Use', value: 'Mixed-use — commercial & residential' },
  { label: 'Street', value: site.address.street },
  { label: 'District', value: `${site.address.area}, ${site.address.city}` },
  { label: 'Plus Code', value: `${site.address.plusCode} ${site.address.plusCodeLocality}` },

  /* ◌ Pending — management to confirm */
  { label: 'Floors', value: null },
  { label: 'Year completed', value: null },
  { label: 'Commercial floors', value: null },
  { label: 'Residential floors', value: null },
  { label: 'Lifts', value: null },
  { label: 'Parking', value: null },
  { label: 'Security', value: null },
  { label: 'Power backup', value: null },
  { label: 'Water supply', value: null },
];

/**
 * ◌ PENDING — a short, verified description of the architecture (materials,
 * facade, notable features), written or approved by management. When set, it
 * appears on The Building page beneath the introduction.
 */
export const architectureNote: string | null = null;
