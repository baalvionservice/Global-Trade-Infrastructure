import type { Metadata } from 'next';

/**
 * @file login/layout.tsx
 * @description Server segment for the authenticated gateway. The page itself is a
 * client component (cannot export metadata), so this sibling layout carries the
 * noindex directive — belt-and-suspenders alongside the robots.ts disallow.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
