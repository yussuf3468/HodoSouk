import { useMemo, useState } from 'react';
import { Camera, Maximize2 } from 'lucide-react';
import { allSlots, categoryLabel, galleryCategories, galleryItems } from '@/content/gallery';
import type { PhotoCategory } from '@/content/types';
import { Card, PageHeading } from '@/components/ui/page-heading';
import { EmptyState } from '@/components/ui/empty-state';
import { Pending } from '@/components/ui/misc';
import { SlotImage } from '@/components/ui/photo';
import { FolderTabs, type TabDef } from '@/components/ui/tabs';
import { Lightbox } from '@/components/gallery/lightbox';

/** Real photographs of Hodo Souk only. Stock never appears here. */
export default function GalleryPage() {
  const [tab, setTab] = useState<PhotoCategory | 'all'>('all');
  const [open, setOpen] = useState<number | null>(null);

  const visible = useMemo(() => (tab === 'all' ? galleryItems : galleryItems.filter((i) => i.category === tab)), [tab]);
  const tabs: TabDef<PhotoCategory | 'all'>[] = galleryCategories.map((c) => ({
    id: c.id,
    label: c.label,
    color: c.color,
    count: c.id === 'all' ? galleryItems.length : galleryItems.filter((i) => i.category === c.id).length,
  }));

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeading
        title="Gallery"
        description="Photographs of Hodo Souk: the building, its offices, its homes and the spaces they share."
        actions={
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{galleryItems.length}</span>{' '}
            {galleryItems.length === 1 ? 'photograph' : 'photographs'}
          </p>
        }
      />

      <div>
        <FolderTabs tabs={tabs} value={tab} onChange={setTab} label="Filter photographs by category" idBase="gallery" />
        <Card className="rounded-tl-none">
          <div id="gallery-panel" role="tabpanel" aria-labelledby={`gallery-tab-${tab}`}>
            {visible.length === 0 ? (
              <EmptyState
                icon={Camera}
                title={galleryItems.length === 0 ? 'No photographs yet' : `No ${categoryLabel(tab as PhotoCategory).toLowerCase()} photographs yet`}
                description="Photographs of Hodo Souk will show up here as soon as they’re taken."
              />
            ) : (
              <ul className="grid gap-3 p-3 md:gap-5 md:p-5 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                {visible.map((item, i) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setOpen(i)}
                      aria-label={`Open ${item.title} in the photo viewer`}
                      className="group relative block w-full overflow-hidden rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99]"
                    >
                      <SlotImage slot={item} sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw" className="aspect-[4/3] transition-transform duration-500 ease-app group-hover:scale-[1.02]" />
                      <span className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                        <Maximize2 className="size-4" aria-hidden="true" />
                      </span>
                    </button>
                    <p className="mt-2 font-sans text-[15px] font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{categoryLabel(item.category)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <Pending file="src/content/photography.ts">
        Shot list ({allSlots.filter((s) => !s.photo).length} still needed):{' '}
        {allSlots
          .filter((s) => !s.photo)
          .map((s) => s.title)
          .join(' · ')}
        . Add originals to /media-originals, run <code>npm run images</code>, then set each slot’s <code>photo</code>.
      </Pending>

      <Lightbox items={visible} index={open} onClose={() => setOpen(null)} onIndexChange={setOpen} />
    </div>
  );
}
