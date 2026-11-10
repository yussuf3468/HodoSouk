/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Post-build prerenderer — real HTML for every page.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Renders each route with the server bundle (dist-ssr/entry-server.js) and
 *  writes dist/<route>.html containing:
 *    · the fully rendered page body — readable by search engines, link
 *      previews and visitors before (or without) JavaScript;
 *    · that page's own <head>: title, description, canonical, Open Graph,
 *      Twitter and JSON-LD structured data (from src/content/seo.ts).
 *  React then hydrates the existing markup instead of building it again.
 *
 *  Also writes 404.html, sitemap.xml and robots.txt, then removes dist-ssr.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SSR = join(ROOT, 'dist-ssr');

const server = await import(pathToFileURL(join(SSR, 'entry-server.js')).href);
const { render, headHtml, metaFor, notFoundMeta, routePaths, site } = server;

const template = await readFile(join(DIST, 'index.html'), 'utf8');
const HEAD = /<!--head:start-->[\s\S]*?<!--head:end-->/;
if (!HEAD.test(template) || !template.includes('<!--app-html-->')) {
  throw new Error('prerender: index.html is missing the head or app markers.');
}

function page(url, meta) {
  const body = render(url);
  return template.replace(HEAD, headHtml(meta)).replace('<!--app-html-->', body);
}

// Flat files (dist/gallery.html, not dist/gallery/index.html): the most
// portable layout — Vercel `cleanUrls`, Netlify and `vite preview` all serve
// /gallery from gallery.html without a trailing-slash redirect.
let count = 0;
for (const path of routePaths) {
  const html = page(path, metaFor(path));
  const file = path === '/' ? join(DIST, 'index.html') : join(DIST, `${path.slice(1)}.html`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html, 'utf8');
  count += 1;
}

await writeFile(join(DIST, '404.html'), page('/404', notFoundMeta), 'utf8');

/* ── sitemap.xml & robots.txt ────────────────────────────────────────────── */
const today = new Date().toISOString().slice(0, 10);
if (site.url) {
  const urls = routePaths
    .map((p) => {
      const loc = p === '/' ? `${site.url}/` : `${site.url}${p}`;
      const priority = p === '/' ? '1.0' : ['/office-spaces', '/residential-living'].includes(p) ? '0.9' : '0.7';
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');
  await writeFile(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    'utf8',
  );
} else {
  console.warn(
    '\n⚠  VITE_SITE_URL is not set — sitemap.xml was not generated and canonical URLs were omitted.\n' +
      '   Set it to the live domain (see .env.example) before launch.\n',
  );
}

await writeFile(
  join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /api/\n${site.url ? `\nSitemap: ${site.url}/sitemap.xml\n` : ''}`,
  'utf8',
);

await rm(SSR, { recursive: true, force: true });

console.log(`prerendered ${count} pages + 404.html${site.url ? ' + sitemap.xml' : ''} + robots.txt`);
