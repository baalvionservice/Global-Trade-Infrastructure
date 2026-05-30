
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Smartphone, Zap, ShieldCheck, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * @file settings/notifications/page.tsx
 * @description Multi-channel notification orchestration settings.
 */

export default function NotificationSettingsPage() {
  const { toast } = useToast();

  const handleUpdate = () => {
    toast({ title: "Routing Preferences Saved", description: "Multi-channel alerts have been synchronized." });
  };

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Operational Pulse</p>
        <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter">Alert Orchestration</h2>
        <p className="text-muted-foreground font-medium italic">Manage institutional alert routing across Email, SMS, and high-priority platform channels.</p>
      </div>

      <div className="max-w-4xl space-y-8">
        <Card className="shadow-xl border-2 rounded-2xl overflow-hidden">
           <CardHeader className="bg-muted/10 border-b p-6">
              <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
                 <Bell className="h-7 w-7 text-primary" /> Routing Matrix
              </CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              <div className="divide-y-2">
                 {[
                   { title: 'Critical Risk Alerts', icon: ShieldCheck, desc: 'Real-time notifications for sanctions hits and identity drift.' },
                   { title: 'Treasury & Settlement', icon: Zap, desc: 'Escrow funding confirmations and final release triggers.' },
                   { title: 'Logistics Milestones', icon: Globe, desc: 'Port arrival detections and customs clearance updates.' },
                   { title: 'Market Demands', icon: Store, desc: 'New high-affinity RFQ signals matching your node sector.' }
                 ].map(item => (
                    <div key={item.title} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group hover:bg-primary/[0.01] transition-colors">
                       <div className="flex items-center gap-6">
                          <div className="p-4 rounded-2xl bg-muted border-2 shadow-inner group-hover:scale-105 transition-transform">
                             {/* @ts-ignore */}
                             <item.icon className="h-6 w-6 text-primary opacity-60" />
                          </div>
                          <div className="space-y-1">
                             <p className="font-black text-lg uppercase tracking-tight">{item.title}</p>
                             <p className="text-sm font-medium text-muted-foreground italic leading-relaxed">"{item.desc}"</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-8 border-l pl-8 border-muted">
                          <div className="flex flex-col items-center gap-2">
                             <span className="text-[9px] font-black uppercase text-muted-foreground opacity-60">App</span>
                             <Switch checked />
                          </div>
                          <div className="flex flex-col items-center gap-2">
                             <span className="text-[9px] font-black uppercase text-muted-foreground opacity-60">Mail</span>
                             <Switch checked />
                          </div>
                          <div className="flex flex-col items-center gap-2">
                             <span className="text-[9px] font-black uppercase text-muted-foreground opacity-60">SMS</span>
                             <Switch />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>
        
        <div className="flex justify-end pt-4">
           <Button onClick={handleUpdate} className="h-14 px-6 font-black uppercase tracking-widest text-[11px] shadow-2xl">Finalize Routing Preferences</Button>
        </div>
      </div>
    </main>
  );
}

function Store(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
}
