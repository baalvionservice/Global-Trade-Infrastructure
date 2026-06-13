import { Metadata } from 'next';
import { pageMetadata } from "@/lib/seo";
import { EnterprisesClient } from "./enterprises-client";

export const metadata: Metadata = pageMetadata({
  title: 'Global Trade OS for Enterprises',
  description: 'Run a trade end to end on one source of truth. Baalvion keeps your orders, escrow-secured payments, documents, compliance, and shipments on a single platform.',
  path: '/enterprises',
  keywords: ['enterprise trade platform', 'global trade operations', 'supply chain consolidation', 'trade execution', 'enterprise logistics', 'procurement platform'],
});

export default function EnterprisesPage() {
  return <EnterprisesClient />;
}
