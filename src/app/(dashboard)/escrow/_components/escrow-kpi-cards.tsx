'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, CheckCircle2, History, AlertTriangle } from "lucide-react";
import { Escrow } from "@/services/escrow-service";

export function EscrowKpiCards({ escrows }: { escrows: Escrow[] }) {
  const stats = {
    totalLocked: escrows
      .filter(e => e.status === 'funded' || e.status === 'in_transit' || e.status === 'delivered')
      .reduce((sum, e) => sum + e.amount, 0),
    activeCount: escrows.filter(e => !['released', 'refunded'].includes(e.status)).length,
    releasedCount: escrows.filter(e => e.status === 'released').length,
    disputedCount: escrows.filter(e => e.status === 'disputed').length,
  };

  const items = [
    { title: "Total Locked Liquidity", value: `$${stats.totalLocked.toLocaleString()}`, icon: Lock, color: "text-primary" },
    { title: "Active Escrow Trades", value: stats.activeCount, icon: History, color: "text-blue-600" },
    { title: "Settled & Released", value: stats.releasedCount, icon: CheckCircle2, color: "text-green-600" },
    { title: "Active Disputes", value: stats.disputedCount, icon: AlertTriangle, color: "text-orange-600" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title} className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {item.title}
            </CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
