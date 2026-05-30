/**
 * @file seller/rfqs/page.tsx
 * @description Global Demand Signal Discovery node. 
 * High-authority marketplace for sellers to absorb institutional trade signals.
 */
'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import { rfqService, RFQ } from '@/services/rfq-service';
import { MarketplaceTable } from './_components/marketplace-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Zap, 
  Globe, 
  Loader2, 
  ArrowRight,
  Target,
  Activity,
  Boxes,
  Compass,
  Radio,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { cn, formatCurrency, getFlag } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function SellerMarketplaceDiscovery() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // In production, this targets the high-scale discovery ledger
    setTimeout(() => {
      setRfqs([
        {
          id: 'RFQ-8812',
          rfq_id: 'RFQ-8812',
          title: 'Solar PV Modules (550W) for Utility Scale Project',
          productName: 'Solar PV Modules',
          category: 'Energy',
          quantity: { value: 2000, unit: 'Units' },
          buyer: { country: 'United States', buyer_id: 'COMP-101', type: 'Institution', region: 'North America' },
          pricing: { target_price: 175, currency: 'USD', pricing_model: 'FOB' },
          logistics: { destination_port: 'Port of Long Beach', shipment_terms: 'Ocean' },
          compliance: { certifications: ['ISO 9001', 'CE', 'ESG-V'] },
          timeline: { deadline: new Date(Date.now() + 172800000).toISOString(), urgency: 'HIGH' },
          flags: { quality_score: 94 },
          engagement: { views: 124, quotes_received: 2 },
          status: 'OPEN',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          orgId: 'COMP-101'
        },
        {
          id: 'RFQ-8813',
          rfq_id: 'RFQ-8813',
          title: 'Lithium Iron Phosphate (LFP) Battery Batch',
          productName: 'LFP Batteries',
          category: 'Energy Storage',
          quantity: { value: 500, unit: 'Sets' },
          buyer: { country: 'Germany', buyer_id: 'COMP-202', type: 'Sovereign', region: 'Europe' },
          pricing: { target_price: 2400, currency: 'EUR', pricing_model: 'DDP' },
          logistics: { destination_port: 'Rotterdam Terminal', shipment_terms: 'Land' },
          compliance: { certifications: ['IEC 62133', 'UN38.3'] },
          timeline: { deadline: new Date(Date.now() + 345600000).toISOString(), urgency: 'NORMAL' },
          flags: { quality_score: 88 },
          engagement: { views: 42, quotes_received: 0 },
          status: 'OPEN',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date().toISOString(),
          orgId: 'COMP-202'
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const filtered = rfqs.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Exchange Handshake...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8 pb-24">
      {/* DISCOVERY HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">Discovery Node: GLOBAL_DEMAND_ALPHA</p>
          </div>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Demand <br />Signals.</h2>
          <p className="text-xl text-muted-foreground font-medium italic max-w-2xl leading-relaxed">
            "Absorb institutional trade requirements and respond with cryptographically secure commercial proposals."
          </p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-3 px-6 py-3 bg-background rounded-2xl border-2 border-primary/5 shadow-xl text-xs font-black uppercase tracking-widest text-primary">
              <Radio className="h-4 w-4 text-emerald-600 animate-ping" />
              Real-time Pulse Active
           </div>
           <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-xs bg-background shadow-md group">
              <Compass className="mr-3 h-4 w-4 group-hover:rotate-45 transition-transform" /> Re-Scan Network
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* DISCOVERY GRID */}
        <div className="lg:col-span-8 space-y-6">
           {/* SEARCH ORCHESTRATOR */}
           <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground opacity-30" />
                 <input 
                   placeholder="Resolve institutional demand, commodity signatures, or node IDs..." 
                   className="w-full h-12 pl-14 pr-6 bg-background border-2 rounded-2xl text-lg font-black tracking-tight shadow-inner focus:outline-none focus:border-primary/20 transition-all"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
              <div className="flex gap-3">
                 <Button variant="outline" className="h-12 border-2 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md bg-background">
                    <Filter className="mr-2 h-4 w-4" /> All Sectors
                    <ChevronDown className="ml-2 h-3 w-3 opacity-40" />
                 </Button>
                 <Button variant="outline" className="h-12 w-16 border-2 rounded-2xl shadow-md bg-background">
                    <SlidersHorizontal className="h-6 w-6" />
                 </Button>
              </div>
           </div>

           <div className="grid gap-8">
              <AnimatePresence>
                 {filtered.map((rfq, i) => (
                    <motion.div 
                      key={rfq.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                       <Card className="shadow-2xl border-2 hover:border-primary/40 transition-all group overflow-hidden bg-background rounded-2xl">
                          <CardContent className="p-0 flex flex-col md:flex-row">
                             <div className="md:w-3 bg-primary shrink-0 transition-all duration-700 group-hover:bg-indigo-600" />
                             <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-6 flex-1 min-w-0">
                                   <div className="flex items-center gap-4">
                                      <Badge className="bg-emerald-600 text-white text-[9px] font-black h-6 px-3 border-none shadow-sm uppercase tracking-widest">ACTIVE_DEMAND</Badge>
                                      <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">LEDGER_REF: {rfq.rfq_id}</span>
                                   </div>
                                   <div className="space-y-2">
                                      <h3 className="text-3xl font-black uppercase tracking-tighter leading-[0.9] text-foreground group-hover:text-primary transition-colors">
                                         {rfq.title}
                                      </h3>
                                      <p className="text-base text-muted-foreground font-medium italic leading-relaxed max-w-xl">"Requirement for {rfq.category} tier artifacts. Target finality: {rfq.quantity.value} {rfq.quantity.unit}."</p>
                                   </div>
                                </div>
                                
                                <div className="flex flex-col items-end shrink-0 border-l-2 pl-12 border-muted/50 space-y-6">
                                   <div className="text-right space-y-1">
                                      <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 leading-none">Target Unit Price</p>
                                      <p className="text-4xl font-black text-primary tabular-nums tracking-tighter">{formatCurrency(rfq.pricing.target_price)}</p>
                                      <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">USD PER UNIT (FOB)</p>
                                   </div>
                                   <div className="flex items-center gap-6">
                                      <div className="flex flex-col items-end">
                                         <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 mb-1">Time Finality</p>
                                         <span className="text-sm font-black text-foreground">48h Left</span>
                                      </div>
                                      <Button className="h-14 px-8 font-black uppercase text-[10px] tracking-widest shadow-2xl rounded-2xl bg-primary">
                                         INITIATE BID
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
        </div>

        {/* SIDEBAR: MARKET INTELLIGENCE */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="shadow-lg border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <Zap className="h-80 w-80 brightness-0 invert" />
              </div>
              <CardHeader className="pb-6 border-b border-white/10 p-6 relative">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4 text-white">
                    <Activity className="h-5 w-5 text-yellow-400 animate-pulse" />
                    Market Oracle
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-3xl font-bold italic leading-tight opacity-95 tracking-tighter">
                    "AI Analysis: Systemic demand for utility-scale energy artifacts in the North America corridor is trending +24% YoY. Bids within 5% of target price have achieved 92% finality in recent cycles."
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Opportunity Depth</span>
                       <span className="text-4xl font-black text-emerald-300 tracking-tighter block mt-2">HIGH</span>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/10 border border-white/10 shadow-inner backdrop-blur-md">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-white">Trust Margin</span>
                       <span className="text-4xl font-black text-blue-300 tracking-tighter block mt-2">942</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-14 font-black uppercase text-[12px] tracking-widest shadow-md bg-white text-primary border-none rounded-xl hover:scale-[1.02] transition-transform">
                    EXECUTE BATCH RESPONSE
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ecosystem Pulse</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Demand Velocity', val: '+18.4%', icon: TrendingUp, color: 'text-emerald-500' },
                   { label: 'Carrier Density', val: '92.4%', icon: ShipIcon, color: 'text-blue-500' },
                   { label: 'Regulatory Variance', val: 'Minimal', icon: ShieldCheck, color: 'text-indigo-500' }
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
              <Globe className="h-12 w-16 mx-auto text-muted-foreground opacity-10 group-hover:text-primary group-hover:opacity-30 transition-all duration-1000 group-hover:rotate-45" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-muted-foreground">Ecosystem Finality</p>
                 <p className="text-xs font-medium italic leading-relaxed px-4 opacity-60">
                    "Baalvion intelligence is currently mapping 14,240 cross-jurisdictional nodes. Zero systemic failure patterns detected in the current cycle."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background">AUDIT NETWORK TOPOLOGY</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}

function ShipIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.26 1.05 4.48 2.62 6"/><path d="M19 13V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6"/></svg>
}
