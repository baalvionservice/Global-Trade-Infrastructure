
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrderById, updateOrderStatus, getOrderDocuments, Order, OrderDocument, OrderStatus } from '@/services/order-service';
import { getEscrows } from '@/services/escrow-service';
import { OrderStatusTimeline } from '../_components/order-status-timeline';
import { OrderDocuments } from '../_components/order-documents';
import { GatewayPayment } from '../_components/gateway-payment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Loader2, Package, User, Building, Calendar, DollarSign, ArrowRight, Wallet, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PATHS } from '@/lib/paths';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [docs, setDocs] = useState<OrderDocument[]>([]);
  const [escrowId, setEscrowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (typeof id !== 'string') return;
    
    const fetchData = async () => {
      const [orderData, docData, escrows] = await Promise.all([
        getOrderById(id),
        getOrderDocuments(id),
        getEscrows()
      ]);
      
      setOrder(orderData);
      setDocs(docData);
      
      const linkedEscrow = escrows.find(e => e.orderId === id);
      if (linkedEscrow) setEscrowId(linkedEscrow.id);
      
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, newStatus);
      setOrder(updated);
      toast({ title: "Status Updated", description: `Order is now ${newStatus}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update order status." });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <Button onClick={() => router.push(PATHS.ORDERS)} className="mt-4">Return to Orders</Button>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.ORDERS)} className="-ml-2">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to List
          </Button>
          <div className="flex items-center gap-3">
             <h2 className="text-3xl font-bold tracking-tight">Order {order.id}</h2>
             <Badge variant="outline" className="uppercase font-bold text-[10px]">{order.status}</Badge>
          </div>
          <p className="text-muted-foreground">Created on {format(new Date(order.createdAt ?? Date.now()), "MMMM d, yyyy")}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           {order.status === 'pending' && (
             <Button onClick={() => handleStatusUpdate('confirmed')} disabled={updating} className="font-bold">
                Confirm Order Terms
             </Button>
           )}
           <Button variant="outline" size="sm" className="font-bold">Help & Disputes</Button>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-8 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Execution Progress</h3>
        <OrderStatusTimeline status={order.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-none border">
          <CardHeader>
            <CardTitle className="text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div className="flex gap-3">
                     <Package className="h-5 w-5 text-primary shrink-0" />
                     <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Product & Quantity</p>
                        <p className="font-semibold">{order.product}</p>
                        <p className="text-sm text-muted-foreground">{order.quantity.toLocaleString()} Units</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <DollarSign className="h-5 w-5 text-primary shrink-0" />
                     <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Commercial Value</p>
                        <p className="font-bold text-xl">${order.total.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">UNIT PRICE: ${order.price}</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-4 border-l pl-8 border-muted">
                  <div className="flex gap-3 text-sm">
                     <Building className="h-5 w-5 text-primary shrink-0" />
                     <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Institutional Seller</p>
                        <p className="font-semibold">{order.sellerName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">ID: {order.sellerId}</p>
                     </div>
                  </div>
                  <div className="flex gap-3 text-sm">
                     <User className="h-5 w-5 text-primary shrink-0" />
                     <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Buying Principal</p>
                        <p className="font-semibold">{order.buyerName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">ID: {order.buyerId}</p>
                     </div>
                  </div>
               </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
               <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">Last Ledger Sync</p>
                    <p className="text-sm font-medium">{format(new Date(order.updatedAt ?? Date.now()), "PPP p")}</p>
                  </div>
               </div>
               <Button variant="link" size="sm" className="text-primary font-bold gap-1">
                 Full Audit Log <ArrowRight className="h-3 w-3" />
               </Button>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-1 space-y-6">
           <Card className="bg-primary text-primary-foreground border-none shadow-lg overflow-hidden">
              <CardContent className="p-6 space-y-4">
                 <div className="flex items-center justify-between">
                    <h4 className="font-black uppercase text-[10px] tracking-wide opacity-80">Next Execution Step</h4>
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                 </div>
                 {order.status === 'pending' ? (
                   <p className="text-sm font-medium">Verify terms and confirm order to initiate financial provisioning.</p>
                 ) : order.status === 'confirmed' ? (
                   <div className="space-y-4">
                      <p className="text-sm font-medium">Order confirmed. Funds must now be authorized for platform escrow.</p>
                      <Button variant="secondary" disabled={!escrowId} className="w-full font-black text-[10px] py-6 shadow-sm disabled:opacity-50" onClick={() => escrowId && router.push(`${PATHS.ESCROW}/${escrowId}`)}>
                         <Wallet className="mr-2 h-4 w-4" /> {escrowId ? 'AUTHORIZE ESCROW FUNDING' : 'ESCROW PENDING PROVISION'}
                      </Button>
                   </div>
                 ) : order.status === 'processing' || order.status === 'shipped' ? (
                   <div className="space-y-4">
                      <p className="text-sm font-medium">Logistics are active. Monitor real-time corridor telemetry.</p>
                      <Button variant="secondary" className="w-full font-black text-[10px] py-6 shadow-sm" onClick={() => router.push(PATHS.LOGISTICS_SHIPMENT)}>
                         <Truck className="mr-2 h-4 w-4" /> TRACK SHIPMENT
                      </Button>
                   </div>
                 ) : (
                   <p className="text-sm italic opacity-70">Order execution complete. Documentation archived in vault.</p>
                 )}
              </CardContent>
           </Card>

           {String((order as { paymentStatus?: string }).paymentStatus) !== 'confirmed' && (
             <GatewayPayment order={order} onPaid={setOrder} />
           )}

           <OrderDocuments documents={docs} />
        </div>
      </div>
    </main>
  );
}
