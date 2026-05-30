'use client';

import { useEffect, useState } from 'react';
import { getWallets, Wallet } from "@/services/payment-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletIcon, Lock, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BalanceCards({ wallet: _ignored }: { wallet?: any }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWallets().then(setWallets).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <Card key={i} className="h-24 animate-pulse border" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
         <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Currency Wallets</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {wallets.map((w) => (
          <Card key={w.id} className="shadow-none border hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {w.currency} Wallet
              </CardTitle>
              <div className="p-1.5 rounded-lg bg-blue-50">
                <WalletIcon className="h-3.5 w-3.5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">
                {w.currency} {w.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-2 mt-2">
                 <span className="text-[10px] font-bold text-muted-foreground uppercase">Locked: {w.escrow.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
