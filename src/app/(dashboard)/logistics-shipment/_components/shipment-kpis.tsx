'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Anchor, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Shipment } from "@/services/logistics-service";

export function ShipmentKpis({ data }: { data: Shipment[] }) {
  const stats = {
    inTransit: data.filter(s => s.status === 'in_transit' || s.status === 'picked_up').length,
    customs: data.filter(s => s.status === 'customs_clearance').length,
    deliveredToday: data.filter(s => s.status === 'delivered').length, // Mock "today"
    delayed: 0, // Mock
  };

  const kpis = [
    { title: "In Transit", value: stats.inTransit, icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Customs Pending", value: stats.customs, icon: ShieldCheck, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Arrivals (24h)", value: stats.deliveredToday, icon: Anchor, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "On-Time Performance", value: "98.4%", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${kpi.bg}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
