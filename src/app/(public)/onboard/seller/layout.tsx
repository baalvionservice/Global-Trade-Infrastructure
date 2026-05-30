import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Supplier Onboarding & KYC',
  description:
    'Onboard as a verified supplier on Baalvion. Complete KYB verification to reach institutional buyers worldwide, win RFQs, and get paid securely through escrow-backed settlement.',
  path: '/onboard/seller',
  keywords: ['supplier onboarding', 'become a supplier', 'sell globally', 'KYB verification', 'win RFQs'],
});

export default function OnboardSellerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
