import { InstitutionalHeader } from '@/components/institutional-header';
import { InstitutionalFooter } from '@/components/institutional-footer';

/**
 * @file layout.tsx
 * @description The layout for the public/institutional part of the application.
 * It wraps all public pages with the institutional header and footer.
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <InstitutionalHeader />
      <main className="flex-1">
        {children}
      </main>
      <InstitutionalFooter />
    </div>
  );
}
