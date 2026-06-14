import { Metadata } from 'next';
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo";
import { EnterprisesClient } from "./enterprises-client";

const TITLE = 'Global Trade OS for Enterprises';
const DESCRIPTION = 'Run a trade end to end on one source of truth. Baalvion keeps your orders, escrow-secured payments, documents, compliance, and shipments on a single platform.';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/enterprises',
  keywords: ['enterprise trade platform', 'global trade operations', 'supply chain consolidation', 'trade execution', 'enterprise logistics', 'procurement platform'],
});

export default function EnterprisesPage() {
  return (
    <>
      <script {...jsonLdScriptProps(serviceJsonLd({ name: TITLE, description: DESCRIPTION, path: '/enterprises', audience: 'Enterprises' }))} />
      <script {...jsonLdScriptProps(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Enterprises', path: '/enterprises' }]))} />
      <EnterprisesClient />
    </>
  );
}
