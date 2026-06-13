/**
 * @file layout.tsx
 * @description THE SUPREME DASHBOARD ORCHESTRATOR.
 * Integrates the resizable workspace engine and global navigation.
 */
'use client';

import { DashboardHeader } from "./_components/header";
import { DashboardSidebar } from "./_components/sidebar";
import { WorkspaceShell } from "./_components/workspace-shell";
import { AiCopilotDrawer } from "./_components/ai-copilot-drawer";
import { RealtimeProvider } from "./_components/realtime-provider";
import { useWorkspaceStore } from "@/modules/workspace/store/workspace-store";
import { TradeQueryProvider } from "@/api/query-provider";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarCollapsed } = useWorkspaceStore();

  return (
    <TradeQueryProvider>
      <div
        className={cn(
          "min-h-screen w-full bg-background grid transition-all duration-500",
          sidebarCollapsed ? "grid-cols-[80px_1fr]" : "grid-cols-[280px_1fr]"
        )}
      >
        {/* 1. PRIMARY NAVIGATION RAIL */}
        <DashboardSidebar collapsed={sidebarCollapsed} />

        {/* 2. OPERATIONAL WORKSPACE (COMMAND PLANE) */}
        <div className="flex flex-col min-w-0 overflow-hidden bg-background relative">
          <DashboardHeader />

          {/* THE TACTICAL SHELL: Resizable panes & tabs */}
          <WorkspaceShell>
             {children}
          </WorkspaceShell>
        </div>

        {/* OVERLAYS & COGNITIVE CLUSTERS */}
        <AiCopilotDrawer />
        <RealtimeProvider />
      </div>
    </TradeQueryProvider>
  );
}