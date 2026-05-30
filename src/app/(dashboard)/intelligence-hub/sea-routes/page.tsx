/**
 * @file sea-routes/page.tsx
 * @description Maritime Intelligence Dashboard for corridor health and risk oversight.
 */
'use client';

import { useEffect, useState } from 'react';
import { seaRouteIntelligenceService, SeaRoute, RiskZone, CongestionReport } from '@/services/sea-route-intelligence-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Anchor, 
  Globe, 
  ShieldAlert, 
  Zap, 
  Activity, 
  Loader2, 
  ArrowUpRight, 
  Clock, 
  Ship, 
  Waves,
  AlertTriangle,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SeaRouteIntelligencePage() {
  const [routes, setRoutes] = useState<SeaRoute[]>([]);
  const [risks, setRisks] = useState<RiskZone[]>([]);
  const [reports, setReports] = useState<CongestionReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [rData, zData, cData] = await Promise.all([
      seaRouteIntelligenceService.getSeaRoutes(),
      seaRouteIntelligenceService.getRiskZones(),
      seaRouteIntelligenceService.getCongestionReports()
    ]);
    setRoutes(rData);
    setRisks(zData);
    setReports(cData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing Maritime Telemetry...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Hub</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground">Sea Route Intelligence</h2>
          <p className="text-muted-foreground font-medium italic">Autonomous tracking of maritime corridors, port congestion, and geopolitical risk zones.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border-2 shadow-sm text-xs font-black uppercase tracking-widest text-indigo-700 border-indigo-200">
              <Waves className="h-4 w-4" />
              Oceanic Sensor Network: Online
           </div>
           <Button variant="outline" onClick={fetchData} className="bg-background border-2 font-black h-12 shadow-sm">
             <Activity className="mr-2 h-4 w-4" /> Refresh Signals
           </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        {/* CORRIDOR HEALTH LIST */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="shadow-none border bg-background overflow-hidden flex flex-col h-full">
              <CardHeader className="bg-muted/10 border-b pb-8 px-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-black uppercase tracking-wide">Active Trade Corridors</CardTitle>
                    <CardDescription className="font-medium text-xs mt-1">Real-time health and transit efficiency of primary routes.</CardDescription>
                  </div>
                  <Compass className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y">
                    {routes.map((route) => {
                       const health = seaRouteIntelligenceService.calculateRouteHealth(route, reports, risks);
                       return (
                        <div key={route.id} className="p-8 group hover:bg-primary/[0.02] transition-colors relative overflow-hidden">
                           <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-6">
                                 <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center border shadow-inner">
                                    <Ship className="h-6 w-6 text-muted-foreground" />
                                 </div>
                                 <div className="space-y-1">
                                    <p className="font-black text-lg uppercase tracking-tighter leading-none">{route.name}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Origin: {route.originNode} → Destination: {route.destinationNode}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-2xl font-black tracking-tighter">{health}%</p>
                                 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Efficiency Index</p>
                              </div>
                           </div>

                           <div className="mt-8 space-y-4 relative z-10">
                              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                 <span>Congestion Load</span>
                                 <span className={cn(route.currentCongestionLevel > 60 ? "text-orange-600" : "text-green-600")}>
                                   {route.currentCongestionLevel}% Capacity
                                 </span>
                              </div>
                              <Progress value={route.currentCongestionLevel} className="h-1.5 bg-muted" />
                           </div>
                        </div>
                       );
                    })}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* RISK & CONGESTION SIDEBAR */}
        <div className="lg:col-span-3 space-y-8">
           <Card className="shadow-lg border-none bg-primary text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                 <ShieldAlert className="h-32 w-32 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10">
                 <CardTitle className="text-xs font-black uppercase tracking-wide opacity-80 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Critical Risk Zones
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6 relative">
                 {risks.map(risk => (
                    <div key={risk.id} className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-3">
                       <div className="flex items-center justify-between">
                          <Badge className={cn(
                            "text-[8px] font-black uppercase h-5 px-2 border-none",
                            risk.severity === 'critical' ? 'bg-red-500 text-white' : risk.severity === 'high' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                          )}>
                            {risk.severity} Severity
                          </Badge>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{risk.type}</span>
                       </div>
                       <h4 className="font-black uppercase tracking-tight text-sm">{risk.name}</h4>
                       <p className="text-xs leading-relaxed opacity-80 font-medium italic">"{risk.description}"</p>
                    </div>
                 ))}
                 <Button variant="secondary" className="w-full text-[10px] font-black py-7 uppercase tracking-widest shadow-2xl">
                    View Rerouting Protocols
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border bg-background overflow-hidden">
              <CardHeader className="bg-muted/10 border-b">
                 <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Anchor className="h-4 w-4 text-primary" />
                    Node Congestion Feed
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y">
                    {reports.map(report => (
                       <div key={report.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                          <div className="space-y-1">
                             <p className="text-xs font-black uppercase tracking-tight">{report.portId}</p>
                             <p className="text-[10px] text-muted-foreground font-bold uppercase opacity-60">Status: {report.trend}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-lg font-black text-primary leading-none">+{report.delayHours}h</p>
                             <p className="text-[8px] font-black text-muted-foreground uppercase mt-1">Operational Delay</p>
                          </div>
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
