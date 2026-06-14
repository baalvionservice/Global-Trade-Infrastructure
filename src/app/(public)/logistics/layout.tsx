import type { Metadata } from 'next';
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';

const LOGISTICS_TITLE = 'Logistics & Supply Chain';
const LOGISTICS_DESCRIPTION =
  'Orchestrate freight, customs, and multimodal shipments on Baalvion — real-time corridor visibility, milestone finality, and document-backed delivery integrated with trade execution and finance.';

export const metadata: Metadata = pageMetadata({
  title: LOGISTICS_TITLE,
  description: LOGISTICS_DESCRIPTION,
  path: '/logistics',
  keywords: ['logistics platform', 'supply chain visibility', 'freight tracking', 'customs clearance', 'global shipping', 'corridor intelligence'],
});

export default function LogisticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script {...jsonLdScriptProps(serviceJsonLd({ name: LOGISTICS_TITLE, description: LOGISTICS_DESCRIPTION, path: '/logistics', audience: 'Shippers & Logistics Providers' }))} />
      <script {...jsonLdScriptProps(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Logistics', path: '/logistics' }]))} />
      {children}
    </>
  );
}
