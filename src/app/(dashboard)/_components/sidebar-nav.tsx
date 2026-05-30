
/**
 * @file sidebar-nav.tsx
 * @description THE GLOBAL OPERATING SYSTEM NAVIGATION RAIL.
 * Hardened: Features live status badges, workflow grouping, and singularity context awareness.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppState } from './app-state';
import { useWorkspaceStore } from '@/modules/workspace/store/workspace-store';
import { ROUTE_REGISTRY, RouteMetadata } from '@/core/routes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertTriangle, ShieldCheck, Waves, Globe, Crosshair, Scaling } from 'lucide-react';
import { PATHS } from '@/lib/paths';

interface SidebarNavProps {
  collapsed?: boolean;
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const pathname = usePathname();
  const { role } = useAppState();
  const { addTab } = useWorkspaceStore();

  // Filter routes based on institutional role authority
  const visibleRoutes = ROUTE_REGISTRY.filter(route => route.roles.includes(role));
  
  const groups: Record<string, RouteMetadata[]> = {
    'EXECUTIVE': [],
    'DISCOVERY': [],
    'SOURCING': [],
    'NEGOTIATIONS': [],
    'EXECUTION': [],
    'SUPPLIERS': [],
    'FINANCIALS': [],
    'COMPLIANCE': [],
    'INTELLIGENCE': [],
    'COLLABORATION': [],
    'AI SYSTEMS': [],
    'ADMINISTRATION': [],
    'OBSERVABILITY': [],
    'SOVEREIGN_PLATFORM': []
  };

  visibleRoutes.forEach(route => {
    if (groups[route.category]) {
       groups[route.category].push(route);
    }
  });

  const handleNavClick = (route: RouteMetadata) => {
    addTab({
      id: route.path,
      title: route.label,
      path: route.path
    });
  };

  const renderNavGroup = (category: string, items: RouteMetadata[]) => {
    if (items.length === 0) return null;

    return (
      <AccordionItem value={category} key={category} className="border-none mb-4">
        <AccordionTrigger className="py-2.5 hover:no-underline hover:bg-primary/5 rounded-xl px-4 transition-all text-left">
          <div className="flex items-center justify-between w-full pr-2">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-primary">
               {category.replace(/_/g, ' ')}
             </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2 pb-0 pl-3">
          <nav className="grid gap-1">
            {items.map((route) => {
              const isActive = pathname === route.path;
              return (
                <Link
                  key={route.path || route.label}
                  href={route.path || '#'}
                  onClick={() => handleNavClick(route)}
                  className={cn(
                    'flex items-center justify-between rounded-xl px-4 py-2.5 text-[11px] transition-all duration-200 group/link',
                    isActive 
                      ? 'bg-primary text-white font-black shadow-command scale-[1.02]' 
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5 font-bold uppercase tracking-tight'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <route.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "opacity-40 group-hover/link:opacity-100")} />
                    <span className="truncate">{route.label}</span>
                  </div>
                  {route.label === 'Audit Ledger' && (
                     <Badge className="bg-orange-600 text-white text-[8px] font-black h-4 px-1.5 border-none">LIVE</Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-3xl">
      <div className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
        <Accordion 
          type="multiple" 
          defaultValue={['EXECUTIVE', 'DISCOVERY', 'EXECUTION', 'SOVEREIGN_PLATFORM']} 
          className="w-full"
        >
          {Object.entries(groups).map(([cat, items]) => renderNavGroup(cat, items))}
        </Accordion>
      </div>

      {!collapsed && (
        <div className="p-6 border-t bg-muted/30">
           <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-background border shadow-inner">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                 <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                 <p className="text-[10px] font-black uppercase text-foreground">Sovereign Node</p>
                 <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">COSMOS_KERNEL_V10</p>
              </div>
           </div>
          <p className="text-[9px] font-black text-muted-foreground/30 uppercase text-center tracking-[0.4em]">
            BAALVION COSMOS v10.0.0
          </p>
        </div>
      )}
    </div>
  );
}
