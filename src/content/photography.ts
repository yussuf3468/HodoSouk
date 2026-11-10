/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PHOTOGRAPHY — EVERY IMAGE ON THE SITE, AND THE SHOT LIST
 * ─────────────────────────────────────────────────────────────────────────────
 *  Each slot can hold:
 *    · photo — a REAL photograph of Hodo Souk (always shown when set);
 *    · stock — a licensed, ILLUSTRATIVE stand-in, tagged "Illustrative" on
 *              the page. Interiors and atmosphere only — exterior slots have
 *              no stock, so nothing ever pretends to be the building.
 *
 *  To add a real photograph:
 *    1. Put the original in /media-originals (e.g. exterior-street.jpg).
 *    2. Run `npm run images` — this creates optimised, responsive WebP files.
 *    3. Set the slot's `photo`:
 *         photo: { slug: 'exterior-street', alt: 'Hodo Souk seen from Major Muriithi Street' },
 *
 *  The gallery shows REAL photographs only. Each `brief` is the shot
 *  description for the photographer — together they are the shot list.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { PhotoSlot } from './types';

const slots = {
  /* ── Exterior — real photography only ───────────────────────────────── */
  heroExterior: {
    photo: null,
    stock: null,
    category: 'exterior',
    title: 'The building at dusk',
    brief: 'Full exterior from across Major Muriithi Street at blue hour, interior lights on. Landscape, shot level.',
  },
  streetElevation: {
    photo: null,
    stock: null,
    category: 'exterior',
    title: 'Street elevation',
    brief: 'The whole front of the building, square-on, in soft morning or late-afternoon light.',
  },
  entrance: {
    photo: null,
    stock: null,
    category: 'exterior',
    title: 'Main entrance',
    brief: 'The entrance at eye level, showing signage and the approach from the street.',
  },
  streetContext: {
    photo: null,
    stock: null,
    category: 'exterior',
    title: 'On Major Muriithi Street',
    brief: 'The building in its street, showing its place in the neighbourhood.',
  },

  /* ── Commercial ─────────────────────────────────────────────────────── */
  officeInterior: {
    photo: null,
    stock: {
      unsplash: '1497366811353-6870744d04b2',
      alt: 'A modern office with a long table beside floor-to-ceiling windows',
    },
    category: 'commercial',
    title: 'Office interior',
    brief: 'A representative office unit, cleared and well lit, photographed from the doorway.',
  },
  officeLight: {
    photo: null,
    stock: {
      unsplash: '1497215728101-856f4ea42174',
      alt: 'A desk beside tall windows with a laptop and potted palms',
    },
    category: 'commercial',
    title: 'Office with daylight',
    brief: 'An office showing its windows and natural light, mid-morning.',
  },
  officeMeeting: {
    photo: null,
    stock: {
      unsplash: '1462826303086-329426d1aef5',
      alt: 'A meeting room with a long table beside a wall of windows',
    },
    category: 'commercial',
    title: 'Meeting space',
    brief: 'Any meeting or boardroom space available to tenants.',
  },
  commercialCorridor: {
    photo: null,
    stock: {
      unsplash: '1497366216548-37526070297c',
      alt: 'A corridor lined with glass-fronted offices',
    },
    category: 'commercial',
    title: 'Commercial floor',
    brief: 'The corridor or landing that leads to the office units.',
  },

  /* ── Residential ────────────────────────────────────────────────────── */
  livingSpace: {
    photo: null,
    stock: {
      unsplash: '1618221195710-dd6b41faaea6',
      alt: 'A warm living room with a grey sofa, leather ottomans and an arc lamp',
    },
    category: 'residential',
    title: 'Living space',
    brief: 'The main living area of a representative residence, styled simply, in daylight.',
  },
  livingSun: {
    photo: null,
    stock: {
      unsplash: '1600210492486-724fe5c67fb0',
      alt: 'A sunlit living room with a leather sofa and a wall of framed pictures',
    },
    category: 'residential',
    title: 'Living room in daylight',
    brief: 'A second view of a living space, with the windows in frame.',
  },
  bedroom: {
    photo: null,
    stock: {
      unsplash: '1631049307264-da0ec9d70304',
      alt: 'A calm bedroom with a made bed, a bedside lamp and sheer curtains',
    },
    category: 'residential',
    title: 'Bedroom',
    brief: 'A bedroom, made up and uncluttered, with the window in frame.',
  },
  kitchen: {
    photo: null,
    stock: {
      unsplash: '1556912172-45b7abe8b7e1',
      alt: 'A white kitchen with a marble island and wooden stools',
    },
    category: 'residential',
    title: 'Kitchen',
    brief: 'The kitchen of a representative residence.',
  },
  homeDetail: {
    photo: null,
    stock: {
      unsplash: '1519710164239-da123dc03ef4',
      alt: 'A small round table and chair beside a plant in soft daylight',
    },
    category: 'residential',
    title: 'Home detail',
    brief: 'A quiet detail inside a home — a corner, a window seat, a table.',
  },

  /* ── Shared spaces ──────────────────────────────────────────────────── */
  sharedCirculation: {
    photo: null,
    stock: {
      unsplash: '1497366754035-f200968a6e72',
      alt: 'A hallway with black-framed glass partitions and a concrete floor',
    },
    category: 'shared',
    title: 'Common areas',
    brief: 'Stairs, landings or lift lobby — whichever serves the upper floors.',
  },
  sharedEntrance: {
    photo: null,
    stock: null,
    category: 'shared',
    title: 'Arrival',
    brief: 'The entrance hall or reception that tenants and residents arrive through.',
  },

  /* ── City context ───────────────────────────────────────────────────── */
  nairobi: {
    photo: null,
    stock: {
      unsplash: '1611348524140-53c9a25263d6',
      alt: 'The Nairobi skyline at golden hour',
    },
    category: 'exterior',
    title: 'Nairobi',
    brief: 'Optional: a view across Eastleigh or towards the city that includes the building.',
  },
} satisfies Record<string, PhotoSlot>;

export type PhotoSlotName = keyof typeof slots;

/** Widened so each slot is typed `PhotoSlot`, not its literal values. */
export const photography: Readonly<Record<PhotoSlotName, PhotoSlot>> = slots;
