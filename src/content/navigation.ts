export interface NavItem {
  readonly label: string;
  readonly href: string;
}

/** Primary navigation — also drives the sitemap and the prerendered routes. */
export const primaryNav: readonly NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'The Building', href: '/the-building' },
  { label: 'Office Spaces', href: '/office-spaces' },
  { label: 'Residential Living', href: '/residential-living' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Location', href: '/location' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Enquiry deep links, kept separate so the two audiences never mix. Any page
 * URL with ?enquire=office|residential opens that form (see EnquiryProvider).
 */
export const enquiryLinks = {
  office: '/office-spaces?enquire=office',
  residential: '/residential-living?enquire=residential',
  general: '/contact',
} as const;
