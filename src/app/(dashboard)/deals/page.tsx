'use client';

import { useEffect, useState } from 'react';
import { getDeals, Deal } from '@/services/deal-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Loader2, MessageSquare, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { PATHS } from '@/lib/paths';

export default function DealsListPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    getDeals()
      .then(setDeals)
      .finally(() => setLoading(false));
  }, []);

  const filteredDeals = deals.filter(d => 
    d.productName.toLowerCase().includes(search.toLowerCase()) ||
    d.id.toLowerCase().includes(search.toLowerCase()) ||
    (d.buyerName || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.sellerName || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    active: "bg-blue-500/10 text-blue-600 border-blue-200",
    negotiating: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    finalized: "bg-green-500/10 text-green-600 border-green-200",
  };

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Deal Room</h2>
          <p className="text-muted-foreground">Manage active negotiations and finalize trade terms with counterparties.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search deals, products, or parties..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="h-10 px-4 cursor-pointer hover:bg-muted">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Badge>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="shadow-none border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Counterparty</TableHead>
                <TableHead>Last Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                    No active deals found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeals.map((deal) => (
                  <TableRow 
                    key={deal.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`${PATHS.DEALS}/${deal.id}`)}
                  >
                    <TableCell className="font-mono text-xs">{deal.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{deal.productName}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{deal.rfqId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{deal.sellerName}</div>
                      <div className="text-xs text-muted-foreground">Seller</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground italic">
                      {deal.lastMessage}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[deal.status]}>
                        {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(deal.updatedAt ?? Date.now()), { addSuffix: true })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </main>
  );
}
