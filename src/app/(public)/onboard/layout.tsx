import type { Metadata } from 'next';
import { pageMetadata, breadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Onboard to Baalvion',
  description:
    'Join the Baalvion Global Trade OS as a verified buyer or supplier. Complete KYC/KYB verification once and transact securely with escrow-backed payments, trade finance, and logistics worldwide.',
  path: '/onboard',
  keywords: ['become a supplier', 'become a buyer', 'trade onboarding', 'KYC verification', 'join trade platform'],
});

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Onboard', path: '/onboard' }]))} />
      {children}
    </>
  );
}
