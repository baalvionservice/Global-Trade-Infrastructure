/**
 * @file orders/page.tsx
 * @description THE ORDER EXECUTION PIPELINE.
 * Authoritative strategic command for order lifecycles, fulfillment tracking, and production synchronization.
 */
'use client';

import { useEffect, useState } from 'react';
import { orderService } from '@/services/order-service';
import { TradeOrder } from '@/types/institutional';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Activity, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  History, 
  Search, 
  Filter, 
  Loader2, 
  Boxes,
  Truck,
  CheckCircle2,
  Clock,
  Landmark,
  Plus
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderExecutionPipeline() {
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    orderService.getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const stats = [
    { label: 'Active Pipeline', val: orders.length, icon: Boxes, color: 'text-primary' },
    { label: 'Avg. Fulfillment', val: '12.4 Days', icon: Activity, color: 'text-emerald-600' },
    { label: 'Production Load', val: '84%', icon: Zap, color: 'text-orange-600' },
    { label: 'Settlement Finality', val: '99.9%', icon: ShieldCheck, color: 'text-blue-600' },
  ];

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Commercial Execution</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Order Pipeline.</h2>
          <p className="text-muted-foreground font-medium italic">High-authority management of trade mandates, fulfillment nodes, and multi-party finality.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="font-black border-2 bg-background h-14 px-8 text-[10px] uppercase tracking-widest shadow-md">
              <History className="mr-2 h-4 w-4" /> Audit Ledger
           </Button>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary">
              <Plus className="mr-2 h-4 w-4" /> Initiate Production
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <Card className="shadow-lg border-2 border-primary/5 bg-background hover:border-primary/20 transition-all rounded-3xl group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-8 pt-8">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">{s.label}</CardTitle>
                  <s.icon className={cn("h-4 w-4", s.color)} />
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="text-3xl font-black tracking-tighter tabular-nums">{s.val}</div>
                </CardContent>
             </Card>
          </motion.div>
        ))}
      </div>

      <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl">
         <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
            <div>
               <CardTitle className="text-xl font-black uppercase tracking-tighter">Execution Registry</CardTitle>
               <CardDescription className="text-xs mt-1">Real-time trace of commercial mandates across the global node mesh.</CardDescription>
            </div>
            <div className="flex gap-4">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-40" />
                  <input placeholder="Resolve Order ID..." className="h-10 w-64 bg-background border-2 rounded-xl pl-9 pr-4 text-[10px] font-bold uppercase focus:outline-none focus:border-primary/40 transition-all shadow-sm" />
               </div>
               <Button variant="outline" size="sm" className="h-10 rounded-xl border-2 font-black uppercase text-[9px]">
                  <Filter className="mr-2 h-3.5 w-3.5" /> Filter Pipeline
               </Button>
            </div>
         </CardHeader>
         <CardContent className="p-0">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-muted/30 border-b-2">
                     <tr>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Identity</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Commercial Value</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Execution State</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fulfillment</th>
                        <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Audit</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y-2">
                     {orders.map((order) => (
                        <tr key={order.id} className="group hover:bg-primary/[0.01] transition-colors border-b last:border-0 cursor-pointer" onClick={() => router.push(`${PATHS.ORDERS}/${order.id}`)}>
                           <td className="p-6">
                              <div className="flex items-center gap-6">
                                 <div className="h-14 w-14 rounded-3xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform"><Package className="h-7 w-7 text-primary opacity-60" /></div>
                                 <div className="space-y-1.5">
                                    <p className="font-black text-xl uppercase tracking-tighter leading-none">{order.product}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">ID: {order.id} • Qty: {order.quantity.toLocaleString()}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="p-6">
                              <div className="space-y-1">
                                 <p className="text-lg font-black tracking-tighter">{formatCurrency(order.totalValue, order.currency)}</p>
                                 <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Unit: {formatCurrency(order.price, order.currency)}</p>
                              </div>
                           </td>
                           <td className="p-6">
                              <Badge variant="outline" className={cn(
                                 "text-[9px] font-black uppercase h-7 px-3 border-2 rounded-full",
                                 order.status === 'delivered' ? "bg-green-50 text-green-700 border-green-200" :
                                 order.status === 'cancelled' ? "bg-red-50 text-red-700 border-red-200" : "bg-muted"
                              )}>{order.status}</Badge>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center gap-3">
                                 <div className="flex -space-x-3">
                                    <div className="h-8 w-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[10px] font-black"><Truck className="h-4 w-4 text-primary" /></div>
                                    <div className="h-8 w-8 rounded-full border-2 border-background bg-emerald-500/10 flex items-center justify-center text-[10px] font-black"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
                                 </div>
                                 <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">In Transit</span>
                              </div>
                           </td>
                           <td className="p-6 text-right">
                              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl border-2 opacity-20 group-hover:opacity-100 transition-all">
                                 <ArrowRight className="h-5 w-5" />
                              </Button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </CardContent>
      </Card>
    </main>
  );
}
