/**
 * Per-page metadata. Read by <Seo> in the browser AND by the prerender step,
 * so the HTML a search engine or WhatsApp link preview sees always matches.
 */
import { primaryNav } from './navigation';
import { site } from './site';

export interface PageMeta {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  /** Path to a 1200×630 share image in /public. */
  readonly image?: string;
  readonly noindex?: boolean;
}

export const DEFAULT_SHARE_IMAGE = '/og-image.jpg';

export const pageMeta: Record<string, PageMeta> = {
  '/': {
    path: '/',
    title: 'Hodo Souk — Commercial Office Spaces & Residential Accommodation in Eastleigh, Nairobi',
    description:
      'Hodo Souk is a mixed-use building on Major Muriithi Street, Eastleigh, Nairobi — offering commercial office space for businesses and residential accommodation for individuals and families.',
  },
  '/the-building': {
    path: '/the-building',
    title: 'The Building — A Mixed-Use Address on Major Muriithi Street',
    description:
      'Discover Hodo Souk: one building in the heart of Eastleigh, Nairobi, bringing commercial office space and residential accommodation together at a single address.',
  },
  '/office-spaces': {
    path: '/office-spaces',
    title: 'Office Spaces in Eastleigh, Nairobi',
    description:
      'Commercial office space at Hodo Souk on Major Muriithi Street, Eastleigh. Enquire about current availability, sizes and terms for your business.',
  },
  '/residential-living': {
    path: '/residential-living',
    title: 'Residential Accommodation in Eastleigh, Nairobi',
    description:
      'Residential accommodation at Hodo Souk, Eastleigh, Nairobi — a place to call home on Major Muriithi Street. Enquire about available homes and move-in dates.',
  },
  '/gallery': {
    path: '/gallery',
    title: 'Gallery',
    description:
      'Photographs of Hodo Souk, Eastleigh — the building exterior, commercial office spaces, residential accommodation and shared spaces.',
  },
  '/location': {
    path: '/location',
    title: 'Location & Directions — Major Muriithi Street, Eastleigh',
    description:
      'Find Hodo Souk on Major Muriithi Street, Eastleigh, Nairobi (Plus Code PRGW+CWF). Interactive map and directions with Google Maps.',
  },
  '/contact': {
    path: '/contact',
    title: 'Contact & Enquiries',
    description:
      'Enquire about office space or residential accommodation at Hodo Souk, Eastleigh, Nairobi. Separate enquiry pathways for businesses and residents.',
  },
};

export const notFoundMeta: PageMeta = {
  path: '/404',
  title: 'Page Not Found',
  description: 'The page you were looking for could not be found. Continue to Hodo Souk, Eastleigh, Nairobi.',
  noindex: true,
};

export const routePaths = primaryNav.map((item) => item.href);

export function metaFor(pathname: string): PageMeta {
  const clean = pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname;
  return pageMeta[clean] ?? notFoundMeta;
}

export function fullTitle(meta: PageMeta): string {
  return meta.title.startsWith(site.name) ? meta.title : `${meta.title} | ${site.titleSuffix}`;
}

export function absoluteUrl(path: string): string | null {
  if (!site.url) return null;
  return path === '/' ? `${site.url}/` : `${site.url}${path}`;
}

/**
 * Structured data — ONLY verified information. Contact details join
 * automatically once they are added to src/content/site.ts.
 */
export function structuredData(meta: PageMeta): object[] {
  const home = site.url ? `${site.url}/` : undefined;
  const placeId = site.url ? `${site.url}/#place` : undefined;

  const contactPoints = (
    [
      ['Office enquiries', site.contact.office],
      ['Residential enquiries', site.contact.residential],
    ] as const
  )
    .filter(([, c]) => c.phone || c.email)
    .map(([contactType, c]) => ({
      '@type': 'ContactPoint',
      contactType,
      ...(c.phone ? { telephone: c.phone.e164 } : {}),
      ...(c.email ? { email: c.email } : {}),
      areaServed: 'KE',
    }));

  const place = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    ...(placeId ? { '@id': placeId } : {}),
    name: site.name,
    description: site.description,
    ...(home ? { url: home } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${site.address.street}, ${site.address.area}`,
      addressLocality: site.address.city,
      addressCountry: site.address.countryCode,
      ...(site.address.postalCode ? { postalCode: site.address.postalCode } : {}),
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    hasMap: site.maps.listing,
    ...(contactPoints.length ? { contactPoint: contactPoints } : {}),
    ...(site.social.length ? { sameAs: site.social.map((s) => s.href) } : {}),
  };

  const out: object[] = [place];

  if (home) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.name,
      url: home,
      inLanguage: 'en-KE',
    });

    if (meta.path !== '/' && !meta.noindex) {
      out.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: home },
          {
            '@type': 'ListItem',
            position: 2,
            name: primaryNav.find((n) => n.href === meta.path)?.label ?? meta.title,
            item: absoluteUrl(meta.path),
          },
        ],
      });
    }
  }

  return out;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The complete <head> block for a page, as an HTML string (used when prerendering). */
export function headHtml(meta: PageMeta): string {
  const title = fullTitle(meta);
  const canonical = meta.noindex ? null : absoluteUrl(meta.path);
  const imagePath = meta.image ?? DEFAULT_SHARE_IMAGE;
  const image = absoluteUrl(imagePath) ?? imagePath;
  const robots = meta.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large';

  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    canonical && `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="${site.locale}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    canonical && `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(`${site.name} — ${site.tagline}`)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<meta name="geo.region" content="KE-110" />`,
    `<meta name="geo.placename" content="${esc(`${site.address.area}, ${site.address.city}`)}" />`,
    `<meta name="geo.position" content="${site.geo.lat};${site.geo.lng}" />`,
    `<meta name="ICBM" content="${site.geo.lat}, ${site.geo.lng}" />`,
    ...structuredData(meta).map(
      (data) =>
        `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`,
    ),
  ];

  return tags.filter(Boolean).join('\n    ');
}
