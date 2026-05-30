'use client';

import { useEffect, useState } from 'react';
import { EntityManager } from '@/components/shared/entity-manager';
import { EntityConfig } from '@/lib/crud-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Ship, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';

/**
 * @file shipments/page.tsx
 * @description Implementation of the Enhanced Shipments module using the generic CRUD engine.
 */

const shipmentConfig: EntityConfig = {
  name: 'shipments',
  label: 'Shipment',
  pluralLabel: 'Shipments',
  searchKey: 'destination',
  fields: [
    { name: 'origin', label: 'Origin', type: 'text', required: true, placeholder: 'e.g. Shanghai' },
    { name: 'destination', label: 'Destination', type: 'text', required: true, placeholder: 'e.g. Mumbai' },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select', 
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'In Transit', value: 'in_transit' },
        { label: 'Customs', value: 'customs_clearance' },
        { label: 'Delivered', value: 'delivered' },
      ],
      required: true 
    },
    { name: 'carrier', label: 'Carrier', type: 'text', required: true },
    { name: 'estimated_arrival', label: 'ETA', type: 'date', required: true },
    { name: 'cost', label: 'Cost ($)', type: 'number', required: true },
  ]
};

export default function ShipmentsPage() {
  const [counts, setCounts] = useState({ total: 0, inTransit: 0, delivered: 0 });

  useEffect(() => {
    let cancelled = false;
    apiClient.get<any[]>('/shipments').then((res) => {
      if (cancelled) return;
      const rows = toList<any>(res);
      const norm = (s: any) => String(s ?? '').toLowerCase();
      setCounts({
        total: rows.length,
        inTransit: rows.filter((s) => ['in_transit', 'port_processing', 'customs_clearance', 'picked_up'].includes(norm(s.status))).length,
        delivered: rows.filter((s) => norm(s.status) === 'delivered').length,
      });
    }).catch(() => { /* graceful: KPIs stay at zero */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/20 min-h-screen space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Shipments</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
        <Card className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">In Transit</CardTitle>
            <Ship className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.inTransit}</div>
          </CardContent>
        </Card>
        <Card className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivered</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.delivered}</div>
          </CardContent>
        </Card>
      </div>

      <EntityManager config={shipmentConfig} />
    </main>
  );
}
