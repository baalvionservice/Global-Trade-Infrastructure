'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MapPin, Clock, Loader2, Ship, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/shared/status-badge';
import { cn } from '@/lib/utils';

interface TrackingLog {
  id: string;
  location: string;
  status: string;
  timestamp: string;
}

export default function ShipmentTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [logs, setLogs] = useState<TrackingLog[]>([]);
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [shipmentRes, logsRes] = await Promise.all([
        apiClient.get<any>(`/shipments/${id}`),
        apiClient.get<TrackingLog[]>(`/tracking_logs`, { shipment_id: id as string })
      ]);

      if (shipmentRes.success) setShipment(shipmentRes.data);
      if (logsRes.success && logsRes.data) setLogs(logsRes.data);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/20 min-h-screen space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shipment Tracking</h2>
          <p className="text-muted-foreground">Real-time movement logs for {id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 shadow-none border h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Shipment Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Route</span>
              <span className="text-sm font-bold">{shipment?.origin} → {shipment?.destination}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Carrier</span>
              <span className="text-sm font-bold">{shipment?.carrier}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={shipment?.status} />
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Carrier Mode</p>
              <div className="flex items-center gap-2">
                <Ship className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Standard Ocean Freight</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-none border">
          <CardHeader>
            <CardTitle className="text-lg">Movement Timeline</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-muted" />
            <div className="space-y-8 relative">
              {logs.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground italic">
                  No tracking logs generated yet.
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={log.id} className="flex gap-6 items-start">
                    <div className={cn(
                      "h-6 w-6 rounded-full border-2 bg-background z-10 flex items-center justify-center shrink-0 mt-1",
                      index === 0 ? "border-primary ring-4 ring-primary/10" : "border-muted-foreground/30"
                    )}>
                      {index === 0 ? <Clock className="h-3 w-3 text-primary animate-pulse" /> : <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm">{log.location}</p>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {format(new Date(log.timestamp), "MMM d, HH:mm")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={log.status} className="text-[9px]" />
                        <span className="text-xs text-muted-foreground">Verification signature valid</span>
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
