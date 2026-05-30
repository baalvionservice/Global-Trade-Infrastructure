import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Buyer Onboarding & KYC',
  description:
    'Onboard as a verified buyer on Baalvion. Complete KYB verification to source globally, issue RFQs, and pay suppliers through escrow-secured settlement with full compliance.',
  path: '/onboard/buyer',
  keywords: ['buyer onboarding', 'become a buyer', 'sourcing platform', 'KYB verification', 'RFQ'],
});

export default function OnboardBuyerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
