
/**
 * @file governance/layout.tsx
 * @description Provides the standard dashboard command shell for all consolidated governance and oversight pages.
 * Refactored: Removed redundant AppProvider as it is now managed at the Root Layout.
 */
'use client';

import { DashboardHeader } from "@/app/(dashboard)/_components/header";
import { DashboardSidebar } from "@/app/(dashboard)/_components/sidebar";

export default function GovernanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardSidebar />
        <div className="flex flex-col">
            <DashboardHeader />
            <div className="flex-1 p-6 md:p-8 lg:p-6 overflow-auto">
              {children}
            </div>
        </div>
    </div>
  )
}
