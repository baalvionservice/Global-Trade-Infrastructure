'use client';

/**
 * @file src/app/(dashboard)/suppliers/page.tsx
 * @description The Institutional Supplier Discovery Hub.
 * Bloomberg-grade registry for verified institutional sellers and industrial partners.
 */

import { useEffect, useState } from 'react';
import { supplierService } from '@/modules/suppliers/services/supplier.service';
import { SupplierProfile } from '@/modules/suppliers/types/supplier.types';
import { AdaptiveDataView } from '@/components/shared/adaptive-data-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  ShieldCheck, 
  Star, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Globe, 
  Award, 
  Leaf,
  Activity,
  Loader2,
  Filter,
  BarChart3,
  Landmark
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupplierRegistryPage() {
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    supplierService.getSuppliers().then(setSuppliers).finally(() => setLoading(false));
  }, []);

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s as any).category?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      header: 'Identity Node', 
      accessorKey: 'name', 
      cell: (row: SupplierProfile) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/5 border-2 flex items-center justify-center font-black text-primary shadow-inner">
            {row.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-black uppercase tracking-tight text-foreground">{row.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{row.id}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Sector Domain', 
      accessorKey: 'industry', 
      cell: (row: SupplierProfile) => (
        <Badge variant="outline" className="text-[9px] font-black uppercase bg-muted/50 border-2 px-3">
          {row.industry}
        </Badge>
      )
    },
    { 
      header: 'Trust Pulse', 
      accessorKey: 'trustScore', 
      cell: (row: SupplierProfile) => (
        <div className="flex items-center gap-4">
          <div className="space-y-1 flex-1 min-w-[120px]">
            <div className="flex justify-between items-center mb-1">
               <span className="text-lg font-black tabular-nums tracking-tighter">{row.trustScore}</span>
               <span className="text-[8px] font-black uppercase text-emerald-600">Stable</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${row.trustScore/10}%` }}
                className="h-full bg-primary" 
              />
            </div>
          </div>
        </div>
      )
    },
    { 
      header: 'ESG Index', 
      accessorKey: 'metrics', 
      cell: (row: SupplierProfile) => (
        <div className="flex items-center gap-2">
           <Leaf className="h-3 w-3 text-emerald-600" />
           <Badge className="bg-emerald-600 text-white text-[9px] font-black border-none px-2 h-5 shadow-sm">{row.metrics.esgScore}</Badge>
        </div>
      )
    },
    { 
      header: 'Volume Finality', 
      accessorKey: 'totalTradeVolume', 
      cell: (row: SupplierProfile) => (
        <span className="font-black text-sm tabular-nums text-primary">{formatCurrency(row.totalTradeVolume)}</span>
      ),
      className: 'text-right pr-10'
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Registry Link...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      {/* STRATEGIC HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Discovery Grid: VERIFIED_NODES</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-none">Supplier Registry.</h2>
          <p className="text-muted-foreground font-medium italic text-lg max-w-2xl">High-authority catalog of verified institutional sellers, Tier 1 manufacturing nodes, and strategic partners.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-6 py-3 bg-background rounded-2xl border-2 border-primary/5 shadow-xl text-xs font-black uppercase tracking-widest text-primary">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Ecosystem Verified: 1,240 Nodes
           </div>
        </div>
      </div>

      {/* KPI OVERVIEW */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Network Depth', val: '1,240', icon: Users, color: 'text-blue-600' },
          { label: 'Avg. Reliability', val: '94.2%', icon: ShieldCheck, color: 'text-emerald-600' },
          { label: 'Onboarding Velocity', val: '4.2 Days', icon: Activity, color: 'text-indigo-600' },
          { label: 'ESG Compliance', val: 'AAA Tier', icon: Leaf, color: 'text-emerald-500' }
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-lg border-2 border-primary/5 bg-background hover:border-primary/20 transition-all rounded-2xl group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-8 pt-8">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{stat.label}</CardTitle>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="text-4xl font-black tracking-tighter tabular-nums">{stat.val}</div>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      {/* REGISTRY DISCOVERY */}
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40" />
            <Input 
              placeholder="Search by legal identity, sector, or node hash signature..." 
              className="pl-12 h-14 bg-background border-2 rounded-2xl text-sm font-bold shadow-sm focus-visible:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="h-14 border-2 px-8 font-black uppercase text-[10px] tracking-widest bg-background shadow-md">
                <Filter className="mr-2 h-4 w-4" /> ADVANCED FILTERS
             </Button>
             <Button className="h-14 px-8 font-black uppercase text-[10px] tracking-widest shadow-2xl rounded-2xl">
                INVITE TO TENDER
             </Button>
          </div>
        </div>

        <AdaptiveDataView 
          columns={columns as any} 
          data={filtered} 
          isLoading={loading}
          onRowClick={(row) => router.push(`/company/${row.id}`)}
          renderMobileCard={(row: SupplierProfile) => (
            <Card className="border-2 shadow-2xl mb-6 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform bg-background group">
              <div className="h-1 w-full bg-primary/10 group-active:bg-primary transition-colors" />
              <CardContent className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                   <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <h3 className="font-black text-2xl uppercase tracking-tighter leading-none">{row.name}</h3>
                         <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      </div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{row.industry} • {row.jurisdiction}</p>
                   </div>
                   <Badge className="bg-emerald-600 text-white text-[9px] font-black border-none px-3 shadow-lg">ESG: {row.metrics.esgScore}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div className="p-6 rounded-2xl bg-muted/30 border-2 border-dashed space-y-2 text-center group-hover:bg-primary/5 transition-colors">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Trust Score</p>
                      <p className="text-4xl font-black text-primary tracking-tighter">{row.trustScore}</p>
                   </div>
                   <div className="p-6 rounded-2xl bg-muted/30 border-2 border-dashed space-y-2 text-center group-hover:bg-primary/5 transition-colors">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Handshakes</p>
                      <p className="text-4xl font-black text-foreground tracking-tighter">{row.activeContracts || 12}</p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                   <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-primary opacity-40" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Certified Institutional Node</span>
                   </div>
                   <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <ArrowRight className="h-5 w-5" />
                   </div>
                </div>
              </CardContent>
            </Card>
          )}
        />
      </div>

      {/* ECOSYSTEM OVERLAY */}
      <div className="p-6 rounded-2xl bg-primary text-primary-foreground relative overflow-hidden group shadow-md">
         <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
            <BarChart3 className="h-64 w-64 brightness-0 invert" />
         </div>
         <div className="relative z-10 max-w-4xl space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Identity Integrity Standard v4.2</h4>
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Sovereign Trust Fabric.</h3>
            <p className="text-xl font-medium leading-relaxed italic opacity-80">
              "Baalvion Supplier Registry uses a cryptographically resolved identity model. Every institutional node is part of the Global Knowledge Graph, ensuring 100% visibility into corporate lineage, production finality, and settlement history."
            </p>
            <div className="flex gap-16 pt-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Global Reach</p>
                  <p className="text-3xl font-black tracking-tighter text-emerald-400">124 Jurisdictions</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Active Edges</p>
                  <p className="text-3xl font-black tracking-tighter">14,240 Nodes</p>
               </div>
            </div>
         </div>
      </div>
    </main>
  );
}
