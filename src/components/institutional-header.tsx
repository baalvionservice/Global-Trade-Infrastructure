'use client';

import Link from 'next/link';
import { BaalvionLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChevronDown, Menu, Globe, ShieldCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { PATHS } from '@/lib/paths';

/**
 * @file institutional-header.tsx
 * @description FEDERAL-GRADE NAVIGATION for the public institutional OS landing.
 * Hardened: Standardized Link href validation and safe iteration.
 */
const navLinks = [
  { href: PATHS.PLATFORM, label: 'Platform' },
  { 
    label: 'Solutions',
    subLinks: [
      { href: PATHS.SOLUTIONS_BANKS, label: 'For Banks' },
      { href: PATHS.SOLUTIONS_GOV, label: 'For Governments' },
      { href: PATHS.SOLUTIONS_ENTERPRISES, label: 'For Enterprises' },
      { href: PATHS.SOLUTIONS_LOGISTICS, label: 'For Logistics' },
    ]
  },
  { href: PATHS.INTELLIGENCE_HUB, label: 'Intelligence' },
  { href: PATHS.ABOUT, label: 'About' },
];

export function InstitutionalHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950 bg-opacity-95 backdrop-blur-xl">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between mx-auto px-6 md:px-12">
        <Link href={PATHS.HOME || '/'} className="flex items-center gap-4 group">
          <div className="p-1.5 bg-primary/5 border border-primary/20 transition-all group-hover:border-primary/50">
             <BaalvionLogo className="h-8 w-8 text-primary" />
          </div>
          <span className="font-black text-2xl uppercase tracking-tighter text-white">Baalvion</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          {navLinks.map((link) =>
            link.subLinks ? (
              <DropdownMenu key={link.label}>
                <DropdownMenuTrigger className="group inline-flex h-10 w-max items-center justify-center px-4 transition-colors hover:text-primary focus:outline-none">
                    {link.label}
                    <ChevronDown className="ml-2 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-40" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-none border-2 border-white/5 bg-slate-900 text-slate-100 shadow-3xl p-2 min-w-[240px]">
                  {link.subLinks.map((subLink) => (
                    <DropdownMenuItem key={subLink.label} asChild className="rounded-none px-4 py-3 font-bold text-[10px] uppercase tracking-widest focus:bg-primary/20">
                      <Link href={subLink.href || '#'}>{subLink.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button key={link.label} variant="ghost" asChild className="font-black text-slate-500 hover:text-primary hover:bg-transparent px-4 transition-all">
                <Link href={link.href || '#'}>
                  {link.label}
                </Link>
              </Button>
            )
          )}
        </nav>

        <div className="flex items-center gap-6">
          <Link href={PATHS.LOGIN || '/login'} className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-primary transition-colors hidden lg:flex items-center gap-2">
            <Globe className="h-3 w-3" aria-hidden="true" /> Institutional Login
          </Link>
          <Button size="lg" className="font-black h-12 px-8 bg-white text-slate-950 rounded-none shadow-2xl hidden sm:flex hover:bg-slate-200" asChild>
            <Link href={PATHS.ACCESS_REQUEST || '#'}>Access Portal</Link>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-none border border-white/10 h-11 w-11" aria-label="Open navigation menu">
                <Menu className="h-6 w-6 text-white" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 border-l border-white/10 bg-slate-950 overflow-hidden">
              <div className="h-20 flex items-center px-10 border-b border-white/5">
                 <span className="font-black text-xl uppercase tracking-tighter text-white">Menu</span>
              </div>
              <div className="flex flex-col gap-0 p-4">
                {navLinks.map((link) =>
                  link.subLinks ? (
                     <Collapsible key={link.label} className="w-full">
                        <CollapsibleTrigger className="group flex w-full items-center justify-between py-6 px-6 font-black uppercase tracking-widest text-sm hover:bg-white/5 text-slate-400">
                            {link.label}
                            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180 opacity-40" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden space-y-1 pb-4">
                          {link.subLinks.map((subLink) => (
                            <Link key={subLink.label} href={subLink.href || '#'} className="flex h-12 items-center pl-12 pr-6 font-bold text-[11px] uppercase tracking-tight text-slate-500 hover:text-primary hover:bg-white/5">
                              {subLink.label}
                            </Link>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href || '#'}
                      className="py-6 px-6 font-black uppercase tracking-widest text-sm hover:bg-white/5 text-slate-400 block"
                    >
                      {link.label}
                    </Link>
                  )
                )}
                <div className="flex flex-col gap-4 mt-12 border-t border-white/5 pt-12 px-6">
                   <Button size="lg" className="h-16 font-black uppercase tracking-widest text-xs rounded-none bg-white text-slate-950" asChild>
                     <Link href={PATHS.ACCESS_REQUEST || '#'}>Onboard Institution</Link>
                   </Button>
                   <Button size="lg" variant="outline" className="h-16 border-white/10 font-black uppercase tracking-widest text-xs rounded-none text-white" asChild>
                    <Link href={PATHS.LOGIN || '/login'}>Institutional Login</Link>
                   </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
