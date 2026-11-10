import { BedDouble, Briefcase, Building2, House, Images, MapPin, MessageSquareText, type LucideIcon } from 'lucide-react';
import { primaryNav } from '@/content/navigation';

const icons: Record<string, LucideIcon> = {
  '/': House,
  '/the-building': Building2,
  '/office-spaces': Briefcase,
  '/residential-living': BedDouble,
  '/gallery': Images,
  '/location': MapPin,
  '/contact': MessageSquareText,
};

/** Shorter labels for the phone bottom bar and the collapsed sidebar rail. */
const short: Record<string, string> = {
  '/': 'Home',
  '/the-building': 'Building',
  '/office-spaces': 'Offices',
  '/residential-living': 'Homes',
  '/gallery': 'Gallery',
  '/location': 'Location',
  '/contact': 'Contact',
};

export const navItems = primaryNav.map((item) => ({
  ...item,
  icon: icons[item.href] ?? House,
  short: short[item.href] ?? item.label,
}));

export type NavItemWithIcon = (typeof navItems)[number];

/** Phone bottom bar: four destinations plus More. */
export const bottomTabs = ['/', '/the-building', '/office-spaces', '/residential-living'].map(
  (href) => navItems.find((n) => n.href === href)!,
);

/** Tiles in the More panel. */
export const moreTiles = ['/gallery', '/location', '/contact'].map((href) => navItems.find((n) => n.href === href)!);

export const navIndex = (pathname: string) => {
  const i = navItems.findIndex((n) => n.href === pathname);
  return i === -1 ? navItems.length : i;
};
