import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Access Pending Review',
  description: 'Your Baalvion access request is under review by our institutional verification team.',
  path: '/access/pending',
  noindex: true,
});

export default function AccessPendingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
