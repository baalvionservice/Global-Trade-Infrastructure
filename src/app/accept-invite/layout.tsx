import type { Metadata } from 'next';

/**
 * @file accept-invite/layout.tsx
 * @description Server segment for the invite-acceptance flow. The page is a client
 * component (cannot export metadata), so this sibling layout carries the noindex
 * directive — belt-and-suspenders alongside the robots.ts disallow.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AcceptInviteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
