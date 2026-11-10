/**
 * Enquiries from anywhere on the site.
 *
 *   const { openEnquiry } = useEnquiry();
 *   openEnquiry('office')       → office form (dialog / bottom sheet)
 *   openEnquiry('residential')  → residential form
 *   openEnquiry()               → the Enquire sheet: choose a pathway
 *
 * Deep link: any URL with ?enquire=office|residential|choose opens it, then
 * the parameter is removed from the address bar.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { BedDouble, Briefcase, Copy, MessageCircle, Navigation, Phone } from 'lucide-react';
import { addressLine, site } from '@/content/site';
import type { EnquiryType } from '@/lib/enquiry-schema';
import { whatsappHref } from '@/lib/format';
import { cn } from '@/lib/cn';
import { ResponsiveDialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { EnquiryForm, type EnquiryFormHandle, type FormStatus } from '@/components/forms/enquiry-form';

interface Ctx {
  openEnquiry: (type?: EnquiryType) => void;
}

const EnquiryContext = createContext<Ctx>({ openEnquiry: () => {} });
export const useEnquiry = () => useContext(EnquiryContext);

type State = { kind: 'closed' } | { kind: 'choose' } | { kind: 'form'; type: EnquiryType };

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ kind: 'closed' });
  const { search, pathname, hash } = useLocation();
  const navigate = useNavigate();

  const openEnquiry = useCallback((type?: EnquiryType) => {
    setState(type ? { kind: 'form', type } : { kind: 'choose' });
  }, []);
  const close = useCallback(() => setState({ kind: 'closed' }), []);

  // ?enquire=… deep links (read after hydration, then removed).
  useEffect(() => {
    const params = new URLSearchParams(search);
    const v = params.get('enquire');
    if (!v) return;
    if (v === 'office' || v === 'residential') setState({ kind: 'form', type: v });
    else setState({ kind: 'choose' });
    params.delete('enquire');
    const rest = params.toString();
    navigate({ pathname, search: rest ? `?${rest}` : '', hash }, { replace: true });
  }, [search, pathname, hash, navigate]);

  const value = useMemo(() => ({ openEnquiry }), [openEnquiry]);

  return (
    <EnquiryContext.Provider value={value}>
      {children}
      <EnquireSheet open={state.kind === 'choose'} onClose={close} onChoose={(t) => setState({ kind: 'form', type: t })} />
      <EnquiryDialog type={state.kind === 'form' ? state.type : null} onClose={close} />
    </EnquiryContext.Provider>
  );
}

/* ── The form, in a dialog / sheet ──────────────────────────────────────── */
function EnquiryDialog({ type, onClose }: { type: EnquiryType | null; onClose: () => void }) {
  const form = useRef<EnquiryFormHandle>(null);
  const [status, setStatus] = useState<FormStatus>('idle');
  const lastType = useRef<EnquiryType>('office');
  if (type) lastType.current = type;
  const t = type ?? lastType.current;
  const busy = status === 'submitting';

  return (
    <ResponsiveDialog
      open={type !== null}
      onClose={onClose}
      title={t === 'office' ? 'Office space enquiry' : 'Residential enquiry'}
      description={
        t === 'office'
          ? 'Tell us what your business needs. We’ll share what’s available now.'
          : 'Tell us about your household and timing. We’ll share what’s available now.'
      }
      confirm={{ label: 'Send enquiry', onConfirm: () => form.current?.submit(), disabled: busy }}
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button size="lg" onClick={() => form.current?.submit()} disabled={busy}>
            {busy ? 'Sending…' : 'Send enquiry'}
          </Button>
        </>
      }
    >
      {type && <EnquiryForm key={t} ref={form} type={t} onSent={onClose} onStatus={setStatus} />}
      <div className="mt-5 md:hidden">
        <Button size="lg" className="h-11 w-full text-[15px]" onClick={() => form.current?.submit()} disabled={busy}>
          {busy ? 'Sending…' : 'Send enquiry'}
        </Button>
      </div>
    </ResponsiveDialog>
  );
}

/* ── The Enquire sheet: one row per way to get in touch ─────────────────── */
function EnquireSheet({
  open,
  onClose,
  onChoose,
}: {
  open: boolean;
  onClose: () => void;
  onChoose: (t: EnquiryType) => void;
}) {
  const office = site.contact.office;
  const res = site.contact.residential;
  const whatsapp = office.whatsapp ?? res.whatsapp;
  const phone = office.phone ?? res.phone;

  const rows: Array<{
    title: string;
    hint: string;
    tile: string;
    icon: typeof Briefcase;
    onClick?: () => void;
    href?: string;
  }> = [
    {
      title: 'Office space',
      hint: 'For businesses: tell us what you need, we’ll share what’s free',
      tile: 'bg-neutral-900 dark:bg-neutral-700',
      icon: Briefcase,
      onClick: () => onChoose('office'),
    },
    {
      title: 'Residential',
      hint: 'For individuals and families looking for a home',
      tile: 'bg-violet-500',
      icon: BedDouble,
      onClick: () => onChoose('residential'),
    },
    ...(whatsapp
      ? [
          {
            title: 'WhatsApp',
            hint: `Message us on ${whatsapp.display}`,
            tile: 'bg-green-600',
            icon: MessageCircle,
            href: whatsappHref(whatsapp.e164, 'Hello, I would like to enquire about Hodo Souk.'),
          },
        ]
      : []),
    ...(phone
      ? [{ title: 'Call', hint: phone.display, tile: 'bg-emerald-500', icon: Phone, href: `tel:${phone.e164}` }]
      : []),
    {
      title: 'Get directions',
      hint: 'Opens Google Maps to Major Muriithi Street',
      tile: 'bg-blue-500',
      icon: Navigation,
      href: site.maps.directions,
    },
    {
      title: 'Copy the address',
      hint: `${site.name}, ${addressLine}`,
      tile: 'bg-orange-500',
      icon: Copy,
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(`${site.name}, ${addressLine}, ${site.address.country}`);
          toast({ title: 'Address copied', description: `${site.name}, ${addressLine}` });
        } catch {
          toast({ title: 'Couldn’t copy', description: `${site.name}, ${addressLine}`, tone: 'error' });
        }
        onClose();
      },
    },
  ];

  const rowClass =
    'flex w-full items-center gap-4 rounded-xl p-2 text-left transition-colors outline-none hover:bg-muted focus-visible:bg-muted active:scale-[0.99]';

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Enquire" description="How can we help?">
      <ul className="-mx-2 flex flex-col gap-1">
        {rows.map((r) => {
          const Icon = r.icon;
          const inner = (
            <>
              <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl text-white', r.tile)}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[17px] font-semibold">{r.title}</span>
                <span className="block truncate text-[13px] text-muted-foreground">{r.hint}</span>
              </span>
            </>
          );
          return (
            <li key={r.title}>
              {r.href ? (
                <a
                  href={r.href}
                  className={rowClass}
                  onClick={onClose}
                  {...(r.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {inner}
                </a>
              ) : (
                <button type="button" className={rowClass} onClick={r.onClick}>
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </ResponsiveDialog>
  );
}
