import type {Metadata, Viewport} from 'next';
import {SiteHeader} from '@/components/SiteHeader';
import {SiteFooter} from '@/components/SiteFooter';
import {site} from '@/content/books';
import './globals.css';

const portrait = {url: '/shay-eisenberg.jpg', width: 1365, height: 2048, alt: 'Shay Eisenberg'};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {default: 'Shay Eisenberg | Author', template: '%s | Shay Eisenberg'},
  description: site.description,
  alternates: {canonical: '/'},
  openGraph: {type: 'website', locale: 'en_US', siteName: site.title, title: 'Shay Eisenberg | Author', description: site.description, images: [portrait]},
  twitter: {card: 'summary_large_image', title: 'Shay Eisenberg | Author', description: site.description, images: [portrait.url]},
  icons: {
    icon: [
      {url: '/favicon.svg', type: 'image/svg+xml'},
      {url: '/favicon.ico', sizes: 'any'},
      {url: '/icon-192.png', sizes: '192x192', type: 'image/png'},
      {url: '/icon-512.png', sizes: '512x512', type: 'image/png'},
    ],
    apple: [{url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png'}],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {themeColor: '#182b2a'};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><SiteHeader />{children}<SiteFooter /></body></html>;
}
