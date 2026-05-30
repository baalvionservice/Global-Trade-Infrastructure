import type { Metadata } from 'next';
import { pageMetadata, breadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Sales',
  description:
    'Talk to the Baalvion team about onboarding your enterprise, bank, or government agency to the Global Trade Operating System. Request a demo, discuss integration, or start your verification.',
  path: '/contact',
  keywords: ['contact Baalvion', 'request a demo', 'trade platform sales', 'enterprise onboarding'],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]))} />
      {children}
    </>
  );
}
