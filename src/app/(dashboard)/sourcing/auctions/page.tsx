/**
 * @file auctions/page.tsx
 * @description Institutional Reverse Auction Terminal. 
 * High-fidelity command center for bulk commodity bidding and price discovery.
 */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Gavel, 
  Timer, 
  TrendingDown, 
  Users, 
  ShieldCheck, 
  Zap, 
  Loader2, 
  ArrowRight,
  TrendingUp,
  Trophy,
  History,
  Activity,
  Boxes,
  Flame,
  Globe
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function ReverseAuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulated institutional auction data
    setTimeout(() => {
      setAuctions([
        {
          id: 'AUC-8812',
          title: 'Q4 Lithium Battery Cell Procurement',
          targetVolume: '500,000 Units',
          currentBest: 42.50,
          originalPrice: 48.00,
          participants: 8,
          timeLeft: '04:12:44',
          status: 'live',
          savingPercent: 11.4,
          corridor: 'APAC-US',
          urgency: 'HIGH'
        },
        {
          id: 'AUC-8813',
          title: 'Industrial Steel Cold-Rolled Batch',
          targetVolume: '2,000 MT',
          currentBest: 840,
          originalPrice: 910,
          participants: 12,
          timeLeft: '12:45:00',
          status: 'live',
          savingPercent: 7.6,
          corridor: 'EU-India',
          urgency: 'NORMAL'
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Bid Room Handshake...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic node: AUCTION_COMMAND</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Dynamic <br />Discovery.</h2>
          <p className="text-xl text-muted-foreground font-medium italic max-w-2xl">Execute real-time competitive bidding sessions for high-volume institutional mandates.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md">
              <History className="mr-3 h-4 w-4" /> Finality Log
           </Button>
           <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all">
              <PlusIcon className="mr-3 h-4 w-4" /> Authorize New Auction
           </Button>
        </div>
      </div>

      {/* AUCTION KPIS */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Live Bids', val: '42', delta: '+12%', icon: Zap, color: 'text-orange-600' },
          { label: 'Active Capital', val: '$18.4M', delta: 'Settled', icon: Boxes, color: 'text-blue-600' },
          { label: 'Avg. Yield', val: '14.2%', delta: 'Market Beat', icon: TrendingDown, color: 'text-emerald-600' },
          { label: 'Finality Success', val: '99.9%', delta: 'Verified', icon: ShieldCheck, color: 'text-indigo-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-lg border-2 border-primary/5 bg-background rounded-3xl overflow-hidden group hover:border-primary/20 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-8 pt-8">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{stat.label}</CardTitle>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </CardHeader>
                <CardContent className="px-8 pb-8 pt-2">
                  <div className="text-3xl font-black tracking-tighter">{stat.val}</div>
                  <Badge variant="outline" className="mt-2 text-[8px] font-black uppercase border-none bg-muted/50">{stat.delta}</Badge>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6">
        <AnimatePresence>
          {auctions.map((auc, i) => (
            <motion.div 
              key={auc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="shadow-2xl border-2 hover:border-primary/40 transition-all rounded-2xl overflow-hidden bg-background group">
                 <CardContent className="p-0 flex flex-col lg:flex-row">
                    {/* STATUS COLUMN */}
                    <div className="lg:w-96 bg-primary p-6 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
                       <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
                          <Trophy className="h-64 w-64 brightness-0 invert" />
                       </div>
                       <div className="space-y-8 relative z-10">
                          <div className="flex items-center gap-4">
                             <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                             <Badge className="bg-white/10 text-white border-white/20 text-[9px] font-black h-6 px-4 uppercase tracking-wide backdrop-blur-md">LIVE_AUCTION_PULSE</Badge>
                          </div>
                          <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Time Finality</p>
                             <p className="text-4xl font-black tabular-nums tracking-tighter leading-none">{auc.timeLeft}</p>
                          </div>
                       </div>
                       <div className="space-y-6 pt-8 relative z-10 border-t border-white/10">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                             <span>Bid Pressure</span>
                             <span className="text-emerald-400 flex items-center gap-2"><Flame className="h-4 w-4" /> Intense</span>
                          </div>
                          <Progress value={84} className="h-1.5 bg-white/10 rounded-full shadow-inner" />
                       </div>
                    </div>
                    
                    {/* DATA COLUMN */}
                    <div className="flex-1 p-6 flex flex-col justify-between space-y-8">
                       <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="space-y-4 flex-1">
                             <div className="flex items-center gap-6">
                                <Badge className="bg-orange-600 text-white text-[9px] font-black h-6 px-3 border-none shadow-lg tracking-widest uppercase">{auc.urgency} URGENCY</Badge>
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wide opacity-40">MANDATE: {auc.id}</span>
                             </div>
                             <h3 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-[0.9] group-hover:text-primary transition-colors">{auc.title}</h3>
                             <p className="text-lg font-medium leading-relaxed italic opacity-80 border-l-4 border-primary/20 pl-8 max-w-2xl">"Bulk institutional batching for verified Tier-1 infrastructure. Delivery target: Q4 FY24."</p>
                          </div>
                          
                          <div className="flex gap-6 shrink-0 border-l-2 pl-12 border-muted/50">
                             <div className="text-right space-y-1">
                                <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60 tracking-widest">Floor Bid</p>
                                <p className="text-4xl font-black text-primary tracking-tighter tabular-nums">{formatCurrency(auc.currentBest)}</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">USD PER UNIT (FOB)</p>
                             </div>
                             <div className="text-right space-y-1 border-l-2 pl-12 border-muted/30">
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Savings Delta</p>
                                <p className="text-4xl font-black text-emerald-600 tracking-tighter tabular-nums">{auc.savingPercent}%</p>
                                <p className="text-[8px] font-bold text-emerald-600 uppercase mt-1">VS MARKET SPOT</p>
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                          {[
                            { label: 'Participants', val: `${auc.participants} Nodes`, icon: Users },
                            { label: 'Volume Profile', val: auc.targetVolume, icon: Boxes },
                            { label: 'Corridor', val: auc.corridor, icon: Globe },
                            { label: 'Security', val: 'LOCKED', icon: LockIcon }
                          ].map(stat => (
                             <div key={stat.label} className="p-5 rounded-2xl border-2 bg-muted/5 group/stat hover:border-primary/20 transition-all cursor-default">
                                <div className="flex items-center gap-3 mb-2 opacity-40 group-hover/stat:opacity-100 transition-opacity">
                                   <stat.icon className="h-4 w-4 text-primary" />
                                   <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <p className="text-sm font-black uppercase tracking-tight text-foreground">{stat.val}</p>
                             </div>
                          ))}
                       </div>

                       <div className="flex flex-col sm:flex-row justify-between items-center gap-8 pt-8 border-t-2 border-muted/50">
                          <div className="flex items-center gap-6">
                             <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                   <div key={i} className="h-10 w-10 rounded-full border-4 border-background bg-muted flex items-center justify-center text-[10px] font-black shadow-sm">P{i}</div>
                                ))}
                             </div>
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">+8 Verified Pro Nodes Active</p>
                          </div>
                          <div className="flex gap-4">
                             <Button variant="outline" className="h-14 border-2 px-6 font-black uppercase text-[11px] tracking-widest bg-background group shadow-md" onClick={() => router.push(`${PATHS.REVERSE_AUCTIONS}/${auc.id}`)}>
                                <Activity className="mr-2 h-4 w-4 group-hover:rotate-45 transition-transform" /> AUDIT BID STREAM
                             </Button>
                             <Button className="h-14 px-6 font-black uppercase text-[11px] tracking-widest shadow-lg rounded-2xl bg-primary hover:scale-[1.05] transition-all" onClick={() => router.push(`${PATHS.REVERSE_AUCTIONS}/${auc.id}`)}>
                                ENTER COMMAND ROOM <ArrowRight className="ml-3 h-4 w-4" />
                             </Button>
                          </div>
                       </div>
                    </div>
                 </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}

function PlusIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
}

function LockIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
}
