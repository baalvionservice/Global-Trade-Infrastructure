'use client';

/**
 * @file marketplace/seller/[id]/page.tsx
 * @description Public seller storefront — listings, trust score, trade stats, reviews (PDF Module 1).
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { marketplaceService, MarketplaceListing } from '@/services/marketplace-service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, Store, Star, ArrowRight, Boxes, Globe, TrendingUp, Clock, Scale } from 'lucide-react';

const STATS = [
  { label: 'Lifetime GMV', val: '$248M', icon: TrendingUp },
  { label: 'On-Time Delivery', val: '98.4%', icon: Clock },
  { label: 'Dispute Rate', val: '0.3%', icon: Scale },
  { label: 'Avg Response', val: '2.1h', icon: Globe },
];

const REVIEWS = [
  { buyer: 'Helios Energy (US)', rating: 5, note: 'Flawless execution on a 12-container order. Documentation was immaculate.' },
  { buyer: 'Continental Grid (DE)', rating: 5, note: 'Consistent quality across repeat orders. Escrow released same-day on delivery.' },
  { buyer: 'AswaPower (UAE)', rating: 4, note: 'Strong product. Lead time ran two days long but communication was excellent.' },
];

export default function SellerStorefrontPage() {
  const { id } = useParams();
  const router = useRouter();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id !== 'string') return;
    marketplaceService.getSellerListings(id).then((l) => { setListings(l); setLoading(false); });
  }, [id]);

  if (loading) {
    return <div className="flex h-[80vh] flex-col items-center justify-center gap-4"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading storefront…</p></div>;
  }

  const seller = listings[0];
  const name = seller?.companyName || 'Institutional Partner';
  const trust = seller?.trustScore || 820;

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      {/* Header */}
      <Card className="border-2 rounded-2xl bg-background overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/15 to-muted" />
        <CardContent className="p-6 -mt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-end gap-6">
              <div className="h-28 w-28 rounded-2xl bg-background border-4 shadow-xl flex items-center justify-center"><Store className="h-12 w-12 text-primary opacity-60" /></div>
              <div className="space-y-2 pb-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black uppercase tracking-tighter">{name}</h1>
                  {seller?.isVerified !== false && <ShieldCheck className="h-6 w-6 text-emerald-600" />}
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-indigo-600 text-[9px] font-black uppercase px-3 h-6 border-none">{seller?.sellerTier || 'Platinum'} Tier</Badge>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{seller?.originCountry || 'China'} • Verified Exporter</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Trust Finality</p>
              <p className="text-4xl font-black text-primary tabular-nums tracking-tighter">{trust}<span className="text-base opacity-40">/1000</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t">
            {STATS.map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="flex items-center gap-2 text-[8px] font-black uppercase text-muted-foreground opacity-60"><s.icon className="h-3 w-3" /> {s.label}</div>
                <p className="text-2xl font-black tracking-tighter tabular-nums">{s.val}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Listings */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Active Listings</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {listings.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-2 rounded-2xl bg-background hover:border-primary/50 transition-all group cursor-pointer h-full" onClick={() => router.push(`/marketplace/listing/${l.id}`)}>
                  <CardContent className="p-6 space-y-4">
                    <div className="aspect-video rounded-2xl bg-muted border-2 flex items-center justify-center"><Boxes className="h-10 w-10 text-primary opacity-20" /></div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{l.category}</span>
                      <h3 className="text-lg font-black uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">{l.title}</h3>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-black text-primary tabular-nums">{formatCurrency(l.basePrice || 0, l.currency)}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Verified Reviews</h2>
          <div className="space-y-4">
            {REVIEWS.map((r) => (
              <Card key={r.buyer} className="border-2 rounded-2xl bg-background">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-tight">{r.buyer}</span>
                    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn('h-3.5 w-3.5', i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-muted')} />)}</div>
                  </div>
                  <p className="text-xs font-medium italic text-muted-foreground leading-relaxed">"{r.note}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
