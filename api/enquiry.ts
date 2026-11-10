/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  POST /api/enquiry — Vercel Function (Node.js runtime, Web signature)
 * ─────────────────────────────────────────────────────────────────────────────
 *  Delivers website enquiries by email through Resend (https://resend.com),
 *  routing OFFICE and RESIDENTIAL enquiries to separate inboxes.
 *
 *  Required environment variables (server-only — never VITE_ prefixed):
 *    RESEND_API_KEY           Resend API key
 *    ENQUIRY_FROM             Verified sender, e.g. "Hodo Souk <web@your-domain>"
 *    ENQUIRY_TO_OFFICE        Office enquiries inbox (comma-separate for several)
 *    ENQUIRY_TO_RESIDENTIAL   Residential enquiries inbox
 *  Optional:
 *    ENQUIRY_ALLOWED_ORIGIN   e.g. https://your-domain — rejects cross-site posts
 *
 *  Until these are set the function answers 503 `not_configured`, and the
 *  website tells the visitor plainly that the message was not delivered.
 *
 *  Spam protection: honeypot field, minimum fill time, strict server-side
 *  validation and a body-size cap. For rate limiting, add a Vercel Firewall
 *  rule on /api/enquiry (see README).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import {
  MIN_FILL_MS,
  enquiryRows,
  validateEnquiry,
  type Enquiry,
} from '../src/lib/enquiry-schema.js';

const MAX_BODY_BYTES = 16 * 1024;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const recipients = (v: string | undefined) =>
  (v ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

function compose(enquiry: Enquiry) {
  const isOffice = enquiry.type === 'office';
  const label = isOffice ? 'Office space enquiry' : 'Residential enquiry';
  const who = isOffice && enquiry.company ? `${enquiry.name} (${enquiry.company})` : enquiry.name;
  const rows = enquiryRows(enquiry);

  const text = [`${label} — via the Hodo Souk website`, '', ...rows.map(([k, v]) => `${k}: ${v}`)].join('\n');

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f7f5f0;font-family:Arial,Helvetica,sans-serif;color:#171a1c">
  <table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6dccc">
    <tr><td style="padding:24px 28px;background:#171a1c;color:#f7f5f0;font-size:12px;letter-spacing:3px;text-transform:uppercase">Hodo Souk · ${escapeHtml(label)}</td></tr>
    <tr><td style="padding:8px 28px 24px">
      <table role="presentation" width="100%" style="border-collapse:collapse">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:12px 0;border-bottom:1px solid #eee9e0;font-size:12px;color:#67645d;width:38%;vertical-align:top">${escapeHtml(k)}</td><td style="padding:12px 0;border-bottom:1px solid #eee9e0;font-size:15px;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
          )
          .join('')}
      </table>
      <p style="font-size:12px;color:#67645d;margin:20px 0 0">Sent from the enquiry form on the Hodo Souk website.${enquiry.email ? ' Reply to this email to respond directly.' : ''}</p>
    </td></tr>
  </table></body></html>`;

  return { subject: `${label} — ${who}`, text, html };
}

export async function POST(request: Request): Promise<Response> {
  /* ── Transport checks ─────────────────────────────────────────────────── */
  const allowedOrigin = process.env.ENQUIRY_ALLOWED_ORIGIN?.trim();
  const origin = request.headers.get('origin');
  if (allowedOrigin && origin && origin !== allowedOrigin) {
    return json(403, { ok: false, error: 'forbidden' });
  }

  if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
    return json(415, { ok: false, error: 'unsupported_media_type' });
  }

  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY_BYTES) return json(413, { ok: false, error: 'too_large' });

  let payload: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, error: 'too_large' });
    payload = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return json(400, { ok: false, error: 'bad_request' });
  }

  /* ── Spam checks ──────────────────────────────────────────────────────── */
  // Honeypot filled: almost certainly a bot. Answer as if accepted so the bot
  // learns nothing, but deliver nothing.
  if (typeof payload.website === 'string' && payload.website.trim() !== '') {
    return json(200, { ok: true });
  }
  const elapsed = Number(payload.elapsedMs);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) {
    return json(400, { ok: false, error: 'too_fast' });
  }

  /* ── Validation (the same rules the browser applied) ─────────────────── */
  const result = validateEnquiry(payload.enquiry);
  if (!result.ok) return json(422, { ok: false, errors: result.errors });
  const enquiry = result.data;

  /* ── Configuration ────────────────────────────────────────────────────── */
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.ENQUIRY_FROM?.trim();
  const to = recipients(
    enquiry.type === 'office' ? process.env.ENQUIRY_TO_OFFICE : process.env.ENQUIRY_TO_RESIDENTIAL,
  );
  if (!apiKey || !from || to.length === 0) {
    return json(503, { ok: false, error: 'not_configured' });
  }

  /* ── Delivery ─────────────────────────────────────────────────────────── */
  const { subject, text, html } = compose(enquiry);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
        html,
        ...(enquiry.email ? { reply_to: enquiry.email } : {}),
        tags: [{ name: 'enquiry_type', value: enquiry.type }],
      }),
    });
    if (!res.ok) {
      console.error('[enquiry] provider rejected message', res.status, await res.text().catch(() => ''));
      return json(502, { ok: false, error: 'delivery_failed' });
    }
  } catch (error) {
    console.error('[enquiry] provider unreachable', error);
    return json(502, { ok: false, error: 'delivery_failed' });
  }

  return json(200, { ok: true });
}
