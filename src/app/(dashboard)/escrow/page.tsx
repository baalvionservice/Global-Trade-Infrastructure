'use client';

import { useEffect, useState } from 'react';
import { getEscrows, Escrow } from '@/services/escrow-service';
import { EscrowTable } from './_components/escrow-table';
import { EscrowKpiCards } from './_components/escrow-kpi-cards';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2, ShieldCheck } from 'lucide-react';

export default function EscrowDashboardPage() {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getEscrows()
      .then(setEscrows)
      .finally(() => setLoading(false));
  }, []);

  const filtered = escrows.filter(e => 
    e.id.toLowerCase().includes(search.toLowerCase()) ||
    e.orderId.toLowerCase().includes(search.toLowerCase()) ||
    e.sellerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Escrow Control Center</h2>
          <p className="text-muted-foreground">Manage institutional trust and trade liquidity orchestration.</p>
        </div>
        <div className="flex items-center gap-2 bg-background p-3 rounded-lg border shadow-sm">
           <ShieldCheck className="h-5 w-5 text-green-600" />
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Security Status</span>
              <span className="text-sm font-bold">Protocol Active</span>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <EscrowKpiCards escrows={escrows} />
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID, Order, or Counterparty..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="shrink-0">
          <Filter className="mr-2 h-4 w-4" /> Filter by Status
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <EscrowTable data={filtered} />
      )}
    </main>
  );
}
