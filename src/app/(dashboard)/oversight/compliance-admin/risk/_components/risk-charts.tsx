'use client';

import { Pie, PieChart, Cell, ResponsiveContainer, Area, AreaChart, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export function RiskDistributionChart({ data }: { data: { name: string; value: number }[] }) {
  const config = {
    value: { label: "Users" }
  };

  return (
    <Card className="shadow-none border">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-widest">Risk Distribution</CardTitle>
        <CardDescription>Institutional participant risk profiles.</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ChartContainer config={config} className="h-full w-full">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function TransactionTrendChart({ data }: { data: { date: string; amount: number }[] }) {
  const config = {
    amount: { label: "Volume", color: "hsl(var(--primary))" }
  };

  return (
    <Card className="shadow-none border">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-widest">Transaction Trends</CardTitle>
        <CardDescription>Daily financial movement across the platform.</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ChartContainer config={config} className="h-full w-full">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              className="text-[10px]"
            />
            <YAxis 
               tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`}
               className="text-[10px]"
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="var(--color-amount)" 
              fill="var(--color-amount)" 
              fillOpacity={0.1} 
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
