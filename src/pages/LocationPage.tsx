import { MapPin, Navigation } from 'lucide-react';
import { photography } from '@/content/photography';
import { site } from '@/content/site';
import { ButtonLink } from '@/components/ui/button';
import { Card, PageHeading } from '@/components/ui/page-heading';
import { MapEmbed, Pending } from '@/components/ui/misc';
import { SlotImage } from '@/components/ui/photo';
import { AddressCard, CtaCard } from '@/components/sections/blocks';

export default function LocationPage() {
  const plus = `${site.address.plusCode} ${site.address.plusCodeLocality}`;
  const steps = [
    `Search “Hodo Souk” in Google Maps, or enter the Plus Code ${plus}.`,
    `Head for ${site.address.street} in ${site.address.area}.`,
    site.address.landmark ? `Look for the building ${site.address.landmark.toLowerCase()}.` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeading
        title="Location"
        description="Hodo Souk is on Major Muriithi Street in Eastleigh, Nairobi."
        actions={
          <>
            <ButtonLink href={site.maps.listing} variant="outline" size="lg">
              <MapPin aria-hidden="true" /> Google Maps
            </ButtonLink>
            <ButtonLink href={site.maps.directions} size="lg">
              <Navigation aria-hidden="true" /> Get directions
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 md:gap-6 @4xl/main:grid-cols-[1.6fr_1fr]">
        <Card className="p-2">
          <MapEmbed className="aspect-[4/5] w-full sm:aspect-[4/3] @4xl/main:aspect-auto @4xl/main:h-full @4xl/main:min-h-[32rem]" />
        </Card>
        <div className="flex flex-col gap-4 md:gap-6">
          <AddressCard />
          <Card as="section" aria-labelledby="getting-title" className="p-5">
            <h2 id="getting-title" className="text-lg font-semibold">
              Getting here
            </h2>
            <ol className="mt-3 flex flex-col gap-3">
              {steps.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold tabular-nums">{i + 1}</span>
                  <span className="font-body text-[15px] text-muted-foreground">{s}</span>
                </li>
              ))}
            </ol>
            <Pending file="src/content/site.ts" className="mt-4">
              Arrival notes from management: parking, drop-off, public transport, accessibility and visiting hours.
            </Pending>
          </Card>
        </div>
      </div>

      <Card as="section" aria-labelledby="hood-title" className="grid gap-2 p-2 @3xl/main:grid-cols-[1fr_1.3fr]">
        <div className="p-4 md:p-6">
          <h2 id="hood-title" className="text-2xl font-semibold tracking-tight">
            Eastleigh, Nairobi
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Eastleigh is one of Nairobi’s most active commercial neighbourhoods, known across the region for its trade.
            Hodo Souk is part of that streetscape on Major Muriithi Street — an address for business, and a place to live.
          </p>
        </div>
        <SlotImage slot={photography.nairobi} caption="Nairobi" sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[16/10] rounded-lg" />
      </Card>

      <CtaCard />
    </div>
  );
}
