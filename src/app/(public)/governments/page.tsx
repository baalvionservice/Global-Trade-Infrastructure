import { Metadata } from 'next';
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo";
import { GovernmentsClient } from "./governments-client";

const TITLE = 'Sovereign Trade Oversight Solutions';
const DESCRIPTION = 'Real-time trade visibility, customs filing across ICEGATE, ACE, CDS, and Mirsal, live sanctions screening, and immutable audit logs for regulators and central banks.';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/governments',
  keywords: ['trade oversight', 'customs enforcement', 'regulatory technology', 'sovereign trade', 'sanctions screening', 'government trade platform'],
});

export default function GovernmentsPage() {
  return (
    <>
      <script {...jsonLdScriptProps(serviceJsonLd({ name: TITLE, description: DESCRIPTION, path: '/governments', audience: 'Governments & Regulators' }))} />
      <script {...jsonLdScriptProps(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Governments', path: '/governments' }]))} />
      <GovernmentsClient />
    </>
  );
}
