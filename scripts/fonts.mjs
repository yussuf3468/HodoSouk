/**
 * Copies the variable font files out of @fontsource into /public/fonts under
 * short, stable names, so index.html can preload them and they cache for a
 * year (see vercel.json). Vite would otherwise fingerprint the file names.
 *
 *   Manrope — everything: headings, navigation, controls, numbers.
 *   Outfit  — paragraph text.
 *
 * Run after upgrading the font packages:  npm run fonts
 */
import { copyFile, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'fonts');

const FILES = [
  ['@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2', 'manrope-latin.woff2'],
  ['@fontsource-variable/manrope/files/manrope-latin-ext-wght-normal.woff2', 'manrope-latin-ext.woff2'],
  ['@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2', 'outfit-latin.woff2'],
  ['@fontsource-variable/outfit/files/outfit-latin-ext-wght-normal.woff2', 'outfit-latin-ext.woff2'],
];

await mkdir(OUT, { recursive: true });
// Remove fonts that are no longer part of the set.
const keep = new Set(FILES.map(([, to]) => to));
for (const f of await readdir(OUT)) if (!keep.has(f)) await rm(join(OUT, f));

for (const [from, to] of FILES) {
  await copyFile(join(ROOT, 'node_modules', from), join(OUT, to));
  console.log(`fonts: ${to}`);
}
