'use client';

import { useEffect, useState } from 'react';
import { getWallet, getTransactions, Wallet, Transaction } from '@/services/payment-service';
import { BalanceCards } from './_components/balance-cards';
import { TransactionTable } from './_components/transaction-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Download, Plus } from 'lucide-react';
import Link from 'next/link';

export default function PaymentsDashboardPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getWallet(), getTransactions()])
      .then(([w, t]) => {
        setWallet(w ?? null);
        setTransactions(t);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!wallet) return null;

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Hub</h2>
          <p className="text-muted-foreground">Manage institutional liquidity and trade settlements.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export Statement
           </Button>
           <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Deposit Funds
           </Button>
        </div>
      </div>

      <BalanceCards wallet={wallet} />

      <div className="grid gap-6">
        <Card className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <CardDescription>Latest financial activity across your account.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
               <Link href="/payments/transactions">
                 View All <ArrowRight className="ml-2 h-4 w-4" />
               </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <TransactionTable data={transactions} limit={5} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
