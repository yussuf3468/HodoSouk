/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ENQUIRY FORM — office or residential (rendered inside a dialog / sheet)
 * ─────────────────────────────────────────────────────────────────────────────
 *  · Same validation as the server (src/lib/enquiry-schema.ts), on blur and
 *    on submit; focus moves to the first problem.
 *  · Drafts are kept per browser tab (sessionStorage) until sent.
 *  · Spam: hidden honeypot + time-to-complete, checked server-side.
 *  · Truthful outcomes: when enquiries aren't connected, the visitor is told
 *    the message was NOT sent, and can copy it or send it another way.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, Copy, MessageCircle } from 'lucide-react';
import { site } from '@/content/site';
import { officeRequirementOptions } from '@/content/offices';
import { residenceTypes } from '@/content/residences';
import { enquiryText, validateEnquiry, type Enquiry, type EnquiryType, type FieldErrors } from '@/lib/enquiry-schema';
import { enquiriesConnected, submitEnquiry } from '@/lib/enquiry';
import { whatsappHref } from '@/lib/format';
import { cn } from '@/lib/cn';
import { toast } from '@/components/ui/toaster';

type Values = Record<string, string>;
export type FormStatus = 'idle' | 'submitting' | 'not-configured' | 'error';

const blank: Record<EnquiryType, Values> = {
  office: { name: '', company: '', email: '', phone: '', requirements: '', message: '' },
  residential: { name: '', phone: '', email: '', accommodation: '', moveIn: '', message: '' },
};

const order: Record<EnquiryType, string[]> = {
  office: ['name', 'company', 'email', 'phone', 'requirements', 'message'],
  residential: ['name', 'phone', 'email', 'accommodation', 'moveIn', 'message'],
};

const draftKey = (t: EnquiryType) => `hodo-draft-${t}`;

function loadDraft(type: EnquiryType): Values {
  try {
    const raw = sessionStorage.getItem(draftKey(type));
    if (raw) return { ...blank[type], ...(JSON.parse(raw) as Values) };
  } catch {
    /* no storage */
  }
  return blank[type];
}

export const inputClass =
  'h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 text-[15px] shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30';

function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-medium">
        {label}
        {optional && <span className="text-xs font-normal text-muted-foreground">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-[13px] text-destructive">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export interface EnquiryFormHandle {
  submit: () => void;
}

export const EnquiryForm = forwardRef<
  EnquiryFormHandle,
  { type: EnquiryType; onSent: () => void; onStatus?: (s: FormStatus) => void }
>(function EnquiryForm({ type, onSent, onStatus }, ref) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef(Date.now());
  const [values, setValues] = useState<Values>(() => (typeof window === 'undefined' ? blank[type] : loadDraft(type)));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatusState] = useState<FormStatus>('idle');
  const [message, setMessage] = useState('');
  const today = new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
  const channels = type === 'office' ? site.contact.office : site.contact.residential;

  const setStatus = (s: FormStatus) => {
    setStatusState(s);
    onStatus?.(s);
  };

  useImperativeHandle(ref, () => ({ submit: () => formRef.current?.requestSubmit() }));

  // Keep the draft for this browser tab.
  useEffect(() => {
    try {
      sessionStorage.setItem(draftKey(type), JSON.stringify(values));
    } catch {
      /* ignore */
    }
  }, [type, values]);

  const id = (name: string) => `${uid}-${name}`;
  const errorsFor = (v: Values) => {
    const r = validateEnquiry({ type, ...v });
    return r.ok ? {} : r.errors;
  };

  const update = (name: string, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) {
      const e = errorsFor(next);
      setErrors((prev) => {
        const c = { ...prev };
        if (e[name]) c[name] = e[name];
        else delete c[name];
        return c;
      });
    }
  };

  const blur = (name: string) => {
    setTouched((t) => ({ ...t, [name]: true }));
    const e = errorsFor(values);
    setErrors((prev) => {
      const c = { ...prev };
      if (e[name] && values[name]) c[name] = e[name];
      else if (!e[name]) delete c[name];
      return c;
    });
  };

  const hinted = new Set(type === 'office' ? ['message'] : residenceTypes.length === 0 ? ['accommodation', 'message'] : ['message']);

  const control = (name: string) => ({
    id: id(name),
    name,
    value: values[name] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => update(name, e.target.value),
    onBlur: () => blur(name),
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${id(name)}-error` : hinted.has(name) ? `${id(name)}-hint` : undefined,
  });

  const current = (): Enquiry | null => {
    const r = validateEnquiry({ type, ...values });
    return r.ok ? r.data : null;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status === 'submitting') return;
    const result = validateEnquiry({ type, ...values });
    setTouched(Object.fromEntries(order[type].map((f) => [f, true])));
    if (!result.ok) {
      setErrors(result.errors);
      const first = order[type].find((f) => result.errors[f]);
      if (first) document.getElementById(id(first))?.focus();
      return;
    }
    setErrors({});
    setStatus('submitting');
    const outcome = await submitEnquiry({
      enquiry: result.data,
      website: honeypot,
      elapsedMs: Date.now() - startedAt.current,
    });

    if (outcome.status === 'sent') {
      toast({
        title: `Enquiry sent for ${result.data.name}`,
        description: `${type === 'office' ? 'Office space' : 'Residential'} · we’ll reply${result.data.email ? ` to ${result.data.email}` : ` on ${result.data.phone}`} as soon as we can.`,
      });
      try {
        sessionStorage.removeItem(draftKey(type));
      } catch {
        /* ignore */
      }
      setValues(blank[type]);
      setStatus('idle');
      onSent();
    } else if (outcome.status === 'not-configured') {
      setStatus('not-configured');
      toast({ title: 'Your enquiry was not sent', description: 'Online enquiries are still being connected.', tone: 'error' });
    } else if (outcome.status === 'invalid') {
      setStatus('idle');
      setErrors(outcome.errors);
    } else {
      setStatus('error');
      setMessage(outcome.message);
    }
  };

  const enquiry = status === 'not-configured' || status === 'error' ? current() : null;

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} aria-busy={status === 'submitting'} className="relative">
      {!enquiriesConnected && status === 'idle' && (
        <p className="mb-4 rounded-lg bg-muted px-3 py-2 text-[13px] text-muted-foreground">
          Online enquiries are being set up. Until then, messages sent here are not delivered.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={id('name')} label="Full name" error={errors.name} className="sm:col-span-2">
          <input {...control('name')} className={inputClass} type="text" autoComplete="name" maxLength={120} />
        </Field>

        {type === 'office' ? (
          <>
            <Field id={id('company')} label="Company name" optional error={errors.company} className="sm:col-span-2">
              <input {...control('company')} className={inputClass} type="text" autoComplete="organization" maxLength={160} />
            </Field>
            <Field id={id('email')} label="Email address" error={errors.email}>
              <input {...control('email')} className={inputClass} type="email" autoComplete="email" inputMode="email" maxLength={254} />
            </Field>
            <Field id={id('phone')} label="Phone number" error={errors.phone}>
              <input {...control('phone')} className={inputClass} type="tel" autoComplete="tel" inputMode="tel" placeholder="+254 7…" maxLength={24} />
            </Field>
            <Field id={id('requirements')} label="Office requirements" optional error={errors.requirements} className="sm:col-span-2">
              <select {...control('requirements')} className={cn(inputClass, 'app-select')}>
                <option value="">Choose what fits best</option>
                {officeRequirementOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              id={id('message')}
              label="Additional message"
              optional
              hint="Team size, when you’d like to move in, anything that helps."
              error={errors.message}
              className="sm:col-span-2"
            >
              <textarea {...control('message')} className={cn(inputClass, 'h-auto min-h-24 py-2')} rows={3} maxLength={3000} />
            </Field>
          </>
        ) : (
          <>
            <Field id={id('phone')} label="Phone number" error={errors.phone}>
              <input {...control('phone')} className={inputClass} type="tel" autoComplete="tel" inputMode="tel" placeholder="+254 7…" maxLength={24} />
            </Field>
            <Field id={id('email')} label="Email" optional error={errors.email}>
              <input {...control('email')} className={inputClass} type="email" autoComplete="email" inputMode="email" maxLength={254} />
            </Field>
            <Field
              id={id('accommodation')}
              label="Accommodation type"
              optional
              hint={residenceTypes.length === 0 ? 'For example, bedrooms needed or who will live with you.' : undefined}
              error={errors.accommodation}
            >
              {residenceTypes.length > 0 ? (
                <select {...control('accommodation')} className={cn(inputClass, 'app-select')}>
                  <option value="">Choose a type</option>
                  {residenceTypes.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                  <option value="Not sure yet">Not sure yet</option>
                </select>
              ) : (
                <input {...control('accommodation')} className={inputClass} type="text" maxLength={200} />
              )}
            </Field>
            <Field id={id('moveIn')} label="Move-in date" optional error={errors.moveIn}>
              <input {...control('moveIn')} className={inputClass} type="date" min={today} />
            </Field>
            <Field
              id={id('message')}
              label="Additional requirements"
              optional
              hint="Anything that matters to you in a home."
              error={errors.message}
              className="sm:col-span-2"
            >
              <textarea {...control('message')} className={cn(inputClass, 'h-auto min-h-24 py-2')} rows={3} maxLength={3000} />
            </Field>
          </>
        )}
      </div>

      {/* Honeypot — invisible to people. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id('website')}>Website</label>
        <input id={id('website')} name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      {(status === 'not-configured' || status === 'error') && (
        <div role="alert" className="mt-4 rounded-lg bg-destructive/10 px-3 py-3 text-[13px]">
          <p className="font-sans font-semibold text-destructive">
            {status === 'not-configured' ? 'Your enquiry has not been sent.' : 'Your enquiry could not be sent.'}
          </p>
          <p className="mt-1 text-foreground/80">
            {status === 'not-configured'
              ? 'Online enquiries are still being connected, so this form can’t deliver messages yet. Your details are still here.'
              : message}
          </p>
          {enquiry && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {channels.whatsapp && (
                <a
                  href={whatsappHref(channels.whatsapp.e164, enquiryText(enquiry))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-card px-2.5 font-medium"
                >
                  <MessageCircle className="size-3.5" aria-hidden="true" /> Send on WhatsApp
                </a>
              )}
              {channels.email && (
                <a
                  href={`mailto:${channels.email}?subject=${encodeURIComponent(type === 'office' ? 'Office space enquiry' : 'Residential enquiry')}&body=${encodeURIComponent(enquiryText(enquiry))}`}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-card px-2.5 font-medium"
                >
                  Send by email
                </a>
              )}
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(enquiryText(enquiry));
                    toast({ title: 'Enquiry copied', description: 'Paste it into a message or email.' });
                  } catch {
                    /* ignore */
                  }
                }}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-card px-2.5 font-medium"
              >
                <Copy className="size-3.5" aria-hidden="true" /> Copy my enquiry
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  );
});
