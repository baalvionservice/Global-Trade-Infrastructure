import type { Metadata } from 'next';
import { pageMetadata, breadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Logistics & Supply Chain',
  description:
    'Orchestrate freight, customs, and multimodal shipments on Baalvion — real-time corridor visibility, milestone finality, and document-backed delivery integrated with trade execution and finance.',
  path: '/logistics',
  keywords: ['logistics platform', 'supply chain visibility', 'freight tracking', 'customs clearance', 'global shipping', 'corridor intelligence'],
});

export default function LogisticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Logistics', path: '/logistics' }]))} />
      {children}
    </>
  );
}
