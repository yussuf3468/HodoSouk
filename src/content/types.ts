/**
 * Shared content types.
 *
 * A value of `null` always means "not yet supplied by the building
 * management". Components treat `null` as "hide this, or show a graceful
 * on-request message" — never as an invitation to make something up.
 */

/** A phone number. `e164` drives tel:/wa.me links; `display` is what visitors read. */
export interface Phone {
  /** International format with no spaces, e.g. "+254700000000". */
  readonly e164: string;
  /** Human-friendly format, e.g. "+254 700 000 000". */
  readonly display: string;
}

/** Contact channels for one enquiry pathway. */
export interface Channels {
  readonly phone: Phone | null;
  readonly email: string | null;
  /** Official WhatsApp Business number for this pathway. */
  readonly whatsapp: Phone | null;
}

export interface Money {
  readonly amount: number;
  readonly currency: 'KES' | 'USD';
  /** Billing period, if the figure is a rent or charge. */
  readonly per: 'month' | 'year' | null;
}

export interface Area {
  readonly value: number;
  readonly unit: 'sq ft' | 'm²';
}

export type Availability = 'available' | 'limited' | 'reserved' | 'occupied' | 'on-request';

/** A labelled fact. A `null` value is hidden on the live site. */
export interface Fact {
  readonly label: string;
  readonly value: string | null;
}

/** A photograph produced by `npm run images` (see media-originals/README.md). */
export interface PhotoRef {
  /** File basename in /media-originals, lower-case, without extension. */
  readonly slug: string;
  /** Describe what is genuinely in the frame. */
  readonly alt: string;
  /** CSS object-position for art-directed cropping, e.g. "50% 30%". */
  readonly position?: string;
}

/**
 * Licensed stock photography (Unsplash licence), shown ONLY until a real
 * photograph exists, and always tagged "Illustrative" on the page. Never used
 * for the building's exterior.
 */
export interface StockRef {
  /** Unsplash photo id — the part after `photo-` in the image URL. */
  readonly unsplash: string;
  readonly alt: string;
  readonly position?: string;
}

export type PhotoCategory = 'exterior' | 'commercial' | 'residential' | 'shared';

/** A place on the site where a photograph belongs. */
export interface PhotoSlot {
  /** The real photograph, once supplied. Always wins over `stock`. */
  readonly photo: PhotoRef | null;
  /** Illustrative stand-in until `photo` is supplied. Never for exteriors. */
  readonly stock: StockRef | null;
  readonly category: PhotoCategory;
  /** Short name of the view, e.g. "Street elevation". */
  readonly title: string;
  /** Shot brief for the photographer. */
  readonly brief: string;
}
