/**
 * Photography for a slot, in priority order:
 *   1. the REAL photograph (from `npm run images`), or
 *   2. licensed stock, tagged "Illustrative", or
 *   3. a quiet "photo coming soon" panel.
 */
import { useEffect, useRef, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import manifestJson from '@/content/photo-manifest.json';
import type { PhotoRef, PhotoSlot, StockRef } from '@/content/types';
import { cn } from '@/lib/cn';

interface ManifestEntry {
  readonly width: number;
  readonly height: number;
  readonly tone: string;
  readonly widths: readonly number[];
}

const manifest = manifestJson as Record<string, ManifestEntry>;

export function photoEntry(ref: PhotoRef | null): ManifestEntry | null {
  if (!ref) return null;
  const entry = manifest[ref.slug];
  if (!entry && import.meta.env.DEV) {
    console.warn(`[photo] "${ref.slug}" is not in photo-manifest.json — run \`npm run images\`.`);
  }
  return entry ?? null;
}

export function localSrcSet(slug: string, widths: readonly number[]): string {
  return widths.map((w) => `/images/${slug}-${w}.webp ${w}w`).join(', ');
}

const STOCK_WIDTHS = [480, 800, 1200, 1600, 2000];
export const stockUrl = (id: string, w: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
export const stockSrcSet = (id: string) => STOCK_WIDTHS.map((w) => `${stockUrl(id, w)} ${w}w`).join(', ');

/** Fades in on load; handles images that finish before hydration attaches onLoad. */
function FadeImg(props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) {
  const { priority, className, ...rest } = props;
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(Boolean(priority));
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);
  return (
    <img
      ref={ref}
      {...rest}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={cn('h-full w-full object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', className)}
    />
  );
}

export function hasImage(slot: PhotoSlot): boolean {
  return Boolean((slot.photo && photoEntry(slot.photo)) || slot.stock);
}

export function SlotImage({
  slot,
  sizes,
  priority,
  className,
  caption,
}: {
  slot: PhotoSlot;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Small label shown beside the "Illustrative" tag, e.g. "Work". */
  caption?: string;
}) {
  const entry = photoEntry(slot.photo);

  if (slot.photo && entry) {
    const fallback = entry.widths.find((w) => w >= 1200) ?? entry.widths[entry.widths.length - 1]!;
    return (
      <div className={cn('relative overflow-hidden bg-muted', className)} style={{ backgroundColor: entry.tone }}>
        <FadeImg
          src={`/images/${slot.photo.slug}-${fallback}.webp`}
          srcSet={localSrcSet(slot.photo.slug, entry.widths)}
          sizes={sizes}
          width={entry.width}
          height={entry.height}
          alt={slot.photo.alt}
          priority={priority}
          style={{ objectPosition: slot.photo.position ?? '50% 50%' }}
          className="absolute inset-0"
        />
        {caption && <ImageTag>{caption}</ImageTag>}
      </div>
    );
  }

  if (slot.stock) {
    return <StockImage stock={slot.stock} sizes={sizes} priority={priority} className={className} caption={caption} />;
  }

  return (
    <div className={cn('relative grid place-items-center overflow-hidden bg-muted text-muted-foreground', className)}>
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <ImageIcon className="size-5" strokeWidth={1.75} aria-hidden="true" />
        <span className="text-xs">Photo coming soon · {slot.title}</span>
      </div>
    </div>
  );
}

export function StockImage({
  stock,
  sizes,
  priority,
  className,
  caption,
}: {
  stock: StockRef;
  sizes: string;
  priority?: boolean;
  className?: string;
  caption?: string;
}) {
  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      <FadeImg
        src={stockUrl(stock.unsplash, 1200)}
        srcSet={stockSrcSet(stock.unsplash)}
        sizes={sizes}
        alt={stock.alt}
        priority={priority}
        style={{ objectPosition: stock.position ?? '50% 50%' }}
        className="absolute inset-0"
      />
      <ImageTag>
        {caption ? `${caption} · ` : ''}Illustrative
      </ImageTag>
    </div>
  );
}

function ImageTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute bottom-2.5 left-2.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
      {children}
    </span>
  );
}
