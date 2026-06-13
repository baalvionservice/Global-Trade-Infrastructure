/**
 * @file sidebar-nav.tsx
 * @description The global navigation rail. Comprehensive, role-aware, grouped for clean UX.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppState } from './app-state';
import { useWorkspaceStore } from '@/modules/workspace/store/workspace-store';
import { ROUTE_REGISTRY, RouteMetadata, RouteCategory, CATEGORY_ORDER } from '@/core/routes';
import { getPersona, personaAllowsPath } from '@/core/personas';
import { orgTypeAllowsPath } from '@/core/organizations';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Sections expanded by default — the high-traffic operational + governance ones. The rest stay
// collapsed (one click to open) so the rail is scannable, not a wall of links.
const DEFAULT_OPEN: RouteCategory[] = ['COMMAND', 'MARKETPLACE', 'EXECUTION', 'FINANCE', 'GOVERNANCE'];

interface SidebarNavProps {
  collapsed?: boolean;
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const pathname = usePathname();
  const { role, orgType, isPlatformAdmin } = useAppState();
  const { addTab } = useWorkspaceStore();

  // Navigation is scoped to the ORGANIZATION TYPE: each org type sees only the modules curated for
  // its surface. Platform-level authorities (super_admin / platform_owner) see the full registry.
  // Legacy sessions with no org type fall back to the persona allowlist.
  const persona = getPersona(role);
  const visibleRoutes = ROUTE_REGISTRY.filter((route) =>
    isPlatformAdmin
      ? true
      : orgType
        ? orgTypeAllowsPath(orgType, route.path)
        : personaAllowsPath(persona, route.path)
  );

  const byCategory = (cat: RouteCategory): RouteMetadata[] =>
    visibleRoutes.filter((r) => r.category === cat);

  const handleNavClick = (route: RouteMetadata) => {
    addTab({ id: route.path, title: route.label, path: route.path });
  };

  // Only render sections that actually have visible routes — never an empty header.
  const sections = CATEGORY_ORDER
    .map((c) => ({ ...c, items: byCategory(c.key) }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="flex flex-col h-full bg-background/50">
      <div className="flex-1 px-3 py-5 overflow-y-auto custom-scrollbar">
        <Accordion type="multiple" defaultValue={DEFAULT_OPEN} className="w-full space-y-1">
          {sections.map((section) => (
            <AccordionItem value={section.key} key={section.key} className="border-none">
              <AccordionTrigger className="py-2 px-3 rounded-lg hover:no-underline hover:bg-primary/5 transition-all">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                  {section.label}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-1 pl-1">
                <nav className="grid gap-0.5">
                  {section.items.map((route) => {
                    const isActive = pathname === route.path;
                    return (
                      <Link
                        key={route.path}
                        href={route.path || '#'}
                        onClick={() => handleNavClick(route)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-[12px] transition-all duration-150',
                          isActive
                            ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-primary/5 font-medium'
                        )}
                      >
                        <route.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary-foreground' : 'opacity-50')} />
                        <span className="truncate">{route.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {!collapsed && (
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {sections.reduce((n, s) => n + s.items.length, 0)} modules · {sections.length} sections
          </div>
        </div>
      )}
    </div>
  );
}
