# Hodo Souk — website

The public website for **Hodo Souk**, a mixed-use building on Major Muriithi
Street, Eastleigh, Nairobi, with commercial office space and residential
accommodation.

- **Stack:** React 19, TypeScript, Vite 7, Tailwind CSS 4 and Framer Motion.
- **Fonts:** Manrope and Outfit, self-hosted.
- **Output:** every page is prerendered to static HTML. That is good for search
  engines and WhatsApp link previews, and the site still reads if JavaScript fails.
- **Design:** a calm, neutral, almost monochrome system. White cards sit on a
  pale canvas, primary buttons are near-black, and dark mode has full parity.
  On phones, a floating glass bottom bar handles navigation and the + button
  opens the Enquire sheet.

```bash
npm install
npm run dev        # http://localhost:5173 (also runs api/enquiry.ts locally)
npm run build      # type-check → client build → prerender to dist/
npm run preview    # serve dist/ exactly as production would (404s included)
npm run check      # type-check + lint
```

---

## 1. Editing content — everything lives in `src/content/`

| File | What it holds |
|---|---|
| `site.ts` | Name, address, map links, **contact details**, hours, social links |
| `offices.ts` | **Office units** (availability table) and the office specification |
| `residences.ts` | **Accommodation types** (cards + form options) and specification |
| `building.ts` | "At a glance" facts and an optional architecture note |
| `photography.ts` | Every image slot on the site, and the **shot list** |
| `seo.ts` | Page titles and descriptions |

**Rule: only enter information the building management has confirmed.**
Anything left as `null` is hidden on the live site. Pages then fall back to
calm "on request" states, and nothing is made up.

Run `npm run dev` to see what's still missing: amber **Pending** markers show
each gap and the file that fills it. To show them on a review deployment,
set `VITE_SHOW_PLACEHOLDERS=true`.

### Contact details and WhatsApp

Fill in `site.contact.office` and `site.contact.residential` in `site.ts`.
The format is shown in the comment there. Once a WhatsApp number is set,
WhatsApp options appear automatically in the Enquire sheet, the footer, the
Contact page and the form's "not sent" fallback.

---

## 2. Photography

There is **no photography of Hodo Souk yet.** Until there is:

- **Interiors and atmosphere** (offices, homes, common areas, the Nairobi
  skyline) use licensed Unsplash stock. Each image is tagged **"Illustrative"**
  on the page.
- **Exterior slots have no stock.** Nothing on the site pretends to be the
  building.
- **The gallery shows real photographs only.** Until they exist, it shows a
  calm empty state.

To add real photographs, which replace the stock automatically:

1. Drop the originals into `media-originals/`. See its README.
2. Run `npm run images`. This creates responsive WebP files and strips GPS
   and other metadata.
3. In `src/content/photography.ts`, set the slot's
   `photo: { slug: 'file-name', alt: 'What is in the frame' }`.

Each slot's `brief` is the shot description for the photographer, so the
briefs together are the shot list. The most important photo is a landscape
exterior at dusk.

---

## 3. Enquiries — connect before launch

The office and residential forms open in a dialog on desktop and a bottom
sheet on phones. **Until enquiries are connected, the forms tell visitors
plainly that their message was not sent.** They never fake a success, and
the visitor can copy their message (or send it by WhatsApp or email once
those are set).

To connect them with the bundled Vercel function and [Resend](https://resend.com),
set these in **Vercel → Project → Settings → Environment Variables**:

```
VITE_ENQUIRY_ENDPOINT=/api/enquiry
RESEND_API_KEY=…                          # server-only
ENQUIRY_FROM=Hodo Souk <web@your-domain>  # a sender verified in Resend
ENQUIRY_TO_OFFICE=offices@…               # office enquiries go here
ENQUIRY_TO_RESIDENTIAL=homes@…            # residential enquiries go here
ENQUIRY_ALLOWED_ORIGIN=https://your-domain   # optional
```

Office and residential enquiries go to **separate inboxes**. The visitor's
email is set as reply-to.

**Spam protection:** a hidden honeypot field, a minimum time to complete the
form, server-side validation (the same rules as the browser) and a body-size
cap. For rate limiting, add a Vercel Firewall rule on `/api/enquiry`.

**Using a CRM instead:** point `VITE_ENQUIRY_ENDPOINT` at any endpoint that
accepts the JSON described in `src/lib/enquiry.ts`.

**Credentials:** no credentials are ever in the browser code. Only `VITE_`
variables reach the browser.

---

## 4. Deploying (Vercel)

1. Push to a Git repository and import it in Vercel. The framework preset is
   "Vite"; `vercel.json` already sets the build command and output directory.
2. Set `VITE_SITE_URL=https://your-domain` (no trailing slash). This enables
   canonical URLs, absolute share-image links and `sitemap.xml`. On Vercel it
   falls back to the production domain automatically.
3. Set the enquiry variables above.
4. Submit `https://your-domain/sitemap.xml` in Google Search Console, and
   claim or update the **Google Business Profile** listing for Hodo Souk.

Other static hosts work too. Serve `dist/`, map `/page` to `page.html`, and use
`404.html` for unknown routes. The enquiry function then needs porting to that
host's serverless format.

---

## 5. Useful scripts

| Script | Purpose |
|---|---|
| `npm run images` | Optimise photographs from `media-originals/` |
| `npm run og` | Regenerate `public/og-image.jpg` (the link-preview card) |
| `npm run icons` | Regenerate favicons from `public/favicon.svg` |
| `npm run fonts` | Re-copy font files after upgrading the font packages |

---

## 6. Checklist for the building management

- [ ] Photography: start with the exterior at dusk (see `photography.ts` for the shot list)
- [ ] Office and residential contact details: phone, email, WhatsApp
- [ ] Office units: names, floors, sizes, rent, service charge, status
- [ ] Residential types: bedrooms, sizes, rent, status
- [ ] Building facts: floors, year completed, lifts, parking, security, power, water
- [ ] Specifications for offices and homes
- [ ] Management or viewing hours
- [ ] Confirm the landmark "Opposite Kulan Café". This comes from tenants' public listings; set it to `null` to remove it
- [ ] Legal or managing entity name for the copyright line
- [ ] Official social media accounts, if any
- [ ] Domain name
