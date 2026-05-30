/**
 * @file governance/security/page.tsx
 * @description THE IDENTITY COMMAND CENTER.
 * Authoritative strategic observatory for Institutional IAM, Trust Fabric, and Tenant Isolation.
 */
'use client';

import { useEffect, useState } from 'react';
import { iamService } from '@/modules/security/services/iam.service';
import { tenantService } from '@/modules/security/services/tenant.service';
import { useSecurityStore } from '@/modules/security/store/security.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database, Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShieldCheck, 
  Fingerprint, 
  Lock, 
  Zap, 
  Activity, 
  Users, 
  Globe, 
  History, 
  Loader2, 
  ArrowRight,
  ShieldAlert,
  Key,
  Server,
  Network,
  Radio,
  Search,
  ChevronRight
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function IdentityCommandCenter() {
  const { threatLevel, updateThreatLevel, isSyncing, setSyncing, setTenants, tenants } = useSecurityStore();
  const [identities, setIdentities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    setSyncing(true);
    const [iData, tData] = await Promise.all([
      iamService.getIdentities(),
      tenantService.getTenants()
    ]);
    setIdentities(iData);
    setTenants(tData);
    setSyncing(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Establishing Identity Handshake...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8 pb-24">
      {/* SECURITY HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className={cn(
               "h-2 w-2 rounded-full animate-pulse",
               threatLevel === 'STABLE' ? 'bg-emerald-500' : 'bg-red-500'
             )} />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: IDENTITY_CORE_A1</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Identity <br />Command.</h2>
          <p className="text-muted-foreground font-medium italic text-lg max-w-2xl">"Authoritative planetary oversight of institutional access, multi-tenant boundaries, and trust finality."</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl border-2 border-white/5 shadow-2xl text-xs font-black uppercase tracking-widest group cursor-pointer" onClick={() => updateThreatLevel(threatLevel === 'STABLE' ? 'ELEVATED' : 'STABLE')}>
              <ShieldAlert className={cn("h-4 w-4 transition-colors", threatLevel === 'STABLE' ? 'text-emerald-400' : 'text-red-500')} />
              Threat State: {threatLevel}
           </div>
           <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all">
              <Zap className="mr-3 h-5 w-5 fill-current" /> Provision Identity Node
           </Button>
        </div>
      </div>

      {/* SECURITY KPI GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Sessions', val: '1,240', delta: 'Stable', icon: Activity, color: 'text-blue-500' },
          { label: 'Network Finality', val: '99.98%', delta: 'Verified', icon: ShieldCheck, color: 'text-emerald-500' },
          { label: 'Auth Latency', val: '124ms', delta: 'Optimal', icon: Zap, color: 'text-indigo-500' },
          { label: 'Trust Drift', val: '0.002%', delta: 'Minimal', icon: Fingerprint, color: 'text-primary' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-none border-2 border-primary/5 bg-background rounded-2xl overflow-hidden group hover:border-primary/40 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-8 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{kpi.label}</CardTitle>
                  <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="text-4xl font-black tracking-tighter tabular-nums">{kpi.val}</div>
                  <Badge variant="outline" className="mt-2 text-[8px] font-black uppercase border-none bg-muted/50">{kpi.delta}</Badge>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* TENANT BOUNDARY MONITOR */}
        <div className="lg:col-span-8 space-y-6">
           <Card className="shadow-none border-2 bg-background rounded-2xl overflow-hidden flex flex-col">
              <CardHeader className="bg-muted/10 border-b p-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Sovereign Tenant Fabric</CardTitle>
                  <CardDescription className="text-sm font-medium italic">Active isolation boundaries for verified institutional nodes.</CardDescription>
                </div>
                <Globe className="h-8 w-8 text-primary opacity-20" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {tenants.map((tenant) => (
                       <div key={tenant.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:bg-primary/[0.01] transition-colors">
                          <div className="flex items-center gap-8 flex-1 min-w-0">
                             <div className="h-12 w-16 rounded-2xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                <Landmark className="h-8 w-8 text-primary opacity-60" />
                             </div>
                             <div className="space-y-1.5 min-w-0">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground truncate">{tenant.institutionName}</h3>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                   <span>Cluster: {tenant.clusterNode}</span>
                                   <span>•</span>
                                   <span>Residency: {tenant.dataResidency}</span>
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-6 shrink-0">
                             <div className="text-right space-y-1">
                                <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Boundary State</p>
                                <Badge variant="outline" className={cn(
                                   "text-[9px] font-black uppercase h-6 px-3 border-2 rounded-full",
                                   tenant.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                                )}>{tenant.status}</Badge>
                             </div>
                             <Button variant="ghost" size="icon" className="h-14 w-14 rounded-3xl border-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="h-6 w-6" />
                             </Button>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
              <div className="bg-muted/10 p-5 border-t-2 text-center">
                 <Button variant="link" className="font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary">MANAGE TENANT REGISTRY</Button>
              </div>
           </Card>
        </div>

        {/* SIDEBAR: RISK & IDENTITY */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Key className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Radio className="h-5 w-5 text-white animate-pulse" />
                    Identity Sentinel
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "Security Oracle: Multi-node identity drift detected in the AP-Southeast cluster. Variance index: 0.04%. System has transitioned to high-trust gating mode."
                 </p>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Audit Pass</span>
                       <span className="text-4xl font-black text-emerald-300 tracking-tighter block mt-2">100%</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Consensus</span>
                       <span className="text-4xl font-black text-blue-300 tracking-tighter block mt-2">SECURE</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-lg bg-white text-primary border-none rounded-2xl hover:scale-[1.02] transition-transform">
                    RE-SYNC IDENTITY FABRIC
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identity Health</h4>
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'ABAC Gating', val: 'ENFORCED', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Identity Drift', val: '0.002%', icon: Fingerprint, color: 'text-blue-500' },
                   { label: 'Admin Finality', val: '450ms', icon: Database, color: 'text-indigo-500' }
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

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-8 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-700">
              <History className="h-12 w-16 mx-auto text-muted-foreground opacity-10 group-hover:text-primary group-hover:opacity-30 transition-all duration-1000 group-hover:rotate-[-45deg]" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-muted-foreground">Access Audit Replay</p>
                 <p className="text-xs font-medium italic leading-relaxed px-4 opacity-60">
                    "Launch high-fidelity session replays for privileged administrative overrides. Every state mutation is cryptographically signed."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background">OPEN AUDIT VAULT</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}

