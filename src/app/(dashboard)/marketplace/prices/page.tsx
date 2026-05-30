'use client';

/**
 * @file marketplace/prices/page.tsx
 * @description Commodity price-intelligence hub — 90-day benchmarks + "is this price fair?" tool (PDF Module 1).
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Sparkles, Activity, Scale } from 'lucide-react';

interface Commodity { name: string; category: string; price: number; unit: string; change24h: number; benchmark90d: number; }

const COMMODITIES: Commodity[] = [
  { name: 'Hot-Rolled Coil Steel', category: 'Metals', price: 612, unit: 'MT', change24h: 1.4, benchmark90d: 598 },
  { name: 'Copper Cathode', category: 'Metals', price: 9240, unit: 'MT', change24h: -0.8, benchmark90d: 9380 },
  { name: 'Solar PV Module (550W)', category: 'Energy', price: 175, unit: 'unit', change24h: -2.1, benchmark90d: 192 },
  { name: 'LFP Battery Cell (280Ah)', category: 'Energy Storage', price: 92, unit: 'cell', change24h: 0.3, benchmark90d: 96 },
  { name: 'Polyester Yarn', category: 'Textiles', price: 1.32, unit: 'kg', change24h: 0.9, benchmark90d: 1.28 },
  { name: 'Robusta Coffee', category: 'Agriculture', price: 4120, unit: 'MT', change24h: 3.2, benchmark90d: 3760 },
  { name: 'Urea (Granular)', category: 'Chemicals', price: 358, unit: 'MT', change24h: -1.1, benchmark90d: 372 },
  { name: 'EV Wiring Harness', category: 'Automotive', price: 84, unit: 'set', change24h: 0.0, benchmark90d: 85 },
];

export default function CommodityPricesPage() {
  const [sel, setSel] = useState(COMMODITIES[0].name);
  const [quote, setQuote] = useState('');

  const selected = COMMODITIES.find((c) => c.name === sel)!;
  const quoteNum = Number(quote) || 0;
  const delta = quoteNum && selected.benchmark90d ? Math.round(((quoteNum - selected.benchmark90d) / selected.benchmark90d) * 100) : 0;
  const verdict = !quoteNum ? null : delta <= -8 ? 'Excellent' : delta <= 3 ? 'Fair' : delta <= 12 ? 'Above market' : 'Overpriced';
  const verdictColor = verdict === 'Excellent' ? 'text-emerald-600' : verdict === 'Fair' ? 'text-blue-600' : verdict === 'Above market' ? 'text-amber-600' : 'text-red-600';

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="space-y-4 border-b border-primary/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Price Intelligence Node</p>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-[0.85]">Commodity<br />Benchmarks.</h1>
        <p className="text-sm text-muted-foreground font-medium max-w-2xl">90-day price benchmarks computed from real settled trades across the Baalvion network. Verify any quote against the market in seconds.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Table */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Live Market</h2>
          <div className="space-y-3">
            {COMMODITIES.map((c) => {
              const vsBench = Math.round(((c.price - c.benchmark90d) / c.benchmark90d) * 100);
              return (
                <Card key={c.name} className="border-2 rounded-2xl bg-background hover:border-primary/40 transition-all">
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{c.category}</span>
                      <p className="text-base font-black uppercase tracking-tight truncate">{c.name}</p>
                    </div>
                    <div className="flex items-center gap-8 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-[8px] font-black uppercase text-muted-foreground opacity-50">90d Avg</p>
                        <p className="text-sm font-bold tabular-nums text-muted-foreground">{formatCurrency(c.benchmark90d)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-primary tabular-nums">{formatCurrency(c.price)}<span className="text-[10px] opacity-40">/{c.unit}</span></p>
                        <p className={cn('text-[10px] font-black tabular-nums flex items-center justify-end gap-1', c.change24h >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                          {c.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{Math.abs(c.change24h)}% 24h
                        </p>
                      </div>
                      <Badge variant="outline" className={cn('text-[8px] font-black border-2 hidden md:inline-flex', vsBench <= 0 ? 'text-emerald-600 border-emerald-200' : 'text-amber-600 border-amber-200')}>{vsBench <= 0 ? '' : '+'}{vsBench}% vs avg</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Fair-price tool */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none rounded-2xl bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide opacity-80"><Sparkles className="h-4 w-4 text-yellow-400" /> Is This Price Fair?</div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Commodity</Label>
                <Select value={sel} onValueChange={setSel}>
                  <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white rounded-xl font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>{COMMODITIES.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Quoted Price ({selected.unit})</Label>
                <Input type="number" value={quote} onChange={(e) => setQuote(e.target.value)} placeholder={`${selected.benchmark90d}`} className="h-12 bg-white/10 border-white/20 text-white rounded-xl font-black text-lg placeholder:text-white/40" />
              </div>

              {verdict && (
                <div className="p-5 rounded-2xl bg-white/10 border border-white/10 space-y-2">
                  <p className={cn('text-2xl font-black uppercase tracking-tighter', verdictColor.replace('text-', 'text-').replace('600', '300'))}>{verdict}</p>
                  <p className="text-sm font-bold opacity-90">{delta <= 0 ? `${Math.abs(delta)}% below` : `${delta}% above`} the 90-day benchmark of {formatCurrency(selected.benchmark90d)}.</p>
                </div>
              )}
              {!verdict && <p className="text-xs font-medium opacity-60 italic">Enter a quote to benchmark it against {selected.benchmark90d ? formatCurrency(selected.benchmark90d) : 'the market'}.</p>}
            </CardContent>
          </Card>

          <Card className="border-2 rounded-2xl bg-background p-7 space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-muted-foreground"><Activity className="h-4 w-4 text-primary" /> Market Pulse</div>
            {[
              { label: 'Indices Tracked', val: '1,240' },
              { label: 'Settled Trades (90d)', val: '38,902' },
              { label: 'Avg Price Variance', val: '±4.1%' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</span>
                <span className="text-xl font-black tabular-nums">{s.val}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground pt-2 border-t"><Scale className="h-3.5 w-3.5" /> Benchmarks from anonymized settled transactions.</div>
          </Card>
        </div>
      </div>
    </main>
  );
}
