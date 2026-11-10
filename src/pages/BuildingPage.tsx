import { MessageSquarePlus } from 'lucide-react';
import { architectureNote, buildingFacts } from '@/content/building';
import { photography } from '@/content/photography';
import { Button } from '@/components/ui/button';
import { Card, PageHeading, SectionHeader } from '@/components/ui/page-heading';
import { FactRows, Pending } from '@/components/ui/misc';
import { SlotImage } from '@/components/ui/photo';
import { CtaCard, LocationCard, PropertyCards } from '@/components/sections/blocks';
import { useEnquiry } from '@/components/shell/enquiry-provider';

export default function BuildingPage() {
  const { openEnquiry } = useEnquiry();
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeading
        title="The building"
        description="A mixed-use address on Major Muriithi Street, Eastleigh: commercial office space and residential accommodation in one building."
        actions={
          <Button size="lg" onClick={() => openEnquiry()}>
            <MessageSquarePlus aria-hidden="true" /> Make an enquiry
          </Button>
        }
      />

      <div className="grid gap-4 md:gap-6 @4xl/main:grid-cols-[1fr_1.1fr]">
        <Card as="section" aria-labelledby="intro-title" className="flex flex-col p-6 md:p-8">
          <h2 id="intro-title" className="text-2xl font-semibold tracking-tight">
            Where Eastleigh works, and where it comes home.
          </h2>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              Hodo Souk is one building with two purposes. Its commercial spaces give businesses an address in one of
              Nairobi’s busiest trading districts. Its residential accommodation gives individuals and families a place
              to live in the same neighbourhood.
            </p>
            <p>
              Together they make a building that’s busy through the working day and lived in through the evening — part
              of Eastleigh’s rhythm from morning to night.
            </p>
            {architectureNote && <p className="text-foreground">{architectureNote}</p>}
          </div>
          <Pending file="src/content/building.ts → architectureNote" className="mt-5">
            A short, verified description of the architecture — materials, facade, notable features.
          </Pending>
        </Card>
        <Card className="p-2">
          <SlotImage slot={photography.nairobi} caption="Nairobi" sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-[16/10] h-full rounded-lg @4xl/main:aspect-auto @4xl/main:min-h-[20rem]" />
        </Card>
      </div>

      <section aria-labelledby="glance-title" className="flex flex-col gap-4">
        <SectionHeader id="glance-title" title="At a glance" description="The essentials. Further details are shared on enquiry." />
        <Card className="px-5 py-2">
          <FactRows facts={buildingFacts} />
        </Card>
        <Pending file="src/content/building.ts → buildingFacts">
          Floors, year completed, lifts, parking, security, power and water. Rows marked pending are hidden on the live
          site until management confirms them.
        </Pending>
      </section>

      <section aria-labelledby="uses-title" className="flex flex-col gap-4">
        <SectionHeader id="uses-title" title="Two uses, one address" />
        <PropertyCards headingLevel={3} />
      </section>

      <LocationCard />
      <CtaCard />
    </div>
  );
}
