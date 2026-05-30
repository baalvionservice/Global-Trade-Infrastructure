
'use client';

/**
 * @file auctions/[id]/page.tsx
 * @description Institutional Reverse Auction Bid Room.
 * Features real-time price decay, participant heatmaps, and competitive pressure visualization.
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  ChevronLeft,
  Activity,
  History,
  Trophy,
  ArrowRight,
  Flame,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Bid {
  id: string;
  bidder: string;
  amount: number;
  timestamp: string;
  savings: number;
}

export default function AuctionBidRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('04:12:44');
  const [currentBest, setCurrentBest] = useState(42.50);

  useEffect(() => {
    // Simulated live auction pulse
    setTimeout(() => {
      setBids([
        { id: '1', bidder: 'Global Power Systems', amount: 42.50, timestamp: '14:22:12', savings: 11.4 },
        { id: '2', bidder: 'SinoEnergy Node', amount: 43.10, timestamp: '14:21:45', savings: 10.2 },
        { id: '3', bidder: 'Vietnam PV Batching', amount: 44.20, timestamp: '14:20:10', savings: 8.5 },
      ]);
      setLoading(false);
    }, 1000);

    const interval = setInterval(() => {
       // Simulate dynamic best bid decay
       if (Math.random() > 0.8) {
          setCurrentBest(prev => Math.max(40.10, prev - 0.10));
       }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Synchronizing Bid Node...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-4 text-[10px] font-black uppercase tracking-wide text-muted-foreground">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Auctions
          </Button>
          <div className="flex items-center gap-5">
             <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground">Auction Room</h2>
             <Badge variant="outline" className="uppercase font-black text-[10px] px-4 py-1.5 border-2 bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse rounded-full shadow-sm">
                LIVE_BIDDING: {id}
             </Badge>
          </div>
          <p className="text-muted-foreground font-medium italic max-w-2xl">Mandate: <span className="font-bold text-foreground">Q4 Lithium Battery Cell Procurement</span> (500,000 Units)</p>
        </div>
        
        <div className="flex gap-4">
           <Button variant="outline" className="font-black h-12 px-8 text-[10px] uppercase tracking-widest border-2 shadow-sm bg-background rounded-2xl">
              <History className="mr-2 h-4 w-4" /> Audit Ledger
           </Button>
           <Button variant="destructive" className="font-black h-12 px-8 text-[10px] uppercase tracking-widest shadow-2xl rounded-2xl">
              <Lock className="mr-2 h-4 w-4" /> Terminate Room
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
           {/* MAIN AUCTION CLOCK & BEST BID */}
           <Card className="shadow-2xl border-none bg-primary text-white relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125">
                 <Timer className="h-64 w-64 brightness-0 invert" />
              </div>
              <CardContent className="p-16 relative z-10 flex flex-col items-center text-center space-y-8">
                 <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-widest opacity-60">Auction Finality Window</p>
                    <p className="text-4xl font-black tabular-nums tracking-tighter">{timeLeft}</p>
                 </div>
                 
                 <div className="grid sm:grid-cols-2 gap-20 w-full max-w-2xl">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Current Floor Price</p>
                       <p className="text-4xl font-black text-emerald-400 tracking-tighter">{formatCurrency(currentBest)}</p>
                       <p className="text-[8px] font-bold opacity-40 uppercase">USD PER UNIT (FOB)</p>
                    </div>
                    <div className="space-y-1 border-l border-white/10 pl-10">
                       <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Savings Yield</p>
                       <p className="text-4xl font-black text-indigo-300 tracking-tighter">11.4%</p>
                       <p className="text-[8px] font-bold opacity-40 uppercase">VS MARKET BASELINE</p>
                    </div>
                 </div>

                 <div className="w-full max-w-xl space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="opacity-60">Bid Density</span>
                       <span className="text-emerald-400 flex items-center gap-2"><Zap className="h-3 w-3" /> High Competition</span>
                    </div>
                    <Progress value={84} className="h-1.5 bg-white/10" />
                 </div>
              </CardContent>
           </Card>

           {/* LIVE BID LOG */}
           <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
                 <CardTitle className="text-sm font-black uppercase tracking-wide">Real-Time Bid Stream</CardTitle>
                 <Activity className="h-5 w-5 text-primary opacity-30 animate-pulse" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    <AnimatePresence initial={false}>
                       {bids.map((bid, i) => (
                          <motion.div 
                            key={bid.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-8 flex items-center justify-between group hover:bg-primary/[0.01] transition-colors"
                          >
                             <div className="flex items-center gap-8">
                                <div className="h-12 w-12 rounded-2xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                   <Gavel className="h-6 w-6 text-primary opacity-60" />
                                </div>
                                <div className="space-y-1.5">
                                   <p className="font-black text-lg uppercase tracking-tighter leading-none">{bid.bidder}</p>
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Handshake ID: {bid.id} • {bid.timestamp} UTC</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-2xl font-black text-foreground tracking-tighter">{formatCurrency(bid.amount)}</p>
                                <Badge className="bg-emerald-500 text-emerald-950 text-[8px] font-black uppercase border-none px-2 h-5 mt-1">-{bid.savings}% DELTA</Badge>
                             </div>
                          </motion.div>
                       ))}
                    </AnimatePresence>
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* PARTICIPANT HEATMAP PANEL */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125">
                 <Flame className="h-48 w-48 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Users className="h-5 w-5 text-white" />
                    Bidding Heatmap
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <p className="text-base font-bold italic leading-relaxed opacity-90">
                    "Auction Oracle: 8 institutional suppliers are active. Competitive pressure is currently peaking in the APAC sector. Suggest extending window if floor drops below $40.00."
                 </p>
                 <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Active Participants</span>
                       <span className="text-sm font-black uppercase text-emerald-300">8 NODES</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Bid Frequency</span>
                       <span className="text-sm font-black uppercase">4.2 / Min</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none rounded-2xl">
                    ADJUST BIDDING RULES
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Market Comparison</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-8">
                 {[
                   { label: 'Spot Price Avg', val: '$48.10', icon: TrendingDown },
                   { label: 'Platform Record', val: '$41.20', icon: Trophy },
                   { label: 'Sovereign Match', val: '99.8%', icon: ShieldCheck }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className="p-2.5 rounded-xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors"><stat.icon className="h-4 w-4 text-primary" /></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-xl font-black tracking-tighter">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all cursor-pointer">
              <Lock className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary transition-all duration-500" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-widest text-foreground">Anti-Shill Protocol</p>
                 <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic px-4">
                    "All bids are cryptographically resolved. Autonomous collusion detection is monitoring intra-cluster behavior to ensure fair market value."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}

