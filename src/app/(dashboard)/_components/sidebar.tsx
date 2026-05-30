'use client';
import Link from 'next/link';
import { BaalvionLogo } from '@/components/icons';
import { SidebarNav } from './sidebar-nav';
import { PATHS } from '@/lib/paths';
import { cn } from '@/lib/utils';
import { useDeviceClass } from '@/hooks/use-device-class';

interface SidebarProps {
  collapsed?: boolean;
}

/**
 * @file sidebar.tsx
 * @description Adaptive sidebar supporting full (desktop) and icon-only (tablet) modes.
 */
export function DashboardSidebar({ collapsed }: SidebarProps) {
  const { isMobile } = useDeviceClass();

  if (isMobile) return null;

  return (
    <aside className={cn(
      "hidden md:flex flex-col border-r bg-muted/40 transition-all duration-300 overflow-hidden",
      collapsed ? "w-20" : "w-full"
    )}>
      <div className={cn(
        "flex h-14 items-center border-b transition-all",
        collapsed ? "px-0 justify-center" : "px-6 lg:px-8"
      )}>
        <Link href={PATHS.DASHBOARD} className="flex items-center gap-3">
          <BaalvionLogo className="h-7 w-7 text-primary" />
          {!collapsed && (
            <span className="font-black uppercase tracking-tighter text-foreground text-lg">Baalvion</span>
          )}
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <SidebarNav collapsed={collapsed} />
      </div>
    </aside>
  );
}
