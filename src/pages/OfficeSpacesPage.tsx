import { Link } from 'react-router';
import { ArrowRight, Briefcase, Building, Building2, HandHeart, Lightbulb, Plus, UserRound } from 'lucide-react';
import { officeSpecifications } from '@/content/offices';
import { photography } from '@/content/photography';
import { Button } from '@/components/ui/button';
import { Card, PageHeading, SectionHeader } from '@/components/ui/page-heading';
import { FactRows, Pending } from '@/components/ui/misc';
import { SlotImage } from '@/components/ui/photo';
import { tones } from '@/components/ui/tone';
import { cn } from '@/lib/cn';
import { showPlaceholders } from '@/lib/env';
import { LocationCard, OfficeUnitsSection } from '@/components/sections/blocks';
import { useEnquiry } from '@/components/shell/enquiry-provider';

const audiences = [
  { name: 'Business owners', text: 'A professional base to run and grow an established business.', icon: Briefcase, tone: 'blue' as const },
  { name: 'Entrepreneurs', text: 'A first proper address for a new venture.', icon: Lightbulb, tone: 'orange' as const },
  { name: 'Professionals', text: 'Room for a practice or consultancy, close to your clients.', icon: UserRound, tone: 'violet' as const },
  { name: 'Companies', text: 'Space for a team, a branch or a regional presence.', icon: Building, tone: 'teal' as const },
  { name: 'Organisations', text: 'A base for associations, NGOs and community groups.', icon: HandHeart, tone: 'green' as const },
];

export default function OfficeSpacesPage() {
  const { openEnquiry } = useEnquiry();
  const hasSpecs = officeSpecifications.some((s) => s.value !== null);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeading
        title="Your business deserves the right space."
        description="Commercial office space at Hodo Souk, on Major Muriithi Street in Eastleigh, Nairobi."
        actions={
          <Button size="lg" onClick={() => openEnquiry('office')}>
            <Plus aria-hidden="true" /> Enquire about office space
          </Button>
        }
      />

      <div className="grid gap-2 rounded-xl bg-card p-2 @3xl/main:grid-cols-3 @3xl/main:grid-rows-2">
        <SlotImage slot={photography.officeInterior} sizes="(min-width: 1024px) 60vw, 100vw" priority className="aspect-[16/10] rounded-lg @3xl/main:col-span-2 @3xl/main:row-span-2 @3xl/main:aspect-auto @3xl/main:min-h-[26rem]" />
        <SlotImage slot={photography.officeLight} sizes="(min-width: 1024px) 30vw, 50vw" className="aspect-[16/10] rounded-lg @3xl/main:aspect-auto" />
        <SlotImage slot={photography.officeMeeting} sizes="(min-width: 1024px) 30vw, 50vw" className="aspect-[16/10] rounded-lg @3xl/main:aspect-auto" />
      </div>

      <div className="grid gap-4 md:gap-6 @4xl/main:grid-cols-2">
        <Card as="section" aria-labelledby="offer-title" className="p-6 md:p-8">
          <h2 id="offer-title" className="text-2xl font-semibold tracking-tight">
            Business at the centre of Eastleigh
          </h2>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              Eastleigh is one of Nairobi’s great commercial districts, where trade happens at every scale from early
              morning. An office at Hodo Souk gives your business an address in the middle of it.
            </p>
            <p>
              Whether you’re opening a first office, adding a branch or moving a team, it’s a professional base on Major
              Muriithi Street — with residential accommodation in the same building, for those who’d like to live close
              to work.
            </p>
          </div>
        </Card>

        <Card as="section" aria-labelledby="who-title" className="p-2">
          <h2 id="who-title" className="px-4 pt-4 pb-2 text-lg font-semibold">
            Who it’s for
          </h2>
          <ul className="divide-y divide-border">
            {audiences.map((a) => (
              <li key={a.name} className="flex items-center gap-3 px-4 py-3">
                <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tones[a.tone].badge)}>
                  <a.icon className="size-[18px]" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold">{a.name}</span>
                  <span className="block text-[13px] text-muted-foreground">{a.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <OfficeUnitsSection />

      {(hasSpecs || showPlaceholders) && (
        <section aria-labelledby="spec-title" className="flex flex-col gap-4">
          <SectionHeader id="spec-title" title="Specification" />
          <Card className="px-5 py-2">
            <FactRows facts={officeSpecifications} />
          </Card>
          <Pending file="src/content/offices.ts → officeSpecifications">
            Confirm each item with management. Unconfirmed rows stay hidden on the live site.
          </Pending>
        </section>
      )}

      <LocationCard />

      <Link to="/residential-living" className="group flex items-center justify-between gap-4 rounded-xl bg-card p-5 transition-shadow hover:shadow-md">
        <span className="flex items-center gap-3">
          <span className={cn('grid size-10 place-items-center rounded-xl', tones.violet.badge)}>
            <Building2 className="size-[18px]" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xs text-muted-foreground">Also at Hodo Souk</span>
            <span className="block text-[15px] font-semibold">Looking for a place to live?</span>
          </span>
        </span>
        <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
