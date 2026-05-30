'use client';

/**
 * @file negotiations/contracts/page.tsx
 * @description Sovereign Contract Management Registry.
 * High-authority vault for finalized commercial mandates and legal templates.
 */

import { useEffect, useState } from 'react';
import { contractService, Contract, ClauseReference } from '@/services/contract-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileSignature, 
  Search, 
  Filter, 
  Plus, 
  Loader2, 
  ShieldCheck, 
  History, 
  ArrowRight,
  ChevronLeft,
  Zap,
  Lock,
  Download,
  Eye,
  FileStack,
  Landmark,
  Scale
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContractVaultPage() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const data = await contractService.getVault('COMP-101');
    setContracts(data.length > 0 ? data : [
        { 
          id: 'CTR-2201', 
          title: 'Master Supply Agreement: PV Subsystems', 
          parties: 'GPS Global ↔ Beacon Tech', 
          value: 1250000, 
          currency: 'USD',
          status: 'EXECUTED', 
          version: 1,
          clauses: [],
          createdAt: '2024-05-12T14:22:00Z',
          updatedAt: '2024-05-12T14:22:00Z',
          buyerId: 'COMP-101',
          sellerId: 'COMP-102'
        },
        { 
          id: 'CTR-2202', 
          title: 'Logistics Framework Mandate: Maersk', 
          parties: 'Baalvion ↔ Maersk Line', 
          value: 450000, 
          currency: 'USD',
          status: 'SIGNED', 
          version: 2,
          clauses: [],
          createdAt: '2024-05-10T09:12:00Z',
          updatedAt: '2024-05-10T09:12:00Z',
          buyerId: 'COMP-101',
          sellerId: 'CAR-1'
        }
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = contracts.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Contract Vault...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 bg-muted/20 min-h-screen pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Legal Finality Node</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Contract Vault</h2>
          <p className="text-muted-foreground font-medium italic">Immutable registry of commercial mandates, syndicated agreements, and sovereign legal artifacts.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="font-black border-2 bg-background h-14 px-8 text-[10px] uppercase tracking-widest shadow-md">
              <FileStack className="mr-2 h-4 w-4" /> MANAGE CLAUSES
           </Button>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary">
              <Plus className="mr-2 h-4 w-4" /> NEW MSA Node
           </Button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40" />
          <Input 
            placeholder="Resolve contract by signature, party identity, or reference hash..." 
            className="pl-12 h-14 bg-background border-2 rounded-2xl text-sm font-bold shadow-sm focus-visible:ring-primary/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid gap-6">
           <AnimatePresence>
              {filtered.map((ctr, i) => (
                <motion.div 
                  key={ctr.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="shadow-lg border-2 hover:border-primary/50 transition-all group overflow-hidden bg-background rounded-2xl">
                     <CardContent className="p-0 flex">
                        <div className={cn(
                          "w-2 shrink-0 transition-all duration-500",
                          ctr.status === 'EXECUTED' ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                        )} />
                        <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                           <div className="flex items-center gap-6 flex-1 min-w-0">
                              <div className="h-12 w-16 rounded-2xl border-2 bg-muted flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                                 <FileSignature className="h-7 w-7 text-primary opacity-60" />
                              </div>
                              <div className="space-y-2 min-w-0">
                                 <div className="flex items-center gap-4">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground truncate group-hover:text-primary transition-colors">{ctr.title}</h3>
                                    <Badge variant="outline" className={cn(
                                       "text-[9px] font-black uppercase h-6 px-3 border-2 rounded-full",
                                       ctr.status === 'EXECUTED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
                                    )}>{ctr.status}</Badge>
                                 </div>
                                 <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">ID: {ctr.id} • Signatories: {ctr.parties}</p>
                              </div>
                           </div>

                           <div className="flex items-center gap-6 shrink-0">
                              <div className="text-right space-y-1">
                                 <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 leading-none">Agreement Value</p>
                                 <p className="text-2xl font-black text-primary tracking-tighter tabular-nums">{formatCurrency(ctr.value, ctr.currency)}</p>
                              </div>
                              <div className="flex gap-3">
                                 <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <Eye className="h-5 w-5" />
                                 </Button>
                                 <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <Download className="h-5 w-5" />
                                 </Button>
                                 <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <History className="h-5 w-5" />
                                 </Button>
                              </div>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-primary text-primary-foreground relative overflow-hidden group shadow-md">
         <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
            <ShieldCheck className="h-64 w-64 brightness-0 invert" />
         </div>
         <div className="relative z-10 max-w-4xl space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Legal Engineering Standard v4.2</h4>
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Sovereign Documentation. <br />Immutable Lineage.</h3>
            <p className="text-xl font-medium leading-relaxed italic opacity-80">
              "Every contract finalized on Baalvion is cryptographically signed and version-locked. Our legal runtime ensures that operational execution remains perfectly synchronized with commercial mandates, providing 100% audit readiness for national regulators."
            </p>
            <div className="flex gap-16 pt-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase opacity-60">Signature Finality</p>
                  <p className="text-2xl font-black tracking-tighter text-emerald-400">DETERMINISTIC</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60">Clause AI Recall</p>
                  <p className="text-2xl font-black tracking-tighter">99.8%</p>
               </div>
               <div className="space-y-1 border-l pl-16 border-white/10">
                  <p className="text-[10px] font-black uppercase opacity-60">Registry Node</p>
                  <p className="text-2xl font-black tracking-tighter">VAULT_LEGAL_001</p>
               </div>
            </div>
         </div>
      </div>
    </main>
  );
}
