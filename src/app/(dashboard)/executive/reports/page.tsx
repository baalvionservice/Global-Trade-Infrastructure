
'use client';

/**
 * @file executive/reports/page.tsx
 * @description Strategic Reporting Center for Boardroom oversight.
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Download, 
  FileStack, 
  History, 
  ShieldCheck, 
  Database, 
  Loader2, 
  ArrowRight,
  TrendingUp,
  BarChart3,
  Globe,
  Plus
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function ExecutiveReportingPage() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);

  const handleExport = (type: string) => {
    setGenerating(type);
    setTimeout(() => {
       setGenerating(null);
       toast({ title: "Strategic Report Ready", description: "Cryptographically signed institutional data bundle is downloading." });
    }, 2000);
  };

  const reportTiers = [
    { id: 'spend', title: 'Procurement Spend Analysis', icon: TrendingUp, desc: 'Detailed breakdown of capital allocation across all jurisdictional nodes.' },
    { id: 'risk', title: 'Global Exposure Audit', icon: ShieldCheck, desc: 'Forensic evaluation of geopolitical and commodity risk thresholds.' },
    { id: 'finality', title: 'Settlement Efficiency Log', icon: History, desc: 'Aggregate performance metrics for multi-currency liquidity releases.' },
  ];

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Reporting</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Boardroom Reports</h2>
          <p className="text-muted-foreground font-medium italic max-w-2xl">High-authority strategic summaries, financial audit trails, and ecosystem performance analytics.</p>
        </div>
        <div className="flex gap-4">
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary">
              <Plus className="mr-2 h-4 w-4" /> CREATE CUSTOM VIEW
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {reportTiers.map((report, i) => (
          <motion.div 
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
             <Card className="shadow-xl border-2 hover:border-primary/40 transition-all rounded-2xl overflow-hidden group bg-background">
                <CardHeader className="bg-muted/10 border-b p-6">
                   <div className="p-4 rounded-2xl bg-background border-2 shadow-inner w-fit mb-6 group-hover:scale-105 transition-transform">
                      <report.icon className="h-7 w-7 text-primary opacity-60" />
                   </div>
                   <CardTitle className="text-2xl font-black uppercase tracking-tighter">{report.title}</CardTitle>
                   <CardDescription className="font-medium text-sm italic mt-2">"{report.desc}"</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                   <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                         <span>Last Generated</span>
                         <span>4h ago</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                         <span>Integrity Level</span>
                         <span className="text-emerald-600">VERIFIED</span>
                      </div>
                   </div>
                   <Button 
                      className="w-full h-12 font-black uppercase tracking-widest text-[11px] shadow-lg" 
                      onClick={() => handleExport(report.id)}
                      disabled={generating === report.id}
                   >
                      {generating === report.id ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Download className="h-5 w-5 mr-2" />}
                      AUTHORIZE EXPORT
                   </Button>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <Card className="shadow-2xl border-none bg-slate-950 text-white relative overflow-hidden rounded-2xl group">
         <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
            <BarChart3 className="h-64 w-64 brightness-0 invert" />
         </div>
         <CardContent className="p-16 relative z-10 space-y-8 max-w-3xl">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Global Audit Standard v4.2</h4>
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Unified Data Perspective.</h3>
            <p className="text-lg font-medium leading-relaxed italic opacity-80">
              "Baalvion Reporting Engine synthesizes cross-domain signals into boardroom-ready intelligence. Our forensic audit methodology ensures that every report is cryptographically bound to the global operating state, providing absolute finality for institutional stakeholders."
            </p>
         </CardContent>
      </Card>
    </main>
  );
}

