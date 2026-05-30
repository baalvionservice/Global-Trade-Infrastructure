'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskOverview } from "@/services/admin-risk-service";
import { DollarSign, ShieldAlert, Lock, AlertTriangle, Activity } from "lucide-react";

export function RiskKpiCards({ data }: { data: RiskOverview }) {
  const kpis = [
    { title: "Total Platform Volume", value: `$${(data.totalVolume / 1000000000).toFixed(2)}B`, icon: DollarSign, color: "text-primary" },
    { title: "Active Escrows", value: data.activeEscrows, icon: Lock, color: "text-blue-600" },
    { title: "High-Risk Users", value: data.highRiskUsers, icon: ShieldAlert, color: "text-red-600" },
    { title: "Disputed Orders", value: data.disputedOrders, icon: AlertTriangle, color: "text-orange-600" },
    { title: "Flagged Transactions", value: data.flaggedTransactions, icon: Activity, color: "text-purple-600" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
