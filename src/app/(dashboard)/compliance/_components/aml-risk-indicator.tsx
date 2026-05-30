'use client';

import { RiskLevel } from "@/services/compliance-service";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface AmlRiskIndicatorProps {
  level: RiskLevel;
  score: number;
  className?: string;
}

const config = {
  low: { 
    label: "Low Risk", 
    color: "bg-green-500/10 text-green-700 border-green-200", 
    icon: ShieldCheck 
  },
  medium: { 
    label: "Medium Risk", 
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-200", 
    icon: Shield 
  },
  high: { 
    label: "High Risk", 
    color: "bg-red-500/10 text-red-700 border-red-200", 
    icon: ShieldAlert 
  },
};

export function AmlRiskIndicator({ level, score, className }: AmlRiskIndicatorProps) {
  const item = (config as any)[level];
  const Icon = item.icon;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Badge variant="outline" className={cn("px-3 py-1 gap-1.5 uppercase font-bold text-[10px]", item.color)}>
        <Icon className="h-3 w-3" />
        {item.label}
      </Badge>
      <div className="flex flex-col">
        <span className="text-[10px] text-muted-foreground font-bold uppercase leading-none">AML Score</span>
        <span className="text-xs font-bold">{score}/100</span>
      </div>
    </div>
  );
}
