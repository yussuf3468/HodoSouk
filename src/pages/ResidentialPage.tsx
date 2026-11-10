import { Link } from 'react-router';
import { ArrowRight, Briefcase, DoorClosed, Flame, Plus, Store } from 'lucide-react';
import { residentialSpecifications } from '@/content/residences';
import { photography } from '@/content/photography';
import { Button } from '@/components/ui/button';
import { Card, PageHeading, SectionHeader } from '@/components/ui/page-heading';
import { FactRows, Pending } from '@/components/ui/misc';
import { SlotImage } from '@/components/ui/photo';
import { tones } from '@/components/ui/tone';
import { cn } from '@/lib/cn';
import { showPlaceholders } from '@/lib/env';
import { LocationCard, ResidenceTypesSection } from '@/components/sections/blocks';
import { useEnquiry } from '@/components/shell/enquiry-provider';

/** Values — what a home should be. Not amenities, which remain unconfirmed. */
const values = [
  { word: 'Warmth', text: 'A place that feels like yours from the moment you arrive.', icon: Flame, tone: 'orange' as const },
  { word: 'Privacy', text: 'A door to close on a busy day, at your own pace.', icon: DoorClosed, tone: 'violet' as const },
  { word: 'Convenience', text: 'Eastleigh’s shops, services and community close at hand.', icon: Store, tone: 'green' as const },
];

export default function ResidentialPage() {
  const { openEnquiry } = useEnquiry();
  const hasSpecs = residentialSpecifications.some((s) => s.value !== null);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeading
        title="Comfort begins with the right place."
        description="Residential accommodation at Hodo Souk, in the heart of Eastleigh, Nairobi."
        actions={
          <Button size="lg" onClick={() => openEnquiry('residential')}>
            <Plus aria-hidden="true" /> Enquire about a home
          </Button>
        }
      />

      <div className="grid gap-2 rounded-xl bg-card p-2 @3xl/main:grid-cols-3 @3xl/main:grid-rows-2">
        <SlotImage slot={photography.livingSpace} sizes="(min-width: 1024px) 60vw, 100vw" priority className="aspect-[16/10] rounded-lg @3xl/main:col-span-2 @3xl/main:row-span-2 @3xl/main:aspect-auto @3xl/main:min-h-[26rem]" />
        <SlotImage slot={photography.bedroom} sizes="(min-width: 1024px) 30vw, 50vw" className="aspect-[16/10] rounded-lg @3xl/main:aspect-auto" />
        <SlotImage slot={photography.kitchen} sizes="(min-width: 1024px) 30vw, 50vw" className="aspect-[16/10] rounded-lg @3xl/main:aspect-auto" />
      </div>

      <Card as="section" aria-labelledby="home-title" className="p-6 md:p-8">
        <div className="grid gap-6 @4xl/main:grid-cols-[1fr_1.2fr]">
          <h2 id="home-title" className="text-2xl font-semibold tracking-tight">
            Home, in the heart of Eastleigh
          </h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              For individuals and families, Hodo Souk offers residential accommodation on Major Muriithi Street — a home
              at the centre of one of Nairobi’s most vibrant neighbourhoods.
            </p>
            <p>Step out into the life of Eastleigh: its trade, its markets, its community. Step back in to a space that’s your own.</p>
          </div>
        </div>
      </Card>

      <section aria-labelledby="values-title" className="flex flex-col gap-4">
        <SectionHeader id="values-title" title="What a home should be" />
        <ul className="grid gap-4 @3xl/main:grid-cols-3">
          {values.map((v) => (
            <li key={v.word} className="rounded-xl bg-card p-5">
              <span className={cn('grid size-10 place-items-center rounded-xl', tones[v.tone].badge)}>
                <v.icon className="size-[18px]" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{v.word}</h3>
              <p className="mt-1 text-[15px] text-muted-foreground">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <ResidenceTypesSection />

      {(hasSpecs || showPlaceholders) && (
        <section aria-labelledby="rspec-title" className="flex flex-col gap-4">
          <SectionHeader id="rspec-title" title="Specification" />
          <Card className="px-5 py-2">
            <FactRows facts={residentialSpecifications} />
          </Card>
          <Pending file="src/content/residences.ts → residentialSpecifications">
            Confirm each item with management. Unconfirmed rows stay hidden on the live site.
          </Pending>
        </section>
      )}

      <LocationCard />

      <Link to="/office-spaces" className="group flex items-center justify-between gap-4 rounded-xl bg-card p-5 transition-shadow hover:shadow-md">
        <span className="flex items-center gap-3">
          <span className={cn('grid size-10 place-items-center rounded-xl', tones.blue.badge)}>
            <Briefcase className="size-[18px]" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xs text-muted-foreground">Also at Hodo Souk</span>
            <span className="block text-[15px] font-semibold">Looking for office space?</span>
          </span>
        </span>
        <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
