import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { AppProvider } from "./(dashboard)/_components/app-state";
import { RouteGuard } from "./(dashboard)/_components/route-guard";
import { TourOverlay } from '@/components/tour-overlay';
import { organizationJsonLd, webSiteJsonLd, jsonLdScriptProps } from '@/lib/seo';

// Authenticated, store-driven trade platform: render dynamically rather than
// statically prerendering at build (client stores are not SSG-safe).
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://trade.baalvion.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: 'data:,' },
  title: {
    default: 'Baalvion | The Global Trade Operating System',
    template: '%s | Baalvion OS',
  },
  description: 'Baalvion is the neutral institutional infrastructure layer for global trade — connecting execution, finance, compliance, and logistics in one governed platform.',
  keywords: ['global trade', 'trade finance', 'supply chain', 'escrow', 'logistics', 'compliance', 'baalvion', 'trade OS'],
  authors: [{ name: 'Baalvion', url: SITE_URL }],
  creator: 'Baalvion',
  publisher: 'Baalvion',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Baalvion',
    title: 'Baalvion | The Global Trade Operating System',
    description: 'The neutral institutional infrastructure layer for global trade.',
    // og:image is supplied automatically by app/opengraph-image.tsx (generated card).
  },
  twitter: {
    card: 'summary_large_image',
    site: '@baalvion',
    title: 'Baalvion | The Global Trade Operating System',
    description: 'The neutral institutional infrastructure layer for global trade.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  // No global canonical — each page self-canonicalizes (the public pages set their own
  // via the SEO helper). A site-wide canonical would wrongly point every URL at home.
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-sans antialiased min-h-screen bg-background")}>
        {/* Site-wide structured data: brand entity + searchable website. */}
        <script {...jsonLdScriptProps(organizationJsonLd())} />
        <script {...jsonLdScriptProps(webSiteJsonLd())} />
        <AppProvider>
           {/* Per-persona authorization on every protected route (covers the (dashboard) group AND
               top-level authenticated areas like /governance). Public routes pass through. */}
           <RouteGuard>
             {children}
           </RouteGuard>
           <TourOverlay />
           <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}