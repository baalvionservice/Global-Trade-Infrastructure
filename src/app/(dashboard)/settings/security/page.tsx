
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ShieldCheck, Lock, Fingerprint } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ActiveSessionsCard } from './active-sessions';

/**
 * @file settings/security/page.tsx
 * @description Institutional Security Controls and MFA orchestration.
 */

export default function SecuritySettingsPage() {
  const { toast } = useToast();

  const handleUpdate = () => {
    toast({ title: "Security State Updated", description: "Node-level encryption parameters synchronized." });
  };

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Identity Protection</p>
        <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter">Security Controls</h2>
        <p className="text-muted-foreground font-medium italic">Configure node-level encryption, multi-factor authentication, and privileged access protocols.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
           <Card className="shadow-xl border-2 rounded-2xl">
              <CardHeader className="bg-muted/10 border-b p-6">
                 <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
                    <Fingerprint className="h-7 w-7 text-primary" /> Multi-Factor Authentication
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                 <div className="flex items-center justify-between p-6 rounded-2xl border-2 bg-muted/5">
                    <div className="space-y-1">
                       <p className="font-black text-sm uppercase">Hardware Token (FIDO2)</p>
                       <p className="text-xs text-muted-foreground">Required for all high-value treasury movements.</p>
                    </div>
                    <Switch checked />
                 </div>
                 <div className="flex items-center justify-between p-6 rounded-2xl border-2 bg-muted/5">
                    <div className="space-y-1">
                       <p className="font-black text-sm uppercase">Biometric Session Pinning</p>
                       <p className="text-xs text-muted-foreground">Tie operational sessions to hardware fingerprint.</p>
                    </div>
                    <Switch checked />
                 </div>
              </CardContent>
           </Card>

           <Card className="shadow-xl border-2 rounded-2xl">
              <CardHeader className="bg-muted/10 border-b p-6">
                 <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
                    <Lock className="h-7 w-7 text-primary" /> Node-Level Encryption
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                 <div className="space-y-6">
                    <p className="text-sm font-medium italic opacity-80 leading-relaxed">
                       "Baalvion uses AES-256-GCM for all institutional data fabric storage. Individual trade dossiers are cryptographically keyed to your organization node."
                    </p>
                    <div className="p-5 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[10px] shadow-inner border border-white/5">
                       <p className="text-white/40 mb-2 border-b border-white/5 pb-1">CURRENT_CIPHER_SUITE</p>
                       ECDHE-RSA-AES256-GCM-SHA384 (Verified)
                    </div>
                 </div>
                 <Button onClick={handleUpdate} className="h-12 px-8 font-black uppercase tracking-widest text-[10px]">RE-KEY ORGANIZATION NODE</Button>
              </CardContent>
           </Card>
        </div>

        <div className="space-y-8">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125">
                 <ShieldCheck className="h-48 w-48 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-8 py-8">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-3">
                    <Lock className="h-5 w-5 text-white" />
                    Security Posture
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 relative space-y-6">
                 <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase opacity-60">Status</span>
                    <p className="text-3xl font-black tracking-tighter text-emerald-300">HARDENED</p>
                 </div>
                 <p className="text-xs font-medium leading-relaxed opacity-90">"All platform nodes are compliant with SOC 2 Type II and ISO 27001 standards. Zero unpatched vulnerabilities detected in the current cycle."</p>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[9px] tracking-widest bg-white text-primary border-none">VIEW SECURITY AUDIT</Button>
              </CardContent>
           </Card>

           <ActiveSessionsCard />
        </div>
      </div>
    </main>
  );
}
