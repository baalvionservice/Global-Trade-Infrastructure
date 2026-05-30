import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Use',
  description:
    'The terms governing access to and use of the Baalvion Global Trade Operating System, including acceptable use, institutional obligations, and liability.',
  path: '/terms',
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
