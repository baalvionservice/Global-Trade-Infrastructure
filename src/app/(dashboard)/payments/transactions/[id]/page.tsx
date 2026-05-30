'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTransactionById, Transaction } from '@/services/payment-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Loader2, CreditCard, Receipt, Calendar, ExternalLink, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function TransactionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [txn, setTxn] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id !== 'string') return;
    getTransactionById(id)
      .then(setTxn)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!txn) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-bold">Record Not Found</h2>
        <Button onClick={() => router.push('/payments/transactions')} className="mt-4">Return to Ledger</Button>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">Transaction Detail</h2>
          <Badge variant="outline" className="uppercase">{txn.id}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-none border">
          <CardHeader>
            <div className="flex items-center justify-between">
               <CardTitle className="text-lg">Audit Record</CardTitle>
               <Badge className={txn.status === 'completed' ? "bg-green-100 text-green-700" : ""}>{txn.status.toUpperCase()}</Badge>
            </div>
            <CardDescription>Verified settlement documentation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-muted/20 rounded-xl border text-center space-y-2">
               <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest">Settlement Amount</p>
               <p className="text-4xl font-black text-primary">{txn.currency} {txn.amount.toLocaleString()}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div className="flex gap-3">
                     <Receipt className="h-5 w-5 text-muted-foreground" />
                     <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Type</p>
                        <p className="font-semibold capitalize">{txn.type}</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <Calendar className="h-5 w-5 text-muted-foreground" />
                     <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Date Processed</p>
                        <p className="font-semibold">{format(new Date(txn.createdAt), "PPPP p")}</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex gap-3">
                     <CreditCard className="h-5 w-5 text-muted-foreground" />
                     <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Reference ID</p>
                        <p className="font-semibold">{txn.id}</p>
                     </div>
                  </div>
                  {txn.orderId && (
                    <div className="flex gap-3">
                       <ExternalLink className="h-5 w-5 text-primary" />
                       <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase">Linked Order</p>
                          <Button variant="link" className="p-0 h-auto font-semibold text-primary" onClick={() => router.push(`/orders/${txn.orderId}`)}>
                             {txn.orderId}
                          </Button>
                       </div>
                    </div>
                  )}
               </div>
            </div>

            <Separator />

            <div>
               <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Description</p>
               <p className="text-sm leading-relaxed">{txn.description}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="shadow-none border bg-primary text-primary-foreground border-none">
              <CardHeader>
                 <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Security Audit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="h-10 w-10 opacity-50" />
                    <p className="text-xs leading-relaxed opacity-90">
                       This transaction has been cryptographically signed and verified by the Baalvion Institutional Ledger.
                    </p>
                 </div>
                 <Button variant="secondary" className="w-full text-xs font-bold">Download Proof of Settlement</Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border border-dashed p-6 text-center">
              <CardContent className="p-0 space-y-3">
                 <p className="text-xs text-muted-foreground">Need a tax invoice for this transaction?</p>
                 <Button variant="outline" className="w-full text-xs">Generate Tax Invoice</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
