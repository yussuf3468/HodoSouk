/**
 * Client-side enquiry submission.
 *
 * INTEGRATION POINT
 * ─────────────────
 * Submissions POST JSON to VITE_ENQUIRY_ENDPOINT. The bundled Vercel function
 * (api/enquiry.ts) delivers them by email, routing office and residential
 * enquiries to separate inboxes. To use a CRM or another service instead,
 * point the endpoint at anything that accepts:
 *
 *   POST { enquiry: Enquiry, website: string, elapsedMs: number }
 *   → 200 { ok: true }                         delivered
 *   → 422 { ok: false, errors: FieldErrors }   validation failed
 *   → 503 { ok: false, error: 'not_configured' }
 *
 * Credentials NEVER live here — this file ships to every visitor's browser.
 *
 * If no endpoint is set, `submitEnquiry` returns `not-configured` and the form
 * says so honestly. It never pretends a message was sent.
 */
import { enquiryEndpoint } from './env';
import type { EnquiryEnvelope, FieldErrors } from './enquiry-schema';

export type SubmitResult =
  | { status: 'sent' }
  | { status: 'invalid'; errors: FieldErrors }
  | { status: 'not-configured' }
  | { status: 'error'; message: string };

const TIMEOUT_MS = 20_000;

export const enquiriesConnected = enquiryEndpoint !== null;

export async function submitEnquiry(envelope: EnquiryEnvelope): Promise<SubmitResult> {
  if (!enquiryEndpoint) return { status: 'not-configured' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(enquiryEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(envelope),
      signal: controller.signal,
    });

    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      errors?: FieldErrors;
      error?: string;
    };

    if (res.ok && body.ok) return { status: 'sent' };
    if (res.status === 422 && body.errors) return { status: 'invalid', errors: body.errors };
    if (res.status === 503) return { status: 'not-configured' };
    if (body.error === 'too_fast')
      return { status: 'error', message: 'That was very quick — please wait a moment and send again.' };

    return {
      status: 'error',
      message: 'We couldn’t send your enquiry just now. Please try again in a moment.',
    };
  } catch {
    return {
      status: 'error',
      message: controller.signal.aborted
        ? 'The connection timed out. Please check your connection and try again.'
        : 'We couldn’t reach the server. Please check your connection and try again.',
    };
  } finally {
    clearTimeout(timer);
  }
}
