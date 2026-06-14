import type { Metadata } from 'next';

/**
 * @file reset-password/layout.tsx
 * @description Server segment for the password-reset flow. The page is a client
 * component (cannot export metadata), so this sibling layout carries the noindex
 * directive — belt-and-suspenders alongside the robots.ts disallow.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
