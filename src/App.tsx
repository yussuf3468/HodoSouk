import { Route, Routes } from 'react-router';
import { AppShell } from '@/components/shell/app-shell';
import HomePage from '@/pages/HomePage';
import BuildingPage from '@/pages/BuildingPage';
import OfficeSpacesPage from '@/pages/OfficeSpacesPage';
import ResidentialPage from '@/pages/ResidentialPage';
import GalleryPage from '@/pages/GalleryPage';
import LocationPage from '@/pages/LocationPage';
import ContactPage from '@/pages/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage';

/**
 * Routes. Pages are imported eagerly: the whole site is small, every page is
 * prerendered to static HTML, and eager imports keep server rendering simple.
 * Any new route must also be added to src/content/navigation.ts (sitemap,
 * prerender) and src/content/seo.ts (metadata).
 */
export default function App() {
  return (
    <AppShell>
      {(location) => (
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/the-building" element={<BuildingPage />} />
          <Route path="/office-spaces" element={<OfficeSpacesPage />} />
          <Route path="/residential-living" element={<ResidentialPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/location" element={<LocationPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
    </AppShell>
  );
}
