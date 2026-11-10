/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  HODO SOUK — SITE & CONTACT INFORMATION
 * ─────────────────────────────────────────────────────────────────────────────
 *  This is the single source of truth for the building's identity, address
 *  and contact details. Everything else on the site reads from here.
 *
 *  RULE: only enter information the building management has confirmed.
 *  Leave anything unconfirmed as `null` — the site is built to handle it.
 *
 *  ✔ VERIFIED   — confirmed from the supplied Google Maps listing
 *  ◌ PENDING    — awaiting the building management
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Channels } from './types';

/** The live domain. Set VITE_SITE_URL in the hosting dashboard (see .env.example). */
const rawSiteUrl = (import.meta.env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, '');

/** Decimal coordinates. ✔ Decoded from the Plus Code below (≈3 m precision). */
const GEO = { lat: -1.2739375, lng: 36.8472969 } as const;

export const site = {
  name: 'Hodo Souk',
  wordmark: 'HODO SOUK',
  /** Used in browser tabs and search results after each page title. */
  titleSuffix: 'Hodo Souk, Eastleigh',
  tagline: 'Space to Work. Room to Live.',
  description:
    'Hodo Souk is a mixed-use building on Major Muriithi Street, Eastleigh, Nairobi, offering commercial office space and residential accommodation.',
  /** `null` until VITE_SITE_URL is set — canonical URLs and the sitemap wait for it. */
  url: rawSiteUrl || null,
  locale: 'en_KE',

  /* ── Address ✔ ──────────────────────────────────────────────────────── */
  address: {
    building: 'Hodo Souk',
    street: 'Major Muriithi Street',
    area: 'Eastleigh',
    city: 'Nairobi',
    country: 'Kenya',
    countryCode: 'KE',
    /** ◌ PENDING — postal code / P.O. Box, if management wants one shown. */
    postalCode: null as string | null,
    /** ✔ Google Plus Code, from the supplied Maps listing. */
    plusCode: 'PRGW+CWF',
    plusCodeLocality: 'Nairobi',
    /**
     * ◌ TO CONFIRM — wayfinding landmark. Several tenants' own public listings
     * describe the building as "opposite Kulan Café". Confirm with management;
     * set to `null` to remove it from the site.
     */
    landmark: 'Opposite Kulan Café' as string | null,
  },

  geo: GEO,

  /* ── Maps ✔ ─────────────────────────────────────────────────────────── */
  maps: {
    /** The official Google Maps listing supplied for the building. */
    listing: 'https://www.google.com/maps/place/HODO+SOUK/data=!4m2!3m1!1s0x0:0x8a0b7c452d1060b3',
    /** Opens turn-by-turn directions in Google Maps (app on phones). */
    directions: `https://www.google.com/maps/dir/?api=1&destination=${GEO.lat}%2C${GEO.lng}`,
    /** Key-less embed, pinned to the building's coordinates. */
    embed: `https://maps.google.com/maps?q=${GEO.lat},${GEO.lng}&z=17&hl=en&output=embed`,
    /** The supplied Street View photosphere of the exterior. */
    streetView:
      'https://www.google.com/local/place/fid/0x182f17000c1cf4f7:0x8a0b7c452d1060b3/photosphere',
  },

  /* ── Contact ◌ PENDING ──────────────────────────────────────────────────
     Office and residential enquiries are kept on separate channels so they
     are never mixed together. Example of a filled-in entry:

       phone:    { e164: '+254700000000', display: '+254 700 000 000' },
       email:    'offices@example.co.ke',
       whatsapp: { e164: '+254700000000', display: '+254 700 000 000' },

     When a WhatsApp number is set, "Enquire on WhatsApp" buttons appear
     automatically on the relevant pages and forms.
  ──────────────────────────────────────────────────────────────────────── */
  contact: {
    office: { phone: null, email: null, whatsapp: null } as Channels,
    residential: { phone: null, email: null, whatsapp: null } as Channels,
  },

  /**
   * ◌ PENDING — management office / viewing hours. Example:
   *   [{ days: 'Monday – Friday', hours: '8:00 am – 5:00 pm' },
   *    { days: 'Saturday', hours: '9:00 am – 1:00 pm' }]
   */
  hours: null as ReadonlyArray<{ days: string; hours: string }> | null,

  /**
   * ◌ PENDING — official social accounts only. Example:
   *   [{ label: 'Instagram', href: 'https://instagram.com/…' }]
   */
  social: [] as ReadonlyArray<{ label: string; href: string }>,

  /** ◌ PENDING — legal / managing entity name for the copyright line. */
  legalName: null as string | null,
} as const;

export type Site = typeof site;

/** "Major Muriithi Street, Eastleigh, Nairobi" */
export const addressLine = `${site.address.street}, ${site.address.area}, ${site.address.city}`;

/** "1.2739° S, 36.8473° E" — for the architectural micro-typography. */
export const coordinatesLabel = `${Math.abs(GEO.lat).toFixed(4)}° ${GEO.lat < 0 ? 'S' : 'N'}, ${Math.abs(GEO.lng).toFixed(4)}° ${GEO.lng < 0 ? 'W' : 'E'}`;

export const hasChannel = (c: Channels) => Boolean(c.phone || c.email || c.whatsapp);
