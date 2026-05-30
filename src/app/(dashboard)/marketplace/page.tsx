'use client';

/**
 * @file src/app/(dashboard)/marketplace/page.tsx
 * @description The Institutional Trade Discovery Hub.
 * Refactored into a high-scale procurement exchange with AI matchmaking integration.
 */

import { useEffect, useState } from 'react';
import { marketplaceService, MarketplaceListing } from '@/services/marketplace-service';
import { matchingService, MatchResult } from '@/services/matching-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Loader2, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Globe, 
  MessageSquare,
  Users,
  ShieldAlert,
  BarChart3,
  MapPin,
  Boxes,
  Database,
  Link2,
  Landmark,
  Layers,
  Sparkles,
  Activity,
  Target
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [lData, mData] = await Promise.all([
        marketplaceService.getListings(),
        matchingService.getMatches('COMP-101') 
      ]);
      setListings(lData);
      setMatches(mData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = listings.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Exchange Handshake...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      {/* STRATEGIC COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Discovery Node: GLOBAL_EX_ALPHA</p>
           </div>
           <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Trade <br />Discovery.</h2>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md" onClick={() => router.push('/discovery/radar')}>
              <Target className="mr-3 h-4 w-4" /> Opportunity Radar
           </Button>
           <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md" onClick={() => router.push('/marketplace/prices')}>
              <BarChart3 className="mr-3 h-4 w-4" /> Price Index
           </Button>
           <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all" onClick={() => router.push('/buyer/rfqs/new')}>
              <Zap className="mr-3 h-5 w-5 fill-current" /> List Procurement Mandate
           </Button>
        </div>
      </div>

      <Tabs defaultValue="discovery" className="space-y-6">
        <TabsList className="bg-background border-2 p-1.5 gap-1.5 h-12 rounded-2xl shadow-sm w-fit">
          <TabsTrigger value="discovery" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase h-full px-6 rounded-xl tracking-widest transition-all">Sourcing discovery</TabsTrigger>
          <TabsTrigger value="matchmaking" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase h-full px-6 rounded-xl tracking-widest transition-all flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> AI Matchmaking
          </TabsTrigger>
          <TabsTrigger value="signals" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase h-full px-6 rounded-xl tracking-widest transition-all" onClick={() => router.push('/discovery/signals')}>Market Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="discovery">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-6">
               {/* SEARCH ORCHESTRATOR */}
               <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                     <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground opacity-30" />
                     <Input 
                       placeholder="Resolve institutional demand, commodity signatures, or node IDs..." 
                       className="pl-14 h-12 bg-background border-2 rounded-2xl text-lg font-black tracking-tight shadow-inner focus-visible:ring-primary/20"
                       value={search}
                       onChange={(e) => setSearch(e.target.value)}
                     />
                  </div>
                  <Button variant="outline" className="h-12 w-16 border-2 rounded-2xl shadow-md bg-background shrink-0">
                     <Filter className="h-6 w-6" />
                  </Button>
               </div>

               {/* DISCOVERY LISTINGS GRID */}
               <div className="grid gap-8">
                  <AnimatePresence>
                     {filtered.map((listing, i) => (
                       <motion.div 
                         key={listing.id}
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: i * 0.05 }}
                       >
                         <Card onClick={() => router.push(`/marketplace/listing/${listing.id}`)} className="shadow-xl border-2 hover:border-primary/50 transition-all group overflow-hidden bg-background rounded-2xl cursor-pointer">
                            <CardContent className="p-0 flex flex-col sm:flex-row items-stretch">
                               <div className={cn(
                                 "w-3 shrink-0 transition-all duration-700",
                                 listing.type === 'offer' ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                               )} />
                               <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                  <div className="space-y-6 flex-1 min-w-0">
                                     <div className="flex items-center gap-4">
                                        <Badge className={cn("text-[9px] uppercase font-black px-3 h-6 border-none shadow-sm", listing.type === 'offer' ? "bg-emerald-600" : "bg-blue-600")}>{listing.type}</Badge>
                                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wide opacity-40">{listing.category} Node</span>
                                     </div>
                                     <div className="space-y-2">
                                        <h3 className="text-3xl font-black uppercase tracking-tighter leading-[0.9] text-foreground group-hover:text-primary transition-colors">{listing.title}</h3>
                                        <p className="text-base text-muted-foreground font-medium italic leading-relaxed max-w-xl">"{listing.description}"</p>
                                  </div>
                                  </div>
                                  
                                  <div className="flex flex-col items-end shrink-0 border-l-2 pl-12 border-muted/50 space-y-6">
                                     <div className="text-right space-y-1">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 leading-none">Trust Finality</p>
                                        <p className="text-4xl font-black text-primary tabular-nums tracking-tighter">{listing.trustScore}</p>
                                     </div>
                                     <div className="flex flex-col items-end">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 leading-none mb-1">Success Prob.</p>
                                        <span className="text-lg font-black text-emerald-600">{Math.round(listing.successProbability * 100)}%</span>
                                     </div>
                                     <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest text-primary border-2 border-transparent group-hover:border-primary/20 h-12 px-6 rounded-2xl transition-all">
                                        RESOLVE NODE <ArrowRight className="ml-2 h-3 w-3" />
                                     </Button>
                                  </div>
                               </div>
                            </CardContent>
                         </Card>
                       </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            </div>

            {/* INTELLIGENCE SIDEBAR */}
            <div className="lg:col-span-4 space-y-8">
               {/* AI ORACLE PANEL */}
               <Card className="shadow-md border-none bg-primary text-primary-foreground overflow-hidden relative group rounded-2xl">
                  <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                     <Sparkles className="h-64 w-64 brightness-0 invert" />
                  </div>
                  <CardHeader className="pb-6 border-b border-white/10 relative px-6 pt-6">
                     <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                        <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                        Strategy Oracle
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 relative space-y-8">
                     <p className="text-2xl font-bold italic leading-tight opacity-95 tracking-tighter">
                        "Ecosystem Pulse: Strategic rebalancing detected in the Vietnam electronics corridor. Your node is currently eligible for 12 elite discovery matches."
                     </p>
                     <div className="space-y-6">
                        {matches.slice(0, 3).map((match, i) => (
                           <div key={i} className="p-6 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between shadow-inner backdrop-blur-md transition-all hover:bg-white/20 cursor-pointer group/item">
                              <div className="space-y-1">
                                 <span className="text-xs font-black uppercase tracking-tight text-white">{match.company.name}</span>
                                 <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{match.company.country} Node</p>
                              </div>
                              <Badge className="bg-white text-primary text-[9px] font-black border-none px-3 h-6 rounded-full group-hover/item:scale-110 transition-transform">{match.matchScore}% AFFINITY</Badge>
                           </div>
                        ))}
                     </div>
                     <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-lg bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                        CALIBRATE MATCHING ENGINE
                     </Button>
                  </CardContent>
               </Card>

               {/* COMMODITY PULSE */}
               <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Market Equilibrium</h4>
                     <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="space-y-8">
                     {[
                       { label: 'Demand Velocity', val: '+18.4%', icon: TrendingUp, color: 'text-emerald-500' },
                       { label: 'Supply Resilience', val: '92.4%', icon: ShieldCheck, color: 'text-blue-500' },
                       { label: 'Settlement Finality', val: '450ms', icon: Activity, color: 'text-indigo-500' }
                     ].map(stat => (
                       <div key={stat.label} className="flex items-center justify-between group cursor-default">
                          <div className="flex items-center gap-4">
                             <div className="p-3 rounded-2xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors"><stat.icon className={cn("h-5 w-5", stat.color)} /></div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                          </div>
                          <span className="text-3xl font-black tracking-tighter tabular-nums">{stat.val}</span>
                       </div>
                     ))}
                  </div>
               </Card>

               {/* JURISDICTIONAL NODE RE-SYNC */}
               <Card className="shadow-none border-2 bg-background p-6 text-center space-y-8 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-700">
                  <Globe className="h-12 w-16 mx-auto text-muted-foreground opacity-10 group-hover:text-primary group-hover:opacity-30 transition-all duration-1000 group-hover:rotate-45" />
                  <div className="space-y-3">
                     <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Ecosystem Finality</p>
                     <p className="text-xs font-medium italic leading-relaxed px-4 opacity-60">
                        "Baalvion intelligence is currently mapping 14,240 cross-jurisdictional nodes. Zero systemic failure patterns detected in the current cycle."
                     </p>
                  </div>
                  <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background">AUDIT NETWORK TOPOLOGY</Button>
               </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
