import { Metadata } from 'next';
import { pageMetadata } from "@/lib/seo";
import { GovernmentsClient } from "./governments-client";

export const metadata: Metadata = pageMetadata({
  title: 'Sovereign Trade Oversight Solutions',
  description: 'Real-time trade visibility, customs filing across ICEGATE, ACE, CDS, and Mirsal, live sanctions screening, and immutable audit logs for regulators and central banks.',
  path: '/governments',
  keywords: ['trade oversight', 'customs enforcement', 'regulatory technology', 'sovereign trade', 'sanctions screening', 'government trade platform'],
});

export default function GovernmentsPage() {
  return <GovernmentsClient />;
}
