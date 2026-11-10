/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PHOTO PIPELINE — npm run images
 * ─────────────────────────────────────────────────────────────────────────────
 *  Turns camera originals in /media-originals into web-ready photographs:
 *
 *    media-originals/exterior-street.jpg
 *      → public/images/exterior-street-{480,800,1200,1600,2000,2560}.webp
 *      → an entry in src/content/photo-manifest.json
 *          { width, height, tone, widths }
 *
 *  · Respects camera orientation (EXIF), then STRIPS all metadata — including
 *    GPS coordinates — so nothing private ships with the website.
 *  · Never upscales: an image only gets the widths it can genuinely fill.
 *  · `tone` is the photograph's average colour, painted behind it while it
 *    loads, so the page fades in tone-on-tone instead of flashing white.
 *  · Re-running is safe: unchanged originals are skipped.
 *
 *  File names become slugs: "Exterior Street.JPG" → "exterior-street".
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'media-originals');
const OUT = join(ROOT, 'public', 'images');
const MANIFEST = join(ROOT, 'src', 'content', 'photo-manifest.json');

const WIDTHS = [480, 800, 1200, 1600, 2000, 2560];
const QUALITY = 78;
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic', '.heif', '.avif']);

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const hex = (n) => Math.round(n).toString(16).padStart(2, '0');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else if (EXTENSIONS.has(extname(e.name).toLowerCase())) files.push(full);
  }
  return files;
}

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8').catch(() => '{}'));
await mkdir(OUT, { recursive: true });

const files = await walk(SRC);
if (files.length === 0) {
  console.log('images: no originals found in /media-originals — nothing to do.');
  process.exit(0);
}

let processed = 0;
for (const file of files) {
  const slug = slugify(file.split(/[\\/]/).pop());
  const { mtimeMs } = await stat(file);

  if (manifest[slug]?.source === Math.round(mtimeMs)) {
    console.log(`images: ${slug} (unchanged)`);
    continue;
  }

  const base = sharp(file, { failOn: 'error' }).rotate();
  const meta = await base.metadata();
  // After .rotate(), orientations 5–8 swap width and height.
  const swap = (meta.orientation ?? 1) >= 5;
  const width = swap ? meta.height : meta.width;
  const height = swap ? meta.width : meta.height;

  const widths = WIDTHS.filter((w) => w <= width);
  if (widths.length === 0 || widths[widths.length - 1] < width) widths.push(Math.min(width, 2560));
  const ladder = [...new Set(widths)].sort((a, b) => a - b);

  for (const w of ladder) {
    await sharp(file)
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 5, smartSubsample: true })
      .toFile(join(OUT, `${slug}-${w}.webp`));
  }

  const { channels } = await sharp(file).rotate().resize(64).stats();
  const tone = `#${hex(channels[0].mean)}${hex(channels[1].mean)}${hex(channels[2].mean)}`;

  manifest[slug] = { width, height, tone, widths: ladder, source: Math.round(mtimeMs) };
  processed += 1;
  console.log(`images: ${slug} → ${ladder.join(', ')}w · ${width}×${height} · ${tone}`);
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
console.log(`images: ${processed} processed, manifest updated.`);
