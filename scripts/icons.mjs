/**
 * Raster icons from public/favicon.svg — run after changing the mark:
 *   npm run icons
 * Writes favicon-32.png, apple-touch-icon.png (180), icon-192.png, icon-512.png.
 */
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const svg = await readFile(join(PUBLIC, 'favicon.svg'));

for (const [name, size] of [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  await sharp(svg, { density: Math.ceil((72 * size) / 40) })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(PUBLIC, name));
  console.log(`icons: ${name}`);
}
