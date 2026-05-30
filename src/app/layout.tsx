import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { AppProvider } from "./(dashboard)/_components/app-state";
import { TourOverlay } from '@/components/tour-overlay';

// Authenticated, store-driven trade platform: render dynamically rather than
// statically prerendering at build (client stores are not SSG-safe).
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://trade.baalvion.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Baalvion Trade OS' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@baalvion',
    title: 'Baalvion | The Global Trade Operating System',
    description: 'The neutral institutional infrastructure layer for global trade.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: SITE_URL },
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
        <AppProvider>
           {children}
           <TourOverlay />
           <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}