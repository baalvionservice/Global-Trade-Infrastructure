'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BuyerActivity } from "@/services/buyer-service";
import { FileText, Package, CreditCard, Truck } from "lucide-react";

const icons = {
  RFQ: FileText,
  ORDER: Package,
  PAYMENT: CreditCard,
  LOGISTICS: Truck,
};

export function ActivityFeed({ activities }: { activities: BuyerActivity[] }) {
  if (activities.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
        No recent activity.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = icons[activity.type];
        return (
          <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card/50 hover:bg-accent/10 transition-colors">
            <div className="mt-1 p-2 rounded-full bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
              <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
