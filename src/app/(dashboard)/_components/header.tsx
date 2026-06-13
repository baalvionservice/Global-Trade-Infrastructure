/**
 * @file header.tsx
 * @description Standardized high-trust header for the Baalvion OS.
 * Hardened: Fixed Link href validation and institutional logout route.
 */
'use client';

import { BaalvionLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { Menu, UserCircle, ShieldCheck, Zap, Activity, Globe, Landmark, ChevronDown, Command } from 'lucide-react';
import { useAppState } from './app-state';
import { SidebarNav } from './sidebar-nav';
import { getPersona, getPersonaHome } from '@/core/personas';
import { getOrgTypeLabel } from '@/core/organizations';
import { PATHS } from '@/lib/paths';
import { NotificationCenter } from '@/components/notification-center';
import { DemoControl } from './demo-control';
import { CommandPalette } from '@/components/command-palette';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDeviceClass } from '@/hooks/use-device-class';
import { useAppStore } from '@/store/use-app-store';

export function DashboardHeader() {
  const { role, orgType, isPlatformAdmin, setRole, availableRoles, logout } = useAppState();
  const { isMobile } = useDeviceClass();
  const router = useRouter();
  const setCommandPaletteOpen = useAppStore((state) => state.setCommandPaletteOpen);

  const persona = getPersona(role);
  const PersonaIcon = persona.icon;
  // Identity label: the ORGANIZATION TYPE for tenant users, the persona for platform/legacy sessions.
  const identityLabel = orgType && !isPlatformAdmin ? getOrgTypeLabel(orgType) : persona.label;
  // Cross-console switching is a PLATFORM-administration privilege only (super_admin / platform_owner).
  // Every other authority is locked to its own console — no "become any role" lens in production.
  const canSwitchPersona = isPlatformAdmin;

  // Switching persona moves you into that persona's own console. The context's setRole is itself
  // gated (a non-god authority is a no-op), so this is defense-in-depth, not the only check.
  const switchPersona = (nextRole: typeof role) => {
    setRole(nextRole);
    router.push(getPersonaHome(nextRole));
  };

  const handleLogout = async () => {
    await logout();
    router.replace(PATHS.LOGIN || '/login');
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 flex items-center border-b bg-background/80 backdrop-blur-xl px-4 transition-all",
      isMobile ? "h-12" : "h-14 md:px-8"
    )}>
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="border-2 rounded-xl h-11 w-11 shadow-sm mr-4" aria-label="Open navigation menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs p-0 border-r-2 overflow-hidden">
            <nav className="grid gap-0 h-full">
              <div className="h-12 flex items-center px-8 border-b bg-muted/30">
                 <Link href={PATHS.DASHBOARD || '/dashboard'} className="flex items-center gap-3">
                   <BaalvionLogo className="h-6 w-6 text-primary" />
                   <span className="font-black uppercase tracking-tighter">Baalvion</span>
                 </Link>
              </div>
              <div className="p-4">
                 <SidebarNav />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      )}
      
      <div className="flex-1 flex items-center gap-6">
        <div className="flex items-center gap-4">
           {!isMobile && <div className="h-8 w-1 bg-primary rounded-full" />}
           <div className="flex items-center gap-3 min-w-0">
             {!isMobile && <PersonaIcon className={cn('h-6 w-6 shrink-0', persona.accent)} />}
             <div className="flex flex-col leading-none min-w-0">
               <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter text-foreground truncate max-w-[150px] md:max-w-none">
                {identityLabel}
               </h1>
               {!isMobile && (
                 <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[260px] hidden md:block">
                   {persona.tagline}
                 </span>
               )}
             </div>
           </div>
        </div>
        
        {!isMobile && (
          <div className="hidden lg:flex items-center gap-6">
             <button 
               className="flex items-center gap-3 px-5 py-2 bg-muted/30 hover:bg-muted/50 rounded-2xl border-2 transition-all group"
               onClick={() => setCommandPaletteOpen(true)}
             >
                <Command className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Search Commands</span>
                <kbd className="text-[9px] font-mono opacity-40">⌘K</kbd>
             </button>
             <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full border-2 border-primary/10 text-[9px] font-black uppercase tracking-wide text-primary shadow-inner">
                <Zap className="h-3 w-3" /> System v4.2 Stable
             </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {!isMobile && (
          <div className="hidden xl:flex gap-3 mr-2">
             <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all" onClick={() => router.push(PATHS.EXECUTIVE_COMMAND)} aria-label="Executive command center">
                <Zap className="h-5 w-5 text-primary" />
             </Button>
             <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all" onClick={() => router.push(PATHS.FIELD_OPERATIONS)} aria-label="Field operations">
                <Activity className="h-5 w-5 text-primary" />
             </Button>
          </div>
        )}
        
        {!isMobile && <div className="h-10 w-px bg-border hidden md:block" />}
        
        {!isMobile && <DemoControl />}
        <NotificationCenter />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-3 px-2 md:px-4 h-11 md:h-12 rounded-2xl border-2 shadow-sm hover:border-primary/40 transition-all bg-background">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                 <UserCircle className="h-4.5 w-4.5 text-primary" />
              </div>
              {!isMobile && (
                <div className="flex flex-col items-start leading-none">
                   <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Alexander Chen</span>
                   <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1 opacity-60">Verified Node</span>
                </div>
              )}
              <ChevronDown className="h-3.5 w-3.5 opacity-30" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 rounded-2xl border-2 shadow-2xl p-2 mt-2">
            <DropdownMenuLabel className="text-[10px] font-black uppercase opacity-60 px-4 py-3 tracking-widest">Operational Context</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Cross-persona switching is a sovereign/platform god-view privilege. Every other
                authority is locked to its own console — no "become any role" lens. */}
            {canSwitchPersona ? (
              <>
                <div className="p-1 space-y-1 max-h-[40vh] overflow-y-auto">
                   <p className="text-[8px] font-black text-muted-foreground uppercase tracking-wide px-3 mb-2 opacity-40">Enter Persona Console</p>
                   {availableRoles.map((r) => (
                     <DropdownMenuItem key={r} onClick={() => switchPersona(r)} className="rounded-xl px-4 py-3 cursor-pointer group">
                        <div className="flex items-center gap-3 w-full">
                           <Landmark className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                           <span className="text-xs font-bold group-hover:text-primary transition-colors">{r}</span>
                           {role === r && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                        </div>
                     </DropdownMenuItem>
                   ))}
                </div>
                <DropdownMenuSeparator />
              </>
            ) : (
              <div className="px-4 py-3">
                 <div className="flex items-center gap-3">
                    <PersonaIcon className={cn('h-4 w-4', persona.accent)} />
                    <div className="flex flex-col leading-tight">
                       <span className="text-xs font-bold">{persona.label}</span>
                       <span className="text-[9px] text-muted-foreground uppercase tracking-wide opacity-60">Authority Locked</span>
                    </div>
                 </div>
              </div>
            )}
            <DropdownMenuSeparator />
            <div className="p-1 space-y-1">
               <DropdownMenuItem className="rounded-xl px-4 py-3" onClick={() => router.push(PATHS.PROFILE)}>
                  <span className="text-xs font-semibold">Institutional Profile</span>
               </DropdownMenuItem>
               <DropdownMenuItem className="rounded-xl px-4 py-3" onClick={() => router.push(PATHS.DOCUMENTS)}>
                  <span className="text-xs font-semibold">Immutable Vault</span>
               </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
               onSelect={(e) => { e.preventDefault(); void handleLogout(); }}
               className="text-red-600 font-black uppercase text-[10px] py-4 hover:bg-red-50 tracking-wide rounded-xl px-4 justify-center flex cursor-pointer"
            >
               TERMINATE SESSION
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CommandPalette />
    </header>
  );
}
