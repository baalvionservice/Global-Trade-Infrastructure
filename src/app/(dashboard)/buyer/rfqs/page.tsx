'use client';

import { useEffect, useState } from 'react';
import { getRfqs, RFQ } from '@/services/rfq-service';
import { AdaptiveDataView } from '@/components/shared/adaptive-data-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Loader2, Zap, Box, MapPin, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { PATHS } from '@/lib/paths';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDeviceClass } from '@/hooks/use-device-class';
import { useRouter } from 'next/navigation';

export default function BuyerRfqsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { isMobile } = useDeviceClass();
  const router = useRouter();

  useEffect(() => {
    getRfqs()
      .then(setRfqs)
      .finally(() => setLoading(false));
  }, []);

  const filteredRfqs = rfqs.filter(r => 
    (r.productName?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (r.id?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const columns = [
    { header: 'ID', accessorKey: 'id', className: 'font-mono text-xs w-[120px]' },
    { header: 'Product', accessorKey: 'productName', className: 'font-black uppercase' },
    { 
      header: 'Volume', 
      accessorKey: 'quantity',
      cell: (row: RFQ) => `${row.quantity?.value || row.quantity} ${row.quantity?.unit || row.unit}`
    },
    { 
      header: 'Target Price', 
      accessorKey: 'targetPrice',
      cell: (row: RFQ) => `${row.currency || 'USD'} ${(row.targetPrice || 0).toLocaleString()}`
    },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: (row: RFQ) => (
        <Badge variant="secondary" className="capitalize text-[10px] font-bold px-3">
          {row.status}
        </Badge>
      )
    },
  ];

  return (
    <main className="space-y-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className={cn(
            "font-black tracking-tight text-foreground uppercase leading-none",
            isMobile ? "text-2xl" : "text-3xl"
          )}>Sourcing Pipeline</h2>
          <p className="text-sm text-muted-foreground font-medium italic">Broadcast procurement signals to the institutional network.</p>
        </div>
        <Button asChild size={isMobile ? "lg" : "default"} className="font-black uppercase tracking-widest shadow-xl rounded-2xl">
          <Link href={`${PATHS.BUYER_RFQS}/new`}>
            <Plus className="mr-2 h-4 w-4" /> Initiate Sourcing
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
          <Input 
            placeholder="Search by product signature..." 
            className="pl-12 h-12 bg-background border-2 rounded-2xl text-sm font-bold shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Ledger...</p>
        </div>
      ) : (
        <AdaptiveDataView 
          columns={columns as any} 
          data={filteredRfqs} 
          onRowClick={(row) => router.push(`${PATHS.BUYER_RFQS}/${row.id}`)}
          renderMobileCard={(row) => (
            <div className="bg-background border-2 rounded-2xl overflow-hidden shadow-md mb-4 group active:scale-[0.98] transition-all">
               <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/5"><Box className="h-4 w-4 text-primary" /></div>
                        <span className="font-black text-sm uppercase tracking-tight">{row.productName}</span>
                     </div>
                     <Badge className="text-[8px] font-black uppercase border-none h-5 px-2 bg-muted text-muted-foreground">{row.status}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Price Threshold</p>
                        <p className="text-sm font-black text-primary">{row.currency || 'USD'} {(row.targetPrice || 0).toLocaleString()}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Target Node</p>
                        <div className="flex items-center gap-1">
                           <MapPin className="h-3 w-3 text-primary opacity-40" />
                           <p className="text-[11px] font-bold uppercase">{row.deliveryCountry || 'Global'}</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-muted/30">
                     <div className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase">
                        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Score: {row.flags?.quality_score || 90}%</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}</span>
                     </div>
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest">DETAILS</span>
                  </div>
               </div>
            </div>
          )}
        />
      )}
    </main>
  );
}
