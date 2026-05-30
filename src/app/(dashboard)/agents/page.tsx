'use client';

import { useEffect, useState } from 'react';
import { getAgents, Agent, AgentType } from '@/services/agent-service';
import { getTrustBadgeConfig } from '@/services/verification-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Loader2, Star, UserCheck, ShieldCheck, ArrowRight, Info, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { cn } from '@/lib/utils';

export default function AgentMarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<AgentType | 'all'>('all');
  const router = useRouter();

  useEffect(() => {
    getAgents()
      .then(setAgents)
      .finally(() => setLoading(false));
  }, []);

  const filtered = agents.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                          a.region.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeType === 'all' || a.type === activeType;
    return matchesSearch && matchesType;
  });

  const typeLabels: Record<string, string> = {
    broker: "Customs Broker",
    inspector: "Cargo Inspector",
    logistics: "Logistics Agent"
  };

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent & Broker Marketplace</h2>
          <p className="text-muted-foreground">Hire verified institutional agents to facilitate customs, inspections, and logistics.</p>
        </div>
        <Button variant="outline" onClick={() => router.push(PATHS.AGENT_REQUESTS)}>
           View My Requests
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, region, or service..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
           {['all', 'broker', 'inspector', 'logistics'].map(type => (
             <Button 
               key={type} 
               variant={activeType === type ? 'default' : 'outline'}
               size="sm"
               className="capitalize"
               onClick={() => setActiveType(type as any)}
             >
               {type === 'all' ? 'All Services' : typeLabels[type]}
             </Button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           {[1,2,3].map(i => <Card key={i} className="h-64 animate-pulse border bg-card" />)}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => {
             // Mocking a trust score for agents for demo
             const mockScore = (agent.rating * 20); 
             const trustConfig = getTrustBadgeConfig(mockScore);

             return (
              <Card key={agent.id} className="shadow-none border hover:border-primary/50 transition-all group cursor-pointer overflow-hidden flex flex-col" onClick={() => router.push(`${PATHS.AGENTS}/${agent.id}`)}>
                <CardContent className="p-0 flex-1">
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                          <div className="h-12 w-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-lg font-black text-primary">
                            {agent.logo}
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                             <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                                <Star className="h-3 w-3 fill-current" />
                                <span className="text-[10px] font-bold ml-1">{agent.rating}</span>
                             </div>
                             <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-1.5 py-0", trustConfig.color)}>
                                {trustConfig.label}
                             </Badge>
                          </div>
                      </div>

                      <div>
                          <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{agent.name}</h3>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                            {typeLabels[agent.type]}
                          </p>
                      </div>

                      <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                            <span>Verified institutional partner</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Info className="h-3.5 w-3.5 text-blue-600" />
                            <span className="truncate">{agent.region} coverage</span>
                          </div>
                      </div>
                    </div>
                </CardContent>
                <div className="px-6 py-4 border-t bg-muted/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{agent.experience}YRS Experience</span>
                  <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary px-0 hover:bg-transparent">
                      View Profile <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Button>
                </div>
              </Card>
             );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card className="border-dashed shadow-none py-20 text-center">
           <CardContent className="space-y-3">
              <UserCheck className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
              <h3 className="font-bold">No agents found</h3>
              <p className="text-sm text-muted-foreground">Adjust your filters to discover experts in other regions.</p>
           </CardContent>
        </Card>
      )}
    </main>
  );
}
