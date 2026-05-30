'use client';

/**
 * @file seller/listings/page.tsx
 * @description Seller listing management — live view of the seller's marketplace offers
 * (real trade-service marketplace_listings). Links to the publish-listing flow.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { marketplaceService, MarketplaceListing } from '@/services/marketplace-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn, formatCurrency } from '@/lib/utils';
import { Plus, Loader2, PackageSearch, Boxes, CheckCircle2, Tag } from 'lucide-react';

// The demo seller node (Global Power Systems). Org binding is enforced server-side.
const SELLER_ORG = 'COMP-102';

const statusColor: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  paused: 'bg-slate-100 text-slate-600 border-slate-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function SellerListingsPage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    marketplaceService.getSellerListings(SELLER_ORG)
      .then((l) => { if (!cancelled) setListings(Array.isArray(l) ? l : []); })
      .catch(() => { if (!cancelled) setListings([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const active = listings.filter((l) => String((l as any).status ?? 'active').toLowerCase() === 'active').length;

  return (
    <main className="space-y-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Seller Node · {SELLER_ORG}</p>
          <h1 className="text-4xl font-black uppercase tracking-tighter">My Listings</h1>
          <p className="text-muted-foreground font-medium italic">Manage your live offers in the global marketplace.</p>
        </div>
        <Link href="/seller/listings/new">
          <Button className="h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl">
            <Plus className="mr-2 h-4 w-4" /> New Listing
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Listings', val: listings.length, icon: Boxes, color: 'text-blue-600' },
          { label: 'Active', val: active, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Categories', val: new Set(listings.map((l) => l.category)).size, icon: Tag, color: 'text-purple-600' },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{k.label}</div>
                <div className="text-2xl font-black mt-1">{k.val}</div>
              </div>
              <k.icon className={cn('h-5 w-5', k.color)} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase tracking-widest">Offer Registry</CardTitle>
          <CardDescription>Live listings published by this seller node.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading offers…</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-center px-6">
              <PackageSearch className="h-12 w-12 text-muted-foreground opacity-20" />
              <p className="text-sm font-bold text-muted-foreground">No listings yet.</p>
              <Link href="/seller/listings/new"><Button variant="outline" className="font-bold"><Plus className="mr-2 h-4 w-4" /> Publish your first offer</Button></Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-bold">{l.title}</TableCell>
                    <TableCell><Badge variant="outline">{l.category}</Badge></TableCell>
                    <TableCell className="text-right font-black tabular-nums">{formatCurrency((l as any).price ?? (l as any).basePrice ?? 0)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('font-bold uppercase text-[10px]', statusColor[String((l as any).status ?? 'active').toLowerCase()] ?? '')}>
                        {String((l as any).status ?? 'active')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
