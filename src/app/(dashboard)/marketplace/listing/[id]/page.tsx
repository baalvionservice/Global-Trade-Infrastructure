'use client';

/**
 * @file marketplace/listing/[id]/page.tsx
 * @description Full listing detail — pricing tiers, certifications, trust-score
 * breakdown, price intelligence, and procurement actions (PDF Module 1).
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { marketplaceService, MarketplaceListing } from '@/services/marketplace-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Loader2, ShieldCheck, ArrowLeft, ArrowRight, Boxes, Globe, Clock, FileCheck,
  TrendingDown, TrendingUp, MessageSquare, Package, Bookmark, Store, Sparkles, Landmark,
} from 'lucide-react';

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (typeof id !== 'string') return;
    marketplaceService.getListingById(id).then((l) => { setListing(l); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Resolving listing node…</p>
      </div>
    );
  }
  if (!listing) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Listing not found</h2>
        <Button onClick={() => router.push('/marketplace')} className="font-black uppercase text-[10px] h-12 px-8">Back to Marketplace</Button>
      </div>
    );
  }

  const price = listing.basePrice ?? 0;
  const market = listing.marketAveragePrice ?? price;
  const delta = market ? Math.round(((price - market) / market) * 100) : 0;
  const belowMarket = delta <= 0;

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 bg-muted/20 min-h-screen">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to discovery
      </button>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* MAIN */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-600 text-[9px] uppercase font-black px-3 h-6 border-none">{listing.type}</Badge>
            <span className="text-[10px] font-black uppercase tracking-wide text-muted-foreground opacity-50">{listing.category} • HS {listing.hsCode}</span>
          </div>
          <h1 className="text-4xl md:text-4xl font-black tracking-tighter uppercase leading-[0.9]">{listing.title}</h1>

          {/* Gallery (placeholder tiles) */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-4 aspect-[16/7] rounded-2xl bg-gradient-to-br from-primary/10 to-muted border-2 flex items-center justify-center">
              <Boxes className="h-14 w-20 text-primary opacity-20" />
            </div>
            {[0, 1, 2, 3].map((i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={cn('aspect-square rounded-2xl border-2 bg-muted flex items-center justify-center transition-all', activeImg === i ? 'border-primary' : 'opacity-50 hover:opacity-100')}>
                <Package className="h-6 w-6 text-muted-foreground" />
              </button>
            ))}
          </div>

          <Card className="border-2 rounded-2xl bg-background">
            <CardContent className="p-8 space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Specification</h3>
              <p className="text-base font-medium italic leading-relaxed text-foreground/80">"{listing.description}"</p>
            </CardContent>
          </Card>

          {/* Pricing tiers */}
          <Card className="border-2 rounded-2xl bg-background">
            <CardHeader className="pb-3"><CardTitle className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Volume Pricing</CardTitle></CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid sm:grid-cols-3 gap-4">
                {(listing.pricingTiers ?? []).map((t, i) => (
                  <div key={i} className="p-5 rounded-2xl border-2 bg-muted/20 space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">≥ {t.minQty.toLocaleString()} {listing.unit}s</p>
                    <p className="text-2xl font-black text-primary tabular-nums tracking-tighter">{formatCurrency(t.price, listing.currency)}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-10 gap-y-3 mt-6 text-[11px] font-bold text-muted-foreground">
                <span className="flex items-center gap-2"><Boxes className="h-4 w-4 text-primary" /> MOQ {listing.moq?.toLocaleString()} {listing.unit}s</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Lead {listing.leadTime}</span>
                <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> {listing.originCountry}</span>
              </div>
            </CardContent>
          </Card>

          {/* Terms + certs */}
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="border-2 rounded-2xl bg-background">
              <CardContent className="p-7 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Incoterms &amp; Payment</h3>
                <div className="flex flex-wrap gap-2">{(listing.incoterms ?? []).map((t) => <Badge key={t} variant="outline" className="text-[9px] font-black border-2">{t}</Badge>)}</div>
                <div className="space-y-1.5 pt-2">{(listing.paymentTerms ?? []).map((t) => <p key={t} className="text-xs font-bold text-foreground/70 flex items-center gap-2"><Landmark className="h-3.5 w-3.5 text-primary" /> {t}</p>)}</div>
              </CardContent>
            </Card>
            <Card className="border-2 rounded-2xl bg-background">
              <CardContent className="p-7 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Certifications</h3>
                <div className="space-y-2">{(listing.certifications ?? []).map((c) => <p key={c} className="text-sm font-bold flex items-center gap-2"><FileCheck className="h-4 w-4 text-emerald-600" /> {c}</p>)}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
          {/* Price intelligence */}
          <Card className={cn('border-none rounded-2xl text-white overflow-hidden relative', belowMarket ? 'bg-emerald-600' : 'bg-amber-600')}>
            <CardContent className="p-8 space-y-3 relative">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide opacity-80"><Sparkles className="h-4 w-4" /> Price Intelligence</div>
              <p className="text-4xl font-black tabular-nums tracking-tighter">{formatCurrency(price, listing.currency)}<span className="text-base opacity-60">/{listing.unit}</span></p>
              <div className="flex items-center gap-2 text-sm font-black uppercase">
                {belowMarket ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                {Math.abs(delta)}% {belowMarket ? 'below' : 'above'} market avg ({formatCurrency(market, listing.currency)})
              </div>
            </CardContent>
          </Card>

          {/* Seller trust */}
          <Card className="border-2 rounded-2xl bg-background">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary/5 border-2 flex items-center justify-center"><Store className="h-6 w-6 text-primary" /></div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight leading-tight">{listing.companyName}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{listing.originCountry} • {listing.sellerTier} Tier</p>
                  </div>
                </div>
                {listing.isVerified && <ShieldCheck className="h-5 w-5 text-emerald-600" />}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground"><span>Trust Finality</span><span className="text-primary">{listing.trustScore} / 1000</span></div>
                <div className="h-2 rounded-full bg-muted overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(listing.trustScore / 1000) * 100}%` }} className="h-full bg-primary rounded-full" /></div>
              </div>
              <Button variant="outline" className="w-full h-11 border-2 font-black uppercase text-[10px] tracking-widest rounded-xl" onClick={() => router.push(`/marketplace/seller/${listing.companyId}`)}>
                View Storefront <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-2 rounded-2xl bg-background">
            <CardContent className="p-8 space-y-3">
              <Button className="w-full h-14 font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-lg" onClick={() => router.push('/buyer/rfqs/new')}>
                <MessageSquare className="mr-2 h-4 w-4" /> Send RFQ
              </Button>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[10px] tracking-widest rounded-2xl" onClick={() => toast({ title: 'Sample order created', description: '1–5 sample units requested. Seller notified.' })}>
                <Package className="mr-2 h-4 w-4" /> Order Samples
              </Button>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[10px] tracking-widest rounded-2xl" onClick={() => router.push('/deals')}>
                <Boxes className="mr-2 h-4 w-4" /> Open Deal Room
              </Button>
              <Button variant="ghost" className="w-full h-11 font-black uppercase text-[10px] tracking-widest text-muted-foreground" onClick={() => toast({ title: 'Added to procurement shortlist' })}>
                <Bookmark className="mr-2 h-4 w-4" /> Shortlist
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
