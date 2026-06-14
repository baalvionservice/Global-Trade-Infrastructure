import type { Metadata } from 'next';

/**
 * @file forgot-password/layout.tsx
 * @description Server segment for the password-recovery flow. The page is a client
 * component (cannot export metadata), so this sibling layout carries the noindex
 * directive — belt-and-suspenders alongside the robots.ts disallow.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
