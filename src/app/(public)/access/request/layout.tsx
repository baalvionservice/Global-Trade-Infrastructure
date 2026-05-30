import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Request Access',
  description: 'Request institutional access to the Baalvion Global Trade Operating System.',
  path: '/access/request',
  noindex: true,
});

export default function AccessRequestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
