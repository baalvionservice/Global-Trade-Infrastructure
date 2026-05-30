
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Ship, 
  BarChart3, 
  ArrowUpRight,
  Loader2,
  Anchor,
  Compass,
  Zap,
  Activity,
  Waves,
  Scale,
  Landmark,
  ShieldAlert
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { seaRouteIntelligenceService, SeaRoute, RiskZone } from '@/services/sea-route-intelligence-service';
import { motion } from 'framer-motion';

export default function SovereignAdminPage() {
  const [routes, setRoutes] = useState<SeaRoute[]>([]);
  const [risks, setRisks] = useState<RiskZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      seaRouteIntelligenceService.getSeaRoutes(),
      seaRouteIntelligenceService.getRiskZones()
    ]).then(([r, z]) => {
      setRoutes(r);
      setRisks(z);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing National Trade Matrix...</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Jan', vol: 4000 },
    { name: 'Feb', vol: 3000 },
    { name: 'Mar', vol: 5000 },
    { name: 'Apr', vol: 4500 },
    { name: 'May', vol: 6000 },
    { name: 'Jun', vol: 5500 },
  ];

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
           <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: NATIONAL_TRADE_COMMAND</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">National Trade Command</h2>
          <p className="text-muted-foreground font-medium italic">Sovereign oversight of jurisdictional trade corridors, customs efficiency, and regulatory finality.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3 px-6 py-3 bg-background rounded-full border-2 shadow-sm text-xs font-black uppercase tracking-widest text-indigo-700 border-indigo-200">
              <Waves className="h-4 w-4" />
              Corridor Sync: ACTIVE
           </div>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest hover:scale-105 transition-transform bg-primary">
              <ShieldCheck className="mr-2 h-4 w-4" /> EXPORT SOVEREIGN AUDIT
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Jurisdictional Volume', val: '$4.2B', sub: '+12.4% YoY', icon: TrendingUp, color: 'text-green-600' },
          { title: 'Customs Efficiency', val: '94.8%', sub: 'Auto-Clearance Rate', icon: Scale, color: 'text-blue-600' },
          { title: 'Active Trade Lanes', val: routes.length, sub: 'Verified Corridors', icon: Anchor, color: 'text-primary' },
          { title: 'Regulatory Signals', val: risks.filter(r => r.active).length, sub: 'Immediate Review', icon: AlertTriangle, color: 'text-orange-600' },
        ].map(stat => (
          <Card key={stat.title} className="shadow-lg border-2 border-primary/5 bg-background hover:border-primary/20 transition-all rounded-2xl group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{stat.title}</CardTitle>
              <div className="p-2 rounded-xl bg-muted/50 group-hover:bg-primary/5 transition-colors">
                 <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-black tracking-tighter">{stat.val}</div>
              <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter opacity-60 italic">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-none border-2 bg-background overflow-hidden flex flex-col h-full rounded-2xl">
          <CardHeader className="bg-muted/10 border-b pb-8 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-wide">National Trade Velocity</CardTitle>
              <CardDescription className="text-xs font-medium mt-1">Aggregate import/export throughput across all jurisdictional platform nodes.</CardDescription>
            </div>
            <BarChart3 className="h-6 w-6 text-primary opacity-20" />
          </CardHeader>
          <CardContent className="pt-8 px-6 h-[450px]">
             <ChartContainer config={{ vol: { label: "Throughput", color: "hsl(var(--primary))" } }}>
                <AreaChart data={chartData}>
                   <CartesianGrid vertical={false} strokeDasharray="3 3" className="opacity-50" />
                   <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-[10px] font-black" />
                   <YAxis tickLine={false} axisLine={false} className="text-[10px] font-black" tickFormatter={v => `$${v/1000}k`} />
                   <ChartTooltip content={<ChartTooltipContent />} />
                   <Area type="monotone" dataKey="vol" stroke="var(--color-vol)" fill="var(--color-vol)" fillOpacity={0.1} strokeWidth={5} />
                </AreaChart>
             </ChartContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <ShieldCheck className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4">
                    <Activity className="h-5 w-5 text-white" />
                    Regulatory Policy
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-8">
                 <p className="text-base font-bold italic leading-relaxed opacity-90">
                    "National trade rules are currently synchronized with global AEO Tier-1 standards. Zero variance detected between ledger and policy rules."
                 </p>
                 <div className="space-y-5">
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Sanctions Oracle</span>
                       <Badge className="bg-emerald-400 text-emerald-950 text-[9px] font-black px-3 py-1 uppercase tracking-tighter border-none h-6 rounded-full">ACTIVE</Badge>
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">HS Registry</span>
                       <span className="text-xs font-black uppercase">v2024.4 STABLE</span>
                    </div>
                 </div>
                 <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl transition-all hover:scale-[1.02] bg-white text-primary border-none rounded-2xl">
                    MANAGE JURISDICTIONAL RULES
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background overflow-hidden flex flex-col rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-6 px-6 flex flex-row items-center justify-between">
                 <CardTitle className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Trade Lane Health Index</CardTitle>
                 <Compass className="h-4 w-4 text-primary opacity-30" />
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y-2">
                    {routes.map((route) => (
                       <div key={route.id} className="p-8 flex items-center justify-between group hover:bg-primary/[0.01] transition-colors">
                          <div className="flex items-center gap-5">
                             <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center border-2 shadow-inner group-hover:scale-105 transition-transform"><Activity className="h-6 w-6 text-muted-foreground opacity-40" /></div>
                             <div>
                                <p className="text-[11px] font-black uppercase tracking-tight leading-none text-foreground">{route.name}</p>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 mt-2 tracking-widest">{route.status}</p>
                             </div>
                          </div>
                          <Badge variant="outline" className={cn(
                            "text-[10px] font-black uppercase h-7 px-3 border-2 rounded-lg",
                            route.currentCongestionLevel > 60 ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-green-50 text-green-700 border-green-200"
                          )}>
                            {route.currentCongestionLevel}% Load
                          </Badge>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
