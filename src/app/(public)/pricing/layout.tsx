import type { Metadata } from 'next';
import { pageMetadata, breadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Pricing',
  description:
    'Transparent plans for the Baalvion Global Trade OS — from SME Starter to sovereign-grade enterprise infrastructure. Escrow-secured payments, trade finance, compliance, and logistics, priced to scale.',
  path: '/pricing',
  keywords: ['Baalvion pricing', 'trade platform pricing', 'trade finance cost', 'escrow pricing', 'enterprise trade plans'],
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }]))} />
      {children}
    </>
  );
}
