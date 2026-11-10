/**
 * Generates public/og-image.jpg (1200×630) — the card shown when a Hodo Souk
 * link is shared on WhatsApp, Facebook, LinkedIn or X.
 *
 * Renders a small HTML page with the site's own fonts in a headless
 * Chromium-family browser (Edge or Chrome), then compresses it with sharp.
 *
 *   npm run og
 *   CHROME_PATH="/path/to/chrome" npm run og   # if the browser isn't found
 *
 * Re-run after real photography arrives if you want a photo in the card.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error('og: no Chromium-family browser found — set CHROME_PATH.');
  process.exit(1);
}

const font = (f) => pathToFileURL(join(ROOT, 'public/fonts', f)).href;
const mark = readFileSync(join(ROOT, 'public/favicon.svg'), 'utf8');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Manrope;src:url(${font('manrope-latin.woff2')});font-weight:200 800}
@font-face{font-family:Outfit;src:url(${font('outfit-latin.woff2')});font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#f4f4f5;font-family:Manrope;display:flex;padding:40px}
.card{flex:1;background:#fff;border-radius:22px;padding:64px;display:flex;flex-direction:column;justify-content:space-between}
.brand{display:flex;align-items:center;gap:16px;font-weight:600;font-size:30px;color:#171717}
.brand svg{width:56px;height:56px;border-radius:12px}
h1{font-size:84px;line-height:1.02;letter-spacing:-0.035em;font-weight:600;color:#171717}
h1 span{color:#8a8a8a}
.foot{display:flex;justify-content:space-between;align-items:flex-end}
p{font-family:Outfit;font-size:28px;color:#737373}
.pill{display:flex;gap:10px}
.pill span{font-size:22px;font-weight:600;padding:8px 16px;border-radius:12px}
.b{background:#eff6ff;color:#1d4ed8}.v{background:#f5f3ff;color:#6d28d9}
</style></head><body><div class="card">
<div class="brand">${mark}<span>Hodo Souk</span></div>
<h1>Space to work.<br><span>Room to live.</span></h1>
<div class="foot"><p>Major Muriithi Street · Eastleigh, Nairobi</p>
<div class="pill"><span class="b">Office spaces</span><span class="v">Residential</span></div></div>
</div></body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'hodo-og-'));
const page = join(dir, 'og.html');
const png = join(dir, 'og.png');
writeFileSync(page, html);
execFileSync(browser, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  `--screenshot=${png}`,
  pathToFileURL(page).href,
]);
await sharp(png).resize(1200, 630).jpeg({ quality: 86, mozjpeg: true }).toFile(join(ROOT, 'public/og-image.jpg'));
rmSync(dir, { recursive: true, force: true });
console.log('og: public/og-image.jpg written');
