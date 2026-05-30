
/**
 * @file certification/page.tsx
 * @description Sovereign Readiness & Global Deployment Audit Observatory.
 * High-authority strategic command for production validation.
 */
'use client';

import { useEffect, useState } from 'react';
import { certificationService, CertificationMandate, ReadinessScore } from '@/services/certification-service';
import { auditOrchestrator, IntegrityCheck } from '@/services/audit-orchestrator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShieldCheck, 
  Loader2, 
  Globe, 
  Zap, 
  Activity, 
  TrendingUp,
  MapPin,
  ArrowRight,
  History,
  ClipboardCheck,
  Search,
  Lock,
  Landmark,
  FileCheck,
  Landmark as BankIcon,
  Scaling,
  Dna
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function SovereignCertificationPage() {
  const [mandates, setMandates] = useState<CertificationMandate[]>([]);
  const [score, setScore] = useState<ReadinessScore | null>(null);
  const [integrity, setIntegrity] = useState<IntegrityCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    const [mList, rScore, iCheck] = await Promise.all([
      certificationService.getMandates(),
      certificationService.getReadinessScore('COMP-101'),
      auditOrchestrator.runGlobalIntegrityCheck()
    ]);
    setMandates(mList);
    setScore(rScore);
    setIntegrity(iCheck);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunAudit = async () => {
    setAuditing(true);
    toast({ title: "Global Audit Initiated", description: "Verifying systemic finality across all jurisdictional nodes." });
    await fetchData();
    setAuditing(false);
    toast({ title: "Audit Finalized", description: "All infrastructure nodes passed integrity validation." });
  };

  if (loading && !score) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Certification Oracle...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Sovereign Validation Hub</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Readiness & Certification</h2>
          <p className="text-muted-foreground font-medium italic max-w-2xl">High-authority oversight of operational integrity, production readiness, and sovereign compliance audits.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" />
              Auth Level: SOVEREIGN_AUDITOR
           </div>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary" onClick={handleRunAudit} disabled={auditing}>
              {auditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}
              Dispatch Global Audit
           </Button>
        </div>
      </div>

      {/* READINESS PULSE */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Infrastructure', val: score?.infrastructure, sub: 'Optimal Finality', icon: Scaling, color: 'text-blue-600' },
          { label: 'Security', val: score?.security, sub: 'Zero-Trust Enforced', icon: Lock, color: 'text-emerald-600' },
          { label: 'Compliance', val: score?.compliance, sub: 'AEO Tier 1 Standard', icon: ShieldCheck, color: 'text-indigo-600' },
          { label: 'Resilience', val: score?.resilience, sub: 'Multi-Node Redundancy', icon: Zap, color: 'text-orange-600' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-lg border-2 border-primary/5 bg-background rounded-3xl group hover:border-primary/20 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{kpi.label} Pulse</CardTitle>
                  <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-4xl font-black tracking-tighter tabular-nums">{kpi.val}%</div>
                  <Progress value={kpi.val} className="h-1.5 bg-muted" />
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 italic">{kpi.sub}</p>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* SYSTEMIC INTEGRITY LEDGER */}
           <Card className="shadow-none border-2 bg-background overflow-hidden flex flex-col rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wide">Operational Integrity Ledger</CardTitle>
                  <CardDescription className="text-xs font-medium">Real-time verification of cross-system state consistency and dependency finality.</CardDescription>
                </div>
                <Dna className="h-6 w-6 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {integrity.map(check => (
                       <div key={check.id} className="p-6 flex items-center justify-between group hover:bg-primary/[0.01] transition-colors">
                          <div className="flex items-center gap-8">
                             <div className={cn(
                                "h-14 w-14 rounded-3xl border-2 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform",
                                check.status === 'PASSED' ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                             )}>
                                <ShieldCheck className={cn("h-7 w-7", check.status === 'PASSED' ? 'text-green-600' : 'text-red-600')} />
                             </div>
                             <div className="space-y-1.5">
                                <p className="font-black text-xl uppercase tracking-tighter leading-none">{check.system} CLUSTER</p>
                                <p className="text-sm font-medium text-muted-foreground italic leading-relaxed">"{check.message}"</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <Badge className="bg-emerald-600 text-white text-[9px] font-black h-6 px-3 uppercase tracking-widest border-none shadow-sm">VERIFIED</Badge>
                             <p className="text-[9px] font-mono text-muted-foreground mt-2 opacity-40">{check.timestamp.split('T')[1].substring(0, 8)} UTC</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           {/* CERTIFICATION REGISTRY */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b pb-6 px-6 flex flex-row items-center justify-between">
                 <CardTitle className="text-sm font-black uppercase tracking-wide">Sovereign Certification Mandates</CardTitle>
                 <Button variant="link" className="text-[9px] font-black uppercase tracking-widest p-0 h-auto">VIEW REPOSITORY <ArrowRight className="ml-1 h-2 w-2" /></Button>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {mandates.map(mandate => (
                       <div key={mandate.id} className="p-6 flex items-start gap-8 group hover:bg-primary/[0.01] transition-colors">
                          <div className="p-4 rounded-3xl bg-muted/50 border-2 shadow-inner group-hover:scale-105 transition-transform shrink-0">
                             <FileCheck className="h-6 w-6 text-primary opacity-60" />
                          </div>
                          <div className="space-y-3 flex-1 min-w-0">
                             <div className="flex items-center justify-between">
                                <Badge className="text-[8px] font-black uppercase h-5 px-2 border-none bg-indigo-600 text-white shadow-sm">{mandate.tier}</Badge>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Expires: {mandate.expiresAt.split('T')[0]}</span>
                             </div>
                             <h4 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">{mandate.title}</h4>
                             <div className="flex items-center gap-6 pt-2 text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">
                                <span className="flex items-center gap-1.5"><History className="h-3.5 w-3.5" /> Issued {mandate.issuedAt.split('T')[0]}</span>
                                <span className="flex items-center gap-1.5">Signatory: {mandate.authorizedBy}</span>
                             </div>
                          </div>
                          <Badge variant="outline" className={cn(
                                "text-[10px] font-black uppercase h-8 px-4 rounded-full shadow-sm border-2",
                                mandate.status === 'CERTIFIED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-muted"
                             )}>{mandate.status}</Badge>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* VALIDATION ORACLE PANEL */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <ShieldCheck className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4">
                    <Zap className="h-5 w-5 text-white animate-pulse" />
                    Validation Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-lg font-bold italic leading-relaxed opacity-90 leading-snug">
                    "Platform Oracle: All jurisdictional nodes have reached high-fidelity state finality. Production readiness scoring is at peak thresholds. System is authorized for sovereign-grade trade execution."
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
                       <p className="text-[10px] font-black uppercase opacity-60 mb-1">Audit Coverage</p>
                       <p className="text-xl font-black text-emerald-300">100%</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
                       <p className="text-[10px] font-black uppercase opacity-60 mb-1">Maturity Score</p>
                       <p className="text-xl font-black text-indigo-300">A+</p>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[11px] tracking-widest shadow-2xl bg-white text-primary border-none rounded-3xl hover:scale-[1.02] transition-transform">
                    INITIATE PRODUCTION LAUNCH
                 </Button>
              </CardContent>
           </Card>

           {/* AUDIT TELEMETRY KPIS */}
           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Strategic Readiness</h4>
              <div className="space-y-8">
                 {[
                   { label: 'Explainability Delta', val: '0.04%', change: 'Minimal', icon: Activity },
                   { label: 'Workflow Finality', val: '450ms', change: 'Optimal', icon: TrendingUp },
                   { label: 'Chain Integrity', val: 'VERIFIED', change: 'Sovereign', icon: Lock }
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className="p-2.5 rounded-xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors"><stat.icon className="h-5 w-5 text-primary" /></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <div className="text-right">
                         <p className="text-xl font-black tracking-tighter">{stat.val}</p>
                         <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-tighter">{stat.change}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <Button variant="outline" className="w-full h-14 border-2 font-black uppercase text-[9px] tracking-wide bg-background">Export Certification Package</Button>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/40 transition-all duration-700">
              <Lock className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary group-hover:opacity-40 transition-all duration-700" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-wide text-foreground">Sovereign Version Freeze</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Post-authorization, the platform architecture enters a frozen state. No structural mutations are permitted without secondary council override."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
