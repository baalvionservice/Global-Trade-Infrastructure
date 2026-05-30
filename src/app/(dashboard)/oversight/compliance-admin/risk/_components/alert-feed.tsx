'use client';

import { RiskAlert } from "@/services/admin-risk-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const typeConfig = {
  critical: { icon: AlertCircle, color: "text-red-600 bg-red-50", badge: "bg-red-600" },
  warning: { icon: AlertTriangle, color: "text-orange-600 bg-orange-50", badge: "bg-orange-600" },
  info: { icon: Info, color: "text-blue-600 bg-blue-50", badge: "bg-blue-600" },
};

export function AlertFeed({ alerts }: { alerts: RiskAlert[] }) {
  return (
    <Card className="shadow-none border h-full">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-widest">Platform Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => {
          const config = typeConfig[alert.type];
          const Icon = config.icon;
          return (
            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20 relative overflow-hidden">
               <div className={cn("absolute left-0 top-0 bottom-0 w-1", config.badge)} />
               <div className={cn("p-2 rounded-full shrink-0", config.color)}>
                 <Icon className="h-4 w-4" />
               </div>
               <div className="space-y-1">
                 <p className="text-xs font-bold leading-tight">{alert.message}</p>
                 <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase font-bold">
                   <Clock className="h-3 w-3" />
                   {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                 </div>
               </div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-6 italic">No active alerts detected.</p>
        )}
      </CardContent>
    </Card>
  );
}
