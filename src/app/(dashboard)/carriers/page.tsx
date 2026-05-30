
'use client';

/**
 * @file carriers/page.tsx
 * @description Consolidated high-fidelity Carrier Marketplace. 
 * Replaces the previous CRUD view with an institutional discovery interface.
 */

import { useEffect, useState } from 'react';
import { getCarriers, Carrier } from '@/services/carrier-service';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Loader2, Star, Globe, Clock, ArrowRight, Ship } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';

export default function LogisticsMarketplacePage() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    getCarriers()
      .then(setCarriers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = carriers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.regions.some(r => r.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Carrier Marketplace</h2>
          <p className="text-muted-foreground">Discover, compare, and book verified institutional logistics providers.</p>
        </div>
        <div className="flex items-center gap-2 bg-background p-3 rounded-lg border shadow-sm">
           <Globe className="h-5 w-5 text-primary" />
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Global Coverage</span>
              <span className="text-sm font-bold">124 Jurisdictions</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by carrier name, region, or service..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
           {[1,2,3,4].map(i => <Card key={i} className="h-48 animate-pulse shadow-none border" />)}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((carrier) => (
            <Card key={carrier.id} className="shadow-none border hover:border-primary/50 transition-all group overflow-hidden">
               <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row h-full">
                     <div className="w-full sm:w-48 bg-muted/30 flex items-center justify-center p-6 border-b sm:border-b-0 sm:border-r">
                        <div className="h-12 w-16 rounded-2xl bg-background border-2 border-primary/10 flex items-center justify-center text-2xl font-black text-primary">
                           {carrier.logo}
                        </div>
                     </div>
                     <div className="flex-1 p-6 space-y-4">
                        <div className="flex items-start justify-between">
                           <div>
                              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{carrier.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                 <div className="flex items-center text-yellow-500">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span className="text-xs font-bold ml-1">{carrier.rating}</span>
                                 </div>
                                 <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">• Institutional Verified</span>
                              </div>
                           </div>
                           <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                              Top Provider
                           </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <p className="text-[9px] text-muted-foreground uppercase font-bold">Coverage</p>
                              <p className="text-xs font-medium truncate">{carrier.regions.join(', ')}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] text-muted-foreground uppercase font-bold">Avg. Transit</p>
                              <div className="flex items-center gap-1.5">
                                 <Clock className="h-3 w-3 text-primary" />
                                 <span className="text-xs font-medium">{carrier.avgDeliveryTime}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                           <div>
                              <p className="text-[9px] text-muted-foreground uppercase font-bold">Starting from</p>
                              <p className="text-sm font-bold text-primary">${carrier.startingPrice.toLocaleString()}</p>
                           </div>
                           <Button size="sm" variant="ghost" className="text-xs font-bold" onClick={() => router.push(`${PATHS.LOGISTICS_MARKETPLACE}/${carrier.id}`)}>
                              View Services <ArrowRight className="ml-2 h-3 w-3" />
                           </Button>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card className="shadow-none border border-dashed py-20 text-center">
           <CardContent className="space-y-3">
              <Ship className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
              <h3 className="font-bold">No carriers found</h3>
              <p className="text-sm text-muted-foreground">Adjust your filters to discover other providers.</p>
           </CardContent>
        </Card>
      )}
    </main>
  );
}
