import { useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  BedDouble,
  Briefcase,
  Building2,
  LocateFixed,
  MapPin,
  MessageSquarePlus,
  Navigation,
  PartyPopper,
} from 'lucide-react';
import { officeUnits, type OfficeUnit } from '@/content/offices';
import { residenceTypes, type ResidenceType } from '@/content/residences';
import { photography } from '@/content/photography';
import { addressLine, coordinatesLabel, site } from '@/content/site';
import type { Availability } from '@/content/types';
import { availabilityLabel, formatArea, formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Badge, CardStatus, StatusPill } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, SectionHeader, Tear } from '@/components/ui/page-heading';
import { SlotImage } from '@/components/ui/photo';
import { StatCard } from '@/components/ui/stat-card';
import { FolderTabs, UnderlineTabs, type TabDef } from '@/components/ui/tabs';
import { MapEmbed, CopyButton } from '@/components/ui/misc';
import { toast } from '@/components/ui/toaster';
import { useEnquiry } from '@/components/shell/enquiry-provider';

/* ── Home hero ──────────────────────────────────────────────────────────── */
export function HeroCard() {
  const { openEnquiry } = useEnquiry();
  return (
    <Card as="section" aria-labelledby="hero-title" className="overflow-hidden">
      <div className="grid @3xl/main:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col justify-between gap-10 p-6 md:p-10">
          <div>
            <Badge variant="outline" className="h-6 gap-1.5 px-2.5">
              <MapPin aria-hidden="true" /> Eastleigh · Nairobi
            </Badge>
            <h1 id="hero-title" className="mt-6 text-[2.5rem] leading-[1.05] font-semibold tracking-tight md:text-5xl @5xl/main:text-6xl">
              Space to work.
              <br />
              <span className="text-muted-foreground">Room to live.</span>
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted-foreground">
              Discover Hodo Souk — a destination for business and residential living in the heart of Eastleigh,
              Nairobi.
            </p>
          </div>
          <div className="flex flex-col gap-2 xs:flex-row">
            <ButtonLink href="/the-building" size="lg" className="h-11 px-5 text-[15px]">
              Explore Hodo Souk <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <Button variant="outline" size="lg" className="h-11 px-5 text-[15px]" onClick={() => openEnquiry()}>
              Make an enquiry
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 p-2 @3xl/main:pl-0">
          <SlotImage
            slot={photography.officeInterior}
            caption="Work"
            sizes="(min-width: 1024px) 25vw, 50vw"
            priority
            className="aspect-[3/4] rounded-lg @3xl/main:aspect-auto @3xl/main:min-h-[26rem]"
          />
          <SlotImage
            slot={photography.livingSpace}
            caption="Live"
            sizes="(min-width: 1024px) 25vw, 50vw"
            priority
            className="aspect-[3/4] rounded-lg @3xl/main:aspect-auto @3xl/main:min-h-[26rem]"
          />
        </div>
      </div>
    </Card>
  );
}

/* ── Stat cards: availability and the address essentials ────────────────── */
const countAvailable = (list: ReadonlyArray<{ status: Availability }>) =>
  list.filter((u) => u.status === 'available' || u.status === 'limited').length;

export function FactsRow() {
  const offices = officeUnits.length;
  const homes = residenceTypes.length;
  return (
    <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:gap-4 md:overflow-visible md:px-0 @xl/main:grid-cols-2 @4xl/main:grid-cols-4">
      <StatCard
        className="w-64 shrink-0 snap-start md:w-auto"
        tone="blue"
        icon={Briefcase}
        label="Office spaces"
        value={offices ? String(countAvailable(officeUnits)) : 'On request'}
        caption={offices ? `Available now · ${offices} listed` : 'Sizes and terms shared on enquiry'}
        href="/office-spaces"
      />
      <StatCard
        className="w-64 shrink-0 snap-start md:w-auto"
        tone="violet"
        icon={BedDouble}
        label="Residential"
        value={homes ? String(countAvailable(residenceTypes)) : 'On request'}
        caption={homes ? `Types available · ${homes} listed` : 'Homes for individuals and families'}
        href="/residential-living"
      />
      <StatCard
        className="w-64 shrink-0 snap-start md:w-auto"
        tone="green"
        icon={MapPin}
        label="Location"
        value={site.address.area}
        caption={`${site.address.street}, ${site.address.city}`}
        href="/location"
      />
      <StatCard
        className="w-64 shrink-0 snap-start md:w-auto"
        tone="orange"
        icon={LocateFixed}
        label="Plus Code"
        value={site.address.plusCode}
        caption="Search it in Google Maps"
        href={site.maps.listing}
      />
    </div>
  );
}

/* ── "How can we help?" — the actionable list ───────────────────────────── */
type HelpTab = 'office' | 'residential' | 'visiting';
const actionTint = {
  blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25',
  violet: 'bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-300 dark:hover:bg-violet-500/25',
  green: 'bg-green-100 text-green-700 hover:bg-green-200/70 dark:bg-green-500/15 dark:text-green-300 dark:hover:bg-green-500/25',
  neutral: 'bg-muted text-foreground hover:bg-muted/70',
};
const edge = { blue: 'border-l-blue-500', violet: 'border-l-violet-500', green: 'border-l-green-500', neutral: 'border-l-neutral-300 dark:border-l-neutral-600' };

export function HelpCard() {
  const [tab, setTab] = useState<HelpTab>('office');
  const { openEnquiry } = useEnquiry();
  const copy = (text: string, title: string) =>
    navigator.clipboard
      .writeText(text)
      .then(() => toast({ title, description: text }))
      .catch(() => toast({ title: 'Couldn’t copy', description: text, tone: 'error' }));

  type Row = { name: string; line: string; action: string; tint: keyof typeof actionTint; onClick?: () => void; href?: string };
  const rows: Record<HelpTab, Row[]> = {
    office: [
      { name: 'Ask about available offices', line: 'Sizes, terms and what’s free now', action: 'Enquire', tint: 'blue', onClick: () => openEnquiry('office') },
      { name: 'See the office spaces', line: 'Who they suit, and how it works', action: 'View', tint: 'neutral', href: '/office-spaces' },
    ],
    residential: [
      { name: 'Ask about available homes', line: 'Tell us your household and move-in date', action: 'Enquire', tint: 'violet', onClick: () => openEnquiry('residential') },
      { name: 'See residential living', line: 'Homes for individuals and families', action: 'View', tint: 'neutral', href: '/residential-living' },
    ],
    visiting: [
      { name: 'Get directions', line: 'Google Maps to Major Muriithi Street', action: 'Directions', tint: 'green', href: site.maps.directions },
      { name: 'Copy the address', line: `${site.name}, ${addressLine}`, action: 'Copy', tint: 'neutral', onClick: () => copy(`${site.name}, ${addressLine}`, 'Address copied') },
      { name: 'Plus Code', line: `${site.address.plusCode} ${site.address.plusCodeLocality}`, action: 'Copy', tint: 'neutral', onClick: () => copy(`${site.address.plusCode} ${site.address.plusCodeLocality}`, 'Plus Code copied') },
    ],
  };
  const tabs: TabDef<HelpTab>[] = [
    { id: 'office', label: 'Office space' },
    { id: 'residential', label: 'Residential' },
    { id: 'visiting', label: 'Visiting' },
  ];
  const btn = 'inline-flex h-8 w-28 shrink-0 items-center justify-center rounded-md text-[13px] font-bold transition-colors active:translate-y-px sm:w-36';

  return (
    <Card as="section" aria-labelledby="help-title" className="shadow-xs">
      <div className="px-5 pt-5">
        <h2 id="help-title" className="mb-4 text-lg font-semibold">
          How can we help?
        </h2>
        <UnderlineTabs tabs={tabs} value={tab} onChange={setTab} label="Topics" idBase="help" />
      </div>
      <ul id="help-panel" role="tabpanel" aria-labelledby={`help-tab-${tab}`} className="divide-y divide-border pb-2">
        {rows[tab].map((r) => (
          <li
            key={r.name}
            className={cn('flex items-center gap-4 border-l-[3px] px-5 py-3 transition-colors hover:bg-muted/40 md:border-l-0', edge[r.tint])}
          >
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[15px] leading-snug font-semibold">{r.name}</p>
              <p className="truncate text-[13px] text-muted-foreground">{r.line}</p>
            </div>
            {r.href ? (
              r.href.startsWith('http') ? (
                <a href={r.href} target="_blank" rel="noopener noreferrer" className={cn(btn, actionTint[r.tint])}>
                  {r.action}
                </a>
              ) : (
                <Link to={r.href} className={cn(btn, actionTint[r.tint])}>
                  {r.action}
                </Link>
              )
            ) : (
              <button type="button" onClick={r.onClick} className={cn(btn, actionTint[r.tint])}>
                {r.action}
              </button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ── Location card ──────────────────────────────────────────────────────── */
export function LocationCard() {
  return (
    <Card as="section" aria-labelledby="loc-title" className="grid gap-2 p-2 @3xl/main:grid-cols-[1.35fr_1fr]">
      <MapEmbed className="aspect-[16/10] w-full @3xl/main:aspect-auto @3xl/main:min-h-[20rem]" />
      <div className="flex flex-col gap-4 p-3 pt-4 @3xl/main:p-6">
        <div>
          <h2 id="loc-title" className="text-lg font-semibold">
            Connected to the heart of Eastleigh
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {site.name}, {addressLine}
            {site.address.landmark ? ` · ${site.address.landmark}` : ''}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            {site.address.plusCode} · {coordinatesLabel}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          <ButtonLink href={site.maps.directions} size="lg">
            <Navigation aria-hidden="true" /> Get directions
          </ButtonLink>
          <ButtonLink href={site.maps.listing} variant="outline" size="lg">
            <MapPin aria-hidden="true" /> Open in Google Maps
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}

/* ── The two uses, as record cards ──────────────────────────────────────── */
export function PropertyCards({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  const items = [
    {
      over: '01 · Commercial',
      title: 'A place for business to grow.',
      text: 'Commercial office space on Major Muriithi Street, in one of Nairobi’s busiest trading districts — an address for business owners, professionals and organisations.',
      meta: officeUnits.length ? `${countAvailable(officeUnits)} available now` : 'Availability on request',
      slot: photography.officeLight,
      href: '/office-spaces',
      cta: 'Office spaces',
      status: '#3b82f6',
    },
    {
      over: '02 · Residential',
      title: 'A space to call home.',
      text: 'Residential accommodation for individuals and families. Live close to the everyday rhythm of Eastleigh, and come home to a space of your own.',
      meta: residenceTypes.length ? `${countAvailable(residenceTypes)} types available` : 'Availability on request',
      slot: photography.bedroom,
      href: '/residential-living',
      cta: 'Residential living',
      status: '#8b5cf6',
    },
  ];
  return (
    <div className="grid gap-4 md:gap-6 @3xl/main:grid-cols-2">
      {items.map((it) => (
        <Card as="article" key={it.href} className="flex flex-col p-2">
          <Link to={it.href} className="group block overflow-hidden rounded-lg" tabIndex={-1} aria-hidden="true">
            <SlotImage slot={it.slot} sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-[16/10] transition-transform duration-500 ease-app group-hover:scale-[1.02]" />
          </Link>
          <div className="flex flex-1 flex-col p-3 pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-sans text-xs text-muted-foreground">{it.over}</p>
              <CardStatus color={it.status}>{it.meta}</CardStatus>
            </div>
            <H className="mt-1.5 text-xl font-semibold tracking-tight">{it.title}</H>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{it.text}</p>
            <div className="mt-auto pt-4">
              <Tear />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{site.address.street}</span>
              <ButtonLink href={it.href} variant="outline" size="sm">
                {it.cta} <ArrowRight aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ── Closing call to action ─────────────────────────────────────────────── */
export function CtaCard() {
  const { openEnquiry } = useEnquiry();
  return (
    <Card as="section" aria-labelledby="cta-title" className="flex flex-col gap-6 p-6 md:p-10 @4xl/main:flex-row @4xl/main:items-end @4xl/main:justify-between">
      <div>
        <h2 id="cta-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
          Find your space at Hodo Souk.
        </h2>
        <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
          Whether you’re looking for a place to establish your business or a place to call home, we’d be happy to hear
          from you.
        </p>
      </div>
      <div className="flex flex-col gap-2 xs:flex-row">
        <Button size="lg" className="h-11 px-5 text-[15px]" onClick={() => openEnquiry('office')}>
          <Briefcase aria-hidden="true" /> Enquire about office space
        </Button>
        <Button variant="outline" size="lg" className="h-11 px-5 text-[15px]" onClick={() => openEnquiry('residential')}>
          <BedDouble aria-hidden="true" /> Enquire about residential space
        </Button>
      </div>
    </Card>
  );
}

/* ── Availability: office units ─────────────────────────────────────────── */
export const statusColour: Record<Availability, string> = {
  available: '#10b981',
  limited: '#f59e0b',
  reserved: '#f97316',
  occupied: '#ef4444',
  'on-request': '#3b82f6',
};

type UnitFilter = 'all' | 'available' | 'reserved' | 'occupied';

export function OfficeUnitsSection() {
  const { openEnquiry } = useEnquiry();
  const [filter, setFilter] = useState<UnitFilter>('all');
  const units = officeUnits;
  const matches = (u: OfficeUnit, f: UnitFilter) =>
    f === 'all' ? true : f === 'available' ? u.status === 'available' || u.status === 'limited' || u.status === 'on-request' : u.status === f;
  const tabs: TabDef<UnitFilter>[] = [
    { id: 'all', label: 'All', count: units.length, color: '#3b82f6' },
    { id: 'available', label: 'Available', count: units.filter((u) => matches(u, 'available')).length, color: '#10b981' },
    { id: 'reserved', label: 'Reserved', count: units.filter((u) => matches(u, 'reserved')).length, color: '#f59e0b' },
    { id: 'occupied', label: 'Let', count: units.filter((u) => matches(u, 'occupied')).length, color: '#ef4444' },
  ];
  const visible = units.filter((u) => matches(u, filter));
  const dash = <span className="text-muted-foreground">On request</span>;

  return (
    <section aria-labelledby="units-title" className="flex flex-col gap-4">
      <SectionHeader
        id="units-title"
        title="Available offices"
        description="What’s free now. Availability changes often, so ask if you don’t see what you need."
        actions={
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{units.length}</span> listed
          </p>
        }
      />
      {units.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No offices are listed yet"
            description="Availability changes often. Ask, and we’ll tell you what’s free now, with sizes and terms."
            action={
              <Button size="xl" onClick={() => openEnquiry('office')}>
                <MessageSquarePlus aria-hidden="true" /> Ask about availability
              </Button>
            }
          />
        </Card>
      ) : (
        <div>
          <FolderTabs tabs={tabs} value={filter} onChange={setFilter} label="Filter offices by status" idBase="units" />
          <div id="units-panel" role="tabpanel" aria-labelledby={`units-tab-${filter}`} className="overflow-hidden rounded-xl rounded-tl-none bg-card">
            {visible.length === 0 ? (
              <EmptyState icon={PartyPopper} tone="good" title="Nothing in this list" description="Try another tab." />
            ) : (
              <div className="scrollbar-pill overflow-x-auto">
                <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
                  <caption className="sr-only">Office units at Hodo Souk</caption>
                  <thead>
                    <tr className="border-b">
                      {['Unit', 'Floor', 'Size', 'Rent', 'Service charge', 'Status'].map((h, i) => (
                        <th
                          key={h}
                          scope="col"
                          className={cn('h-11 border-e px-3 text-[13px] font-medium text-muted-foreground last:border-e-0', i >= 2 && i <= 4 && 'text-right')}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((u) => (
                      <tr key={u.id} className="border-b last:border-b-0 hover:bg-muted/40">
                        <th scope="row" className="border-e px-3 py-3 font-medium">
                          {u.name}
                          {u.note && <span className="block text-xs font-normal text-muted-foreground">{u.note}</span>}
                        </th>
                        <td className="border-e px-3 py-3">{u.floor ?? dash}</td>
                        <td className="border-e px-3 py-3 text-right tabular-nums">{u.size ? formatArea(u.size) : dash}</td>
                        <td className="border-e px-3 py-3 text-right font-semibold tabular-nums">{u.rent ? formatMoney(u.rent) : dash}</td>
                        <td className="border-e px-3 py-3 text-right tabular-nums">{u.serviceCharge ? formatMoney(u.serviceCharge) : dash}</td>
                        <td className="px-3 py-3">
                          <StatusPill color={statusColour[u.status]}>{availabilityLabel[u.status]}</StatusPill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ── Availability: residence types (cards) ──────────────────────────────── */
export function ResidenceTypesSection() {
  const { openEnquiry } = useEnquiry();
  const types = residenceTypes;
  return (
    <section aria-labelledby="homes-title" className="flex flex-col gap-4">
      <SectionHeader
        id="homes-title"
        title="Homes at Hodo Souk"
        description="What’s available now. Tell us about your household if you don’t see what you need."
        actions={
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{types.length}</span> listed
          </p>
        }
      />
      {types.length === 0 ? (
        <Card>
          <EmptyState
            icon={BedDouble}
            title="No homes are listed yet"
            description="Tell us about your household and move-in date, and we’ll let you know what’s available."
            action={
              <Button size="xl" onClick={() => openEnquiry('residential')}>
                <MessageSquarePlus aria-hidden="true" /> Ask about homes
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-3 md:gap-5 @3xl/main:grid-cols-2 @6xl/main:grid-cols-3">
          {types.map((t) => (
            <ResidenceCard key={t.id} type={t} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ResidenceCard({ type }: { type: ResidenceType }) {
  const details = [
    type.bedrooms !== null ? `${type.bedrooms} bed` : null,
    type.bathrooms !== null ? `${type.bathrooms} bath` : null,
    type.size ? formatArea(type.size) : null,
  ].filter(Boolean);
  return (
    <li className="rounded-xl bg-card p-4 transition-transform active:scale-[0.99]">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-vivid-cyan/10 text-vivid-cyan">
          <BedDouble className="size-4" aria-hidden="true" />
        </span>
        <CardStatus color={statusColour[type.status]}>{availabilityLabel[type.status]}</CardStatus>
      </div>
      <p className="mt-3 font-sans text-xs text-muted-foreground">Residential</p>
      <h3 className="text-[15px] font-semibold">{type.name}</h3>
      {type.description && <p className="mt-1.5 text-sm text-muted-foreground">{type.description}</p>}
      <Tear className="my-4" />
      <div className="flex items-end justify-between gap-3">
        <span className="text-xs text-muted-foreground">{details.join(' · ') || 'Details on request'}</span>
        <span className="text-lg font-semibold tabular-nums">{type.rent ? formatMoney(type.rent) : 'On request'}</span>
      </div>
    </li>
  );
}

/* ── Address details with copy actions ──────────────────────────────────── */
export function AddressCard() {
  const plus = `${site.address.plusCode} ${site.address.plusCodeLocality}`;
  const full = `${site.name}, ${addressLine}, ${site.address.country}`;
  return (
    <Card as="section" aria-labelledby="addr-title" className="p-5">
      <h2 id="addr-title" className="text-lg font-semibold">
        Address
      </h2>
      <dl className="mt-3 divide-y divide-border">
        <div className="py-3">
          <dt className="text-sm text-muted-foreground">Building</dt>
          <dd className="mt-0.5 text-[15px] font-medium">
            <address className="not-italic">
              {site.name}, {site.address.street}
              <br />
              {site.address.area}, {site.address.city}, {site.address.country}
            </address>
          </dd>
        </div>
        {site.address.landmark && (
          <div className="py-3">
            <dt className="text-sm text-muted-foreground">Landmark</dt>
            <dd className="mt-0.5 text-[15px] font-medium">{site.address.landmark}</dd>
          </div>
        )}
        <div className="flex items-end justify-between gap-4 py-3">
          <div>
            <dt className="text-sm text-muted-foreground">Plus Code</dt>
            <dd className="mt-0.5 text-[15px] font-medium tabular-nums">{plus}</dd>
          </div>
          <CopyButton text={plus} label="Copy" toastTitle="Plus Code copied" />
        </div>
        <div className="py-3">
          <dt className="text-sm text-muted-foreground">Coordinates</dt>
          <dd className="mt-0.5 text-[15px] font-medium tabular-nums">{coordinatesLabel}</dd>
        </div>
      </dl>
      <div className="mt-2 flex flex-wrap gap-2">
        <CopyButton text={full} label="Copy address" toastTitle="Address copied" />
      </div>
    </Card>
  );
}
