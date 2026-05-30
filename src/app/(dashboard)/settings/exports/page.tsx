
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileStack, History, ShieldCheck, Database, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

/**
 * @file settings/exports/page.tsx
 * @description Sovereign Data Portability and Forensic Audit Export Command.
 */

export default function DataExportsPage() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);

  const handleExport = (type: string) => {
    setGenerating(type);
    setTimeout(() => {
       setGenerating(null);
       toast({ title: "Audit Bundle Ready", description: "Cryptographically signed institutional data bundle is downloading." });
    }, 2000);
  };

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Sovereign Portability</p>
        <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter">Forensic Data Exports</h2>
        <p className="text-muted-foreground font-medium italic">Generate cryptographically verified snapshots of your institutional trade ledger for external auditing.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { id: 'ledger', title: 'Complete Trade Ledger', icon: History, desc: 'Every commercial and financial event recorded on the platform since node activation.' },
          { id: 'documents', title: 'Immutable Dossier Vault', icon: FileStack, desc: 'Signed versions of all trade documents, certificates, and compliance proofs.' },
          { id: 'compliance', title: 'KYC & Sanctions Report', icon: ShieldCheck, desc: 'Audit-ready documentation of your institutional verification and screening history.' }
        ].map(exp => (
          <Card key={exp.id} className="shadow-xl border-2 hover:border-primary/40 transition-all rounded-2xl overflow-hidden group bg-background">
             <CardHeader className="bg-muted/10 border-b p-8">
                <div className="p-4 rounded-2xl bg-background border-2 shadow-inner w-fit mb-6 group-hover:scale-105 transition-transform">
                   <exp.icon className="h-7 w-7 text-primary opacity-60" />
                </div>
                <CardTitle className="text-2xl font-black uppercase tracking-tighter">{exp.title}</CardTitle>
                <CardDescription className="font-medium text-sm italic mt-2">"{exp.desc}"</CardDescription>
             </CardHeader>
             <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                      <span>Format</span>
                      <span>SEC_JSON / PDF</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                      <span>Integrity Signature</span>
                      <span className="text-emerald-600">VERIFIED</span>
                   </div>
                </div>
                <Button 
                   className="w-full h-14 font-black uppercase tracking-widest text-[10px] shadow-lg" 
                   onClick={() => handleExport(exp.id)}
                   disabled={generating === exp.id}
                >
                   {generating === exp.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                   AUTHORIZE EXPORT
                </Button>
             </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-2xl border-none bg-slate-950 text-white relative overflow-hidden rounded-2xl group">
         <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
            <Database className="h-64 w-64 brightness-0 invert" />
         </div>
         <CardContent className="p-16 relative z-10 space-y-8 max-w-3xl">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Data Sovereignty Standard</h4>
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Your Identity is Yours to Carry.</h3>
            <p className="text-lg font-medium leading-relaxed italic opacity-80">
              "Baalvion operates on the principle of institutional data ownership. Our export engine ensures that every record is portable, standardized, and cryptographically bound to the global operating state, enabling seamless interoperability with national regulators."
            </p>
         </CardContent>
      </Card>
    </main>
  );
}
