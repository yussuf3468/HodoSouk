import { BedDouble, Briefcase, Mail, MessageCircle, Phone } from 'lucide-react';
import { site, hasChannel } from '@/content/site';
import type { Channels } from '@/content/types';
import { whatsappHref } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Card, PageHeading } from '@/components/ui/page-heading';
import { Pending } from '@/components/ui/misc';
import { LocationCard } from '@/components/sections/blocks';
import { useEnquiry } from '@/components/shell/enquiry-provider';

function Channel({ channels, pathway }: { channels: Channels; pathway: 'office' | 'residential' }) {
  if (!hasChannel(channels)) {
    return (
      <Pending file={`src/content/site.ts → contact.${pathway}`} className="mt-4">
        Phone, email and WhatsApp for {pathway} enquiries — they appear here, in the Enquire sheet and as a WhatsApp
        option once added.
      </Pending>
    );
  }
  const rows = [
    channels.phone && { href: `tel:${channels.phone.e164}`, icon: Phone, text: channels.phone.display },
    channels.email && { href: `mailto:${channels.email}`, icon: Mail, text: channels.email },
    channels.whatsapp && { href: whatsappHref(channels.whatsapp.e164), icon: MessageCircle, text: `WhatsApp ${channels.whatsapp.display}` },
  ].filter(Boolean) as Array<{ href: string; icon: typeof Phone; text: string }>;
  return (
    <ul className="mt-4 divide-y divide-border rounded-lg bg-muted/50">
      {rows.map((r) => (
        <li key={r.href}>
          <a href={r.href} className="flex h-11 items-center gap-3 px-3 text-[15px] hover:text-foreground">
            <r.icon className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="truncate tabular-nums">{r.text}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function ContactPage() {
  const { openEnquiry } = useEnquiry();
  const paths = [
    {
      type: 'office' as const,
      title: 'Office space',
      text: 'For business owners, entrepreneurs, professionals, companies and organisations.',
      icon: Briefcase,
      tile: 'bg-neutral-900 dark:bg-neutral-700',
      cta: 'Start an office enquiry',
      channels: site.contact.office,
    },
    {
      type: 'residential' as const,
      title: 'Residential',
      text: 'For individuals and families looking for a home in Eastleigh.',
      icon: BedDouble,
      tile: 'bg-violet-500',
      cta: 'Start a residential enquiry',
      channels: site.contact.residential,
    },
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeading
        title="Contact"
        description="Office and residential enquiries are kept apart, so yours reaches the right people from the start."
      />

      <div className="grid gap-4 md:gap-6 @3xl/main:grid-cols-2">
        {paths.map((p) => (
          <Card as="section" key={p.type} aria-labelledby={`path-${p.type}`} className="flex flex-col p-5 md:p-6">
            <span className={cn('grid size-12 place-items-center rounded-2xl text-white', p.tile)}>
              <p.icon className="size-5" aria-hidden="true" />
            </span>
            <h2 id={`path-${p.type}`} className="mt-4 text-xl font-semibold tracking-tight">
              {p.title}
            </h2>
            <p className="mt-1 text-[15px] text-muted-foreground">{p.text}</p>
            <Channel channels={p.channels} pathway={p.type} />
            <div className="mt-auto pt-6">
              <Button size="xl" className="w-full sm:w-auto" onClick={() => openEnquiry(p.type)}>
                {p.cta}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {site.hours && (
        <Card as="section" aria-labelledby="hours-title" className="p-5">
          <h2 id="hours-title" className="text-lg font-semibold">
            Opening hours
          </h2>
          <dl className="mt-2 divide-y divide-border">
            {site.hours.map((h) => (
              <div key={h.days} className="flex justify-between py-2.5 text-[15px]">
                <dt className="text-muted-foreground">{h.days}</dt>
                <dd className="tabular-nums">{h.hours}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}
      <Pending file="src/content/site.ts → hours">Management office or viewing hours, if they should be published.</Pending>

      <LocationCard />
    </div>
  );
}
