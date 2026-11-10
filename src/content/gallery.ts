/**
 * The gallery. REAL photographs of Hodo Souk only — a slot appears here the
 * moment its `photo` is set in src/content/photography.ts. Illustrative stock
 * is never shown in the gallery.
 */
import { photography, type PhotoSlotName } from './photography';
import type { PhotoCategory, PhotoSlot } from './types';

/** Folder-tab order and colours (All → blue, then the category palette). */
export const galleryCategories: ReadonlyArray<{ id: PhotoCategory | 'all'; label: string; color: string }> = [
  { id: 'all', label: 'All', color: '#3b82f6' },
  { id: 'exterior', label: 'Exterior', color: '#10b981' },
  { id: 'commercial', label: 'Commercial', color: '#f97316' },
  { id: 'residential', label: 'Residential', color: '#8b5cf6' },
  { id: 'shared', label: 'Shared spaces', color: '#ec4899' },
];

const order: readonly PhotoSlotName[] = [
  'heroExterior',
  'streetElevation',
  'entrance',
  'streetContext',
  'officeInterior',
  'officeLight',
  'officeMeeting',
  'commercialCorridor',
  'livingSpace',
  'livingSun',
  'bedroom',
  'kitchen',
  'homeDetail',
  'sharedEntrance',
  'sharedCirculation',
];

export interface GalleryItem extends PhotoSlot {
  readonly id: PhotoSlotName;
}

/** Every slot, in display order — including those still awaiting a photo (the shot list). */
export const allSlots: readonly GalleryItem[] = order.map((id) => ({ id, ...photography[id] }));

/** Only slots with a real photograph. */
export const galleryItems: readonly GalleryItem[] = allSlots.filter((item) => item.photo !== null);

export const categoryLabel = (c: PhotoCategory) => galleryCategories.find((x) => x.id === c)?.label ?? c;

export const hasRealPhotography = galleryItems.length > 0;
