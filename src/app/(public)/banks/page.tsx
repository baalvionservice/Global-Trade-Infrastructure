import { Metadata } from 'next';
import { pageMetadata } from "@/lib/seo";
import { BanksClient } from "./banks-client";

export const metadata: Metadata = pageMetadata({
  title: 'Trade Finance Solutions for Banks',
  description: 'Modernize your trade finance rails with Baalvion. Real-time escrow, double-entry ledger, net settlement, and sanctions screening that integrate with your core banking systems over API.',
  path: '/banks',
  keywords: ['trade finance for banks', 'escrow settlement', 'double-entry ledger', 'cross-border settlement', 'sanctions screening', 'bank trade infrastructure'],
});

export default function BankRolePage() {
  return <BanksClient />;
}
