import type { Metadata } from 'next';
import { pageMetadata, organizationJsonLd, breadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About Baalvion',
  description:
    'Baalvion is the neutral, governed infrastructure layer for global trade — unifying execution, finance, compliance, and logistics so enterprises, banks, and governments transact with verifiable trust. Learn our mission and standards.',
  path: '/about',
  keywords: ['about Baalvion', 'global trade infrastructure', 'neutral trade platform', 'trade governance'],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script {...jsonLdScriptProps(organizationJsonLd())} />
      <script {...jsonLdScriptProps(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]))} />
      {children}
    </>
  );
}
