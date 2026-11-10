import { Link } from 'react-router';
import { Mail, MessageCircle, Navigation, Phone } from 'lucide-react';
import { primaryNav } from '@/content/navigation';
import { addressLine, coordinatesLabel, site } from '@/content/site';
import type { Channels } from '@/content/types';
import { whatsappHref } from '@/lib/format';
import { LogoBadge } from '@/components/ui/logo';
import { useEnquiry } from './enquiry-provider';

function ChannelLinks({ channels }: { channels: Channels }) {
  const rows = [
    channels.phone && { href: `tel:${channels.phone.e164}`, icon: Phone, text: channels.phone.display },
    channels.email && { href: `mailto:${channels.email}`, icon: Mail, text: channels.email },
    channels.whatsapp && { href: whatsappHref(channels.whatsapp.e164), icon: MessageCircle, text: 'WhatsApp' },
  ].filter(Boolean) as Array<{ href: string; icon: typeof Phone; text: string }>;
  return (
    <>
      {rows.map((r) => (
        <li key={r.href}>
          <a href={r.href} className="inline-flex items-center gap-2 hover:text-foreground">
            <r.icon className="size-3.5" aria-hidden="true" />
            {r.text}
          </a>
        </li>
      ))}
    </>
  );
}

/** Website footer: who we are, where everything is, how to get in touch. */
export function SiteFooter() {
  const { openEnquiry } = useEnquiry();
  const heading = 'font-sans text-sm font-semibold text-foreground';
  const list = 'mt-3 flex flex-col gap-2 text-sm text-muted-foreground';

  return (
    <footer className="bg-card pb-[calc(env(safe-area-inset-bottom)+6.5rem)] lg:pb-0">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 md:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Hodo Souk — home">
            <LogoBadge className="size-8" />
            <span className="text-base font-semibold tracking-tight">{site.name}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">{site.description}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className={heading}>Explore</h2>
          <ul className={list}>
            {primaryNav.map((n) => (
              <li key={n.href}>
                <Link to={n.href} className="hover:text-foreground">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={heading}>Enquiries</h2>
          <ul className={list}>
            <li>
              <button type="button" onClick={() => openEnquiry('office')} className="hover:text-foreground">
                Office space enquiry
              </button>
            </li>
            <ChannelLinks channels={site.contact.office} />
            <li className="mt-2">
              <button type="button" onClick={() => openEnquiry('residential')} className="hover:text-foreground">
                Residential enquiry
              </button>
            </li>
            <ChannelLinks channels={site.contact.residential} />
          </ul>
        </div>

        <div>
          <h2 className={heading}>Location</h2>
          <address className="mt-3 text-sm text-muted-foreground not-italic">
            {site.name}
            <br />
            {addressLine}
            <br />
            {site.address.country}
          </address>
          <p className="mt-2 text-xs text-muted-foreground tabular-nums">
            {site.address.plusCode} · {coordinatesLabel}
          </p>
          <a
            href={site.maps.directions}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <Navigation className="size-3.5" aria-hidden="true" /> Get directions
          </a>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p className="font-sans" suppressHydrationWarning>
            © {new Date().getFullYear()} {site.legalName ?? site.name}. All rights reserved.
          </p>
          {site.social.length > 0 && (
            <ul className="flex gap-4">
              {site.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
