import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { absoluteUrl, fullTitle, metaFor } from '@/content/seo';

/**
 * Keeps <head> in step with client-side navigation. The initial HTML for
 * every page already carries the correct tags (scripts/prerender.mjs); this
 * only updates them as the visitor moves between pages.
 */
function setMeta(selector: string, attr: 'content' | 'href', value: string | null) {
  const el = document.head.querySelector(selector);
  if (el && value !== null) el.setAttribute(attr, value);
}

export function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = metaFor(pathname);
    const title = fullTitle(meta);
    const url = absoluteUrl(meta.path);

    document.title = title;
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', meta.description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('link[rel="canonical"]', 'href', url);
  }, [pathname]);

  return null;
}
