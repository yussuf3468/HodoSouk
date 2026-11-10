/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ENQUIRY SCHEMA — shared by the browser forms and api/enquiry.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *  One validator, used on both sides, so the rules can never drift. Pure
 *  TypeScript with no dependencies: it must run in the browser AND in a
 *  serverless function.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type EnquiryType = 'office' | 'residential';

export interface OfficeEnquiry {
  readonly type: 'office';
  readonly name: string;
  readonly company: string;
  readonly email: string;
  readonly phone: string;
  readonly requirements: string;
  readonly message: string;
}

export interface ResidentialEnquiry {
  readonly type: 'residential';
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly accommodation: string;
  readonly moveIn: string;
  readonly message: string;
}

export type Enquiry = OfficeEnquiry | ResidentialEnquiry;

/** Anti-spam fields sent alongside every enquiry. */
export interface EnquiryEnvelope {
  readonly enquiry: Enquiry;
  /** Honeypot — a field real visitors never see. Must be empty. */
  readonly website: string;
  /** ms since the form was first rendered. Bots submit instantly. */
  readonly elapsedMs: number;
}

export type FieldErrors = Record<string, string>;

export type ValidationResult =
  | { readonly ok: true; readonly data: Enquiry }
  | { readonly ok: false; readonly errors: FieldErrors };

/** Fastest plausible human completion time. */
export const MIN_FILL_MS = 2500;

const LIMITS = {
  name: 120,
  company: 160,
  email: 254,
  phone: 24,
  requirements: 600,
  accommodation: 200,
  message: 3000,
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS = /^\+?[\d\s\-().]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

function checkName(v: string, errors: FieldErrors) {
  if (!v) errors.name = 'Please enter your full name.';
  else if (v.length < 2) errors.name = 'Please enter your full name.';
  else if (v.length > LIMITS.name) errors.name = 'That name is too long.';
}

function checkEmail(v: string, errors: FieldErrors, required: boolean) {
  if (!v) {
    if (required) errors.email = 'Please enter your email address.';
    return;
  }
  if (v.length > LIMITS.email || !EMAIL.test(v)) errors.email = 'Please enter a valid email address.';
}

function checkPhone(v: string, errors: FieldErrors) {
  const digits = v.replace(/\D/g, '');
  if (!v) errors.phone = 'Please enter a phone number we can reach you on.';
  else if (!PHONE_CHARS.test(v) || digits.length < 9 || digits.length > 15 || v.length > LIMITS.phone)
    errors.phone = 'Please enter a valid phone number, e.g. 0712 345 678 or +254 712 345 678.';
}

function checkLength(field: keyof typeof LIMITS, v: string, errors: FieldErrors) {
  if (v.length > LIMITS[field]) errors[field] = `Please keep this under ${LIMITS[field]} characters.`;
}

/** Today's date as YYYY-MM-DD in Nairobi (UTC+3), independent of server timezone. */
function nairobiToday(): string {
  return new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
}

export function validateEnquiry(input: unknown): ValidationResult {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const type = raw.type;
  const errors: FieldErrors = {};

  if (type === 'office') {
    const data: OfficeEnquiry = {
      type,
      name: str(raw.name),
      company: str(raw.company),
      email: str(raw.email),
      phone: str(raw.phone),
      requirements: str(raw.requirements),
      message: str(raw.message),
    };
    checkName(data.name, errors);
    checkLength('company', data.company, errors);
    checkEmail(data.email, errors, true);
    checkPhone(data.phone, errors);
    checkLength('requirements', data.requirements, errors);
    checkLength('message', data.message, errors);
    return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
  }

  if (type === 'residential') {
    const data: ResidentialEnquiry = {
      type,
      name: str(raw.name),
      phone: str(raw.phone),
      email: str(raw.email),
      accommodation: str(raw.accommodation),
      moveIn: str(raw.moveIn),
      message: str(raw.message),
    };
    checkName(data.name, errors);
    checkPhone(data.phone, errors);
    checkEmail(data.email, errors, false);
    checkLength('accommodation', data.accommodation, errors);
    if (data.moveIn) {
      if (!DATE.test(data.moveIn) || Number.isNaN(Date.parse(data.moveIn)))
        errors.moveIn = 'Please choose a valid date.';
      else if (data.moveIn < nairobiToday()) errors.moveIn = 'Please choose a date from today onwards.';
    }
    checkLength('message', data.message, errors);
    return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
  }

  return { ok: false, errors: { type: 'Please choose an enquiry type.' } };
}

/** Human-readable field labels, used in emails and WhatsApp messages. */
export const fieldLabels: Record<string, string> = {
  name: 'Full name',
  company: 'Company',
  email: 'Email',
  phone: 'Phone',
  requirements: 'Office requirements',
  accommodation: 'Preferred accommodation',
  moveIn: 'Expected move-in date',
  message: 'Message',
};

/** Ordered [label, value] pairs for an enquiry, skipping empty fields. */
export function enquiryRows(e: Enquiry): Array<[string, string]> {
  const keys =
    e.type === 'office'
      ? (['name', 'company', 'email', 'phone', 'requirements', 'message'] as const)
      : (['name', 'phone', 'email', 'accommodation', 'moveIn', 'message'] as const);
  return keys
    .map((k) => [fieldLabels[k] ?? k, String((e as unknown as Record<string, string>)[k] ?? '')] as [string, string])
    .filter(([, v]) => v.length > 0);
}

/** Plain-text summary — for WhatsApp hand-off and copy-to-clipboard. */
export function enquiryText(e: Enquiry): string {
  const heading = e.type === 'office' ? 'Office space enquiry — Hodo Souk' : 'Residential enquiry — Hodo Souk';
  return [heading, '', ...enquiryRows(e).map(([k, v]) => `${k}: ${v}`)].join('\n');
}
