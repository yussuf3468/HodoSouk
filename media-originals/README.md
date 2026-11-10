# Photography originals

Put the camera originals for the website in this folder. JPG, PNG, WebP,
TIFF and HEIC all work, and you can use sub-folders.

```bash
npm run images
```

That command creates optimised, responsive WebP files in `public/images/`
and records each photograph in `src/content/photo-manifest.json`. It also
strips all metadata, including GPS location, so nothing private is published.

Then open `src/content/photography.ts` and set the `photo` for the slot the
image belongs to, using the file name (lower-case, hyphens) as the `slug`:

```ts
heroExterior: {
  photo: { slug: 'exterior-dusk', alt: 'Hodo Souk at dusk, seen from Major Muriithi Street' },
  …
},
```

Write `alt` text that describes what is actually in the frame.

The originals themselves are **not** committed to git (see `.gitignore`).
They are large and may contain location data. Keep a copy somewhere safe.

## Shot list

Every photograph slot in `src/content/photography.ts` has a `brief`, and
together they make up the full shot list. The hero needs a **landscape**
exterior taken at dusk with the lights on, shot level and without tilt.
