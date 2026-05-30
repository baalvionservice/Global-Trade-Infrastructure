/**
 * @file governance/design/page.tsx
 * @description Institutional Design Governance Command Center.
 * Monitors global UI consistency, component adoption, and visual finality.
 */
'use client';

import { useDesignStore, DensityMode } from '@/design-system/store/design.store';
import { useDensity } from '@/design-system/hooks/use-density';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Palette, 
  Maximize, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Activity, 
  MousePointer2,
  Settings2,
  LayoutGrid,
  MonitorSmartphone,
  CheckCircle2,
  Dna
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function DesignGovernancePage() {
  const { density, setDensity, theme, setTheme } = useDesignStore();
  const { tokens, typography } = useDensity();

  const stats = [
    { label: 'Token Compliance', val: '99.8%', icon: ShieldCheck, color: 'text-emerald-500' },
    { label: 'A11y Score', val: 'AA (94)', icon: MousePointer2, color: 'text-blue-500' },
    { label: 'Component Re-use', val: '84.2%', icon: Layers, color: 'text-indigo-500' },
    { label: 'Render Finality', val: '12ms', icon: Activity, color: 'text-emerald-400' }
  ];

  return (
    <main className="space-y-8 pb-24">
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: UX_GOVERNANCE_ALPHA</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Design <br />Command.</h2>
          <p className="text-muted-foreground font-medium italic text-lg max-w-2xl">"Authoritative planetary oversight of institutional visual consistency, accessibility finality, and operational interaction models."</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-6 py-3 bg-background rounded-2xl border-2 border-primary/5 shadow-xl text-xs font-black uppercase tracking-widest text-primary">
              <Palette className="h-4 w-4" />
              Theme Engine: {theme.replace('institutional-', '').toUpperCase()}
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-lg border-2 border-primary/5 bg-background rounded-2xl group hover:border-primary/20 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-8 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{s.label}</CardTitle>
                  <s.icon className={cn("h-4 w-4", s.color)} />
                </CardHeader>
                <CardContent className="px-8 pb-8 pt-0">
                  <div className="text-4xl font-black tracking-tighter tabular-nums">{s.val}</div>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* DENSITY CONTROL HUB */}
        <div className="lg:col-span-8 space-y-6">
           <Card className="shadow-none border-2 bg-background rounded-2xl overflow-hidden flex flex-col">
              <CardHeader className="bg-muted/10 border-b p-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Operational Density Controls</CardTitle>
                  <CardDescription className="text-sm font-medium italic">Adjust the visual information depth based on institutional workflow requirements.</CardDescription>
                </div>
                <Maximize className="h-8 w-8 text-primary opacity-20" />
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {(['compact', 'standard', 'executive'] as DensityMode[]).map((mode) => (
                       <button
                         key={mode}
                         onClick={() => setDensity(mode)}
                         className={cn(
                           "p-6 rounded-2xl border-2 flex flex-col items-center gap-6 transition-all group relative overflow-hidden",
                           density === mode ? "bg-primary text-white border-primary shadow-2xl scale-105" : "bg-muted/5 border-primary/5 hover:border-primary/40"
                         )}
                       >
                          <div className={cn(
                            "p-4 rounded-2xl bg-white/5 border border-white/10 transition-colors group-hover:bg-white/10",
                            density === mode ? "text-white" : "text-primary opacity-60"
                          )}>
                             {mode === 'compact' ? <Zap className="h-6 w-6" /> : mode === 'standard' ? <LayoutGrid className="h-6 w-6" /> : <MonitorSmartphone className="h-6 w-6" />}
                          </div>
                          <div className="text-center">
                             <p className="text-sm font-black uppercase tracking-widest">{mode}</p>
                             <p className={cn("text-[9px] font-bold uppercase mt-1 opacity-40 italic", density === mode ? "text-white" : "text-muted-foreground")}>
                               {mode === 'compact' ? 'Bloomberg Density' : mode === 'standard' ? 'Standard Ops' : 'Macro Executive'}
                             </p>
                          </div>
                          {density === mode && <div className="absolute top-4 right-6 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
                       </button>
                    ))}
                 </div>

                 <div className="p-6 bg-muted/20 rounded-2xl border-2 border-dashed border-primary/10 space-y-8">
                    <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Interactive Token Preview</p>
                    <div className={cn("bg-background border-2 rounded-2xl transition-all shadow-inner", tokens.p)}>
                       <div className={cn("flex flex-col", tokens.gap)}>
                          <div className="flex items-center gap-4">
                             <div className={cn("rounded-lg bg-primary/10 border border-primary/20", density === 'compact' ? 'h-6 w-6' : density === 'standard' ? 'h-10 w-10' : 'h-14 w-14')} />
                             <div className="space-y-1">
                                <p className={cn("font-black uppercase tracking-tight", density === 'compact' ? 'text-xs' : 'text-xl')}>Sovereign Ledger Node</p>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Finality Confirmed</p>
                             </div>
                          </div>
                          <div className="h-px w-full bg-muted" />
                          <p className={cn("font-medium italic text-muted-foreground", density === 'compact' ? 'text-[10px]' : 'text-sm')}>
                            "Every platform component deterministically scales its padding, typography, and layout ratios based on the active density token."
                          </p>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* SIDEBAR: SYSTEM HEALTH */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <ShieldCheck className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 relative border-b border-white/10 p-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
                    UX Governance Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "Visual Audit: Systemic UI consistency is at 99.8%. Found 2 legacy components in the Treasury module. Recommend autonomous deprecation cycle."
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">A11y Pass</span>
                       <span className="text-4xl font-black text-emerald-300 tracking-tighter block mt-2">100%</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Token Sync</span>
                       <span className="text-4xl font-black text-blue-300 tracking-tighter block mt-2">LOCKED</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-lg bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    SYNC FIGMA KERNEL
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Motion Intelligence</h4>
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Transition Latency', val: '45ms', icon: Activity, color: 'text-emerald-500' },
                   { label: 'Logic Drifts', val: '0', icon: Dna, color: 'text-blue-500' },
                   { label: 'UX Interaction', val: 'Optimal', icon: Settings2, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black tracking-tighter text-foreground">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-700">
              <CheckCircle2 className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-700" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-widest text-foreground">AEO-T1 Interface Standard</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4 opacity-60">
                    "All platform interaction surfaces are compliant with the 2024 Institutional Trade UI Standard. Security signals are deterministically prioritized."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
