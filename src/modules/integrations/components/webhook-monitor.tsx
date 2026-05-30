/**
 * @file webhook-monitor.tsx
 * @description Real-time monitoring component for outbound webhooks and event propagation.
 */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IntegrationAuditLog } from '../types';
import { 
  History, 
  ArrowRightLeft, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Zap,
  Radio,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function WebhookMonitor({ logs }: { logs: IntegrationAuditLog[] }) {
  return (
    <Card className="shadow-none border-2 bg-background overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader className="bg-muted/10 border-b py-8 px-6 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-black uppercase tracking-tighter leading-none">Interoperability Ledger</CardTitle>
          <CardDescription className="text-xs font-medium italic mt-2">Immutable record of cross-platform handshakes and event propagation finality.</CardDescription>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="secondary" className="flex gap-2 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest border-2 bg-background shadow-sm">
              <Radio className="h-4 w-4 text-primary animate-pulse" /> LIVE TELEMETRY
           </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-b-2">
              <TableHead className="text-[10px] font-black uppercase tracking-widest pl-10 py-6">Identity / Correlation</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Protocol Action</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Direction</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Execution State</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-10">Finality Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-primary/[0.01] transition-colors border-b last:border-0 group">
                <TableCell className="pl-10 py-8">
                  <div className="space-y-1">
                     <p className="font-mono text-[10px] font-black text-primary uppercase">{log.correlationId}</p>
                     <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">ID: {log.id}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                     <div className="p-2 rounded-xl bg-muted border-2"><Zap className="h-4 w-4 text-primary opacity-60" /></div>
                     <span className="font-black text-xs uppercase tracking-tight text-foreground">{log.action.replace(/_/g, ' ')}</span>
                  </div>
                </TableCell>
                <TableCell>
                   <Badge className={cn(
                      "uppercase text-[9px] font-black h-6 px-3 border-none rounded-full shadow-sm",
                      log.direction === 'OUT' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                   )}>
                      {log.direction}BOUND
                   </Badge>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-3">
                      {log.status === 'SUCCESS' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border-2 border-emerald-100 shadow-inner">
                           <CheckCircle2 className="h-3.5 w-3.5" />
                           <span className="text-[9px] font-black uppercase tracking-widest">COMPLETED</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full border-2 border-red-100 shadow-inner">
                           <AlertCircle className="h-3.5 w-3.5" />
                           <span className="text-[9px] font-black uppercase tracking-widest">FAILED</span>
                        </div>
                      )}
                   </div>
                </TableCell>
                <TableCell className="text-right pr-10">
                   <div className="flex flex-col items-end">
                      <span className="text-xs font-mono font-bold text-muted-foreground">{format(new Date(log.timestamp), "HH:mm:ss.SSS")}</span>
                      <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">UTC TIMESTAMP</span>
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
