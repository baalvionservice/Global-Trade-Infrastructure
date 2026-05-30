'use client';

import { useEffect, useState } from 'react';
import { getTransactions, Transaction } from '@/services/payment-service';
import { TransactionTable } from '../_components/transaction-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TransactionsListPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter(t => 
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.orderId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="space-y-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="-ml-2 text-muted-foreground"
          onClick={() => router.push('/payments')}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Dashboard
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Transaction Ledger</h2>
        <p className="text-muted-foreground">Historical record of all institutional settlements and fee activities.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID, Description or Order..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="shrink-0">
          <Filter className="mr-2 h-4 w-4" /> Filter by Type
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <TransactionTable data={filtered} />
      )}
    </main>
  );
}
