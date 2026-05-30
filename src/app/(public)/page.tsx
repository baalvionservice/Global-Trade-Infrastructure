/**
 * @file src/app/(public)/page.tsx
 * @description The authoritative Home Page for the Baalvion OS — a server component
 * that owns SEO (metadata + JSON-LD) and renders the interactive client hero.
 */

import type { Metadata } from 'next';
import { HomeClient } from './_components/home-client';
import { pageMetadata, softwareApplicationJsonLd, jsonLdScriptProps } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Baalvion — The Global Trade Operating System',
  description:
    'Baalvion is the neutral institutional infrastructure for global trade: run sourcing, RFQs, escrow-secured payments, trade finance, compliance, and logistics on one governed platform trusted by enterprises, banks, and governments worldwide.',
  path: '/',
  keywords: [
    'global trade platform',
    'trade operating system',
    'trade finance',
    'escrow payments',
    'supply chain',
    'logistics',
    'KYC compliance',
    'RFQ marketplace',
    'cross-border trade',
    'Baalvion',
  ],
});

export default function RootHomePage() {
  return (
    <>
      <script {...jsonLdScriptProps(softwareApplicationJsonLd())} />
      <HomeClient />
    </>
  );
}
