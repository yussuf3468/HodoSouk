import { CtaCard, FactsRow, HelpCard, HeroCard, LocationCard, PropertyCards } from '@/components/sections/blocks';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <HeroCard />
      <FactsRow />
      <PropertyCards />
      <HelpCard />
      <LocationCard />
      <CtaCard />
    </div>
  );
}
