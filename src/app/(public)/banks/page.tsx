import { Metadata } from 'next';
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo";
import { BanksClient } from "./banks-client";

const TITLE = 'Trade Finance Solutions for Banks';
const DESCRIPTION = 'Modernize your trade finance rails with Baalvion. Real-time escrow, double-entry ledger, net settlement, and sanctions screening that integrate with your core banking systems over API.';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/banks',
  keywords: ['trade finance for banks', 'escrow settlement', 'double-entry ledger', 'cross-border settlement', 'sanctions screening', 'bank trade infrastructure'],
});

export default function BankRolePage() {
  return (
    <>
      <script {...jsonLdScriptProps(serviceJsonLd({ name: TITLE, description: DESCRIPTION, path: '/banks', audience: 'Banks' }))} />
      <script {...jsonLdScriptProps(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Banks', path: '/banks' }]))} />
      <BanksClient />
    </>
  );
}
