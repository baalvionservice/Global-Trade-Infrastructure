/**
 * @file data-warehouse-health.tsx
 * @description Real-time telemetry for the Sovereign Lakehouse and analytics fabric.
 */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  Dna,
  Server,
  Workflow
} from 'lucide-react';
import { WarehouseHealth } from '../types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function DataWarehouseHealth({ health }: { health: WarehouseHealth }) {
  return (
    <Card className="shadow-none border-2 bg-slate-950 text-slate-300 rounded-2xl overflow-hidden group">
      <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-black uppercase tracking-tighter text-white">Fabric Integrity Pulse</CardTitle>
          <CardDescription className="text-slate-500 font-medium italic">High-fidelity telemetry of the planetary data mesh and Iceberg ingestion nodes.</CardDescription>
        </div>
        <Database className="h-10 w-10 text-primary opacity-20 group-hover:scale-110 transition-transform duration-1000" />
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: 'Sync Rate', val: `${health.syncRate}%`, icon: RefreshCw, color: 'text-emerald-400' },
             { label: 'Ingestion Delay', val: `${health.ingestionDelayMs}ms`, icon: Activity, color: 'text-blue-400' },
             { label: 'Node Consensus', val: `${health.nodeConsensus}%`, icon: ShieldCheck, color: 'text-indigo-400' },
             { label: 'Fabric Load', val: `${health.storageUtilization}%`, icon: Workflow, color: 'text-orange-400' }
           ].map(stat => (
              <div key={stat.label} className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 shadow-inner">
                 <div className="flex items-center justify-between">
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-white tabular-nums tracking-tighter">{stat.val}</p>
                 </div>
              </div>
           ))}
        </div>

        <div className="p-8 rounded-2xl bg-slate-900 border-2 border-dashed border-white/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-[0.03]"><Dna className="h-32 w-32" /></div>
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="space-y-3 max-w-xl text-center md:text-left">
                 <h4 className="text-lg font-black uppercase tracking-tight text-white">Cognition Finality Signature</h4>
                 <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                    "Every transaction, procurement event, and logistics milestone is cryptographically indexed and synchronized across 14 high-availability sovereign clusters."
                 </p>
              </div>
              <div className="space-y-4 w-full md:w-64">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-wide text-slate-500">
                    <span>Ledger Symmetry</span>
                    <span className="text-emerald-400">OPTIMAL</span>
                 </div>
                 <div className="p-3 bg-slate-950 rounded-xl border border-white/10 font-mono text-[9px] text-emerald-400 select-all truncate">
                    {health.integritySignature}
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
           <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-primary">Active Analytical Nodes</p>
              <div className="space-y-3">
                 {['Iceberg_Cluster_A', 'Trino_Federation_SG', 'ClickHouse_Hot_Node'].map(node => (
                    <div key={node} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                       <div className="flex items-center gap-3">
                          <Server className="h-4 w-4 text-slate-500" />
                          <span className="text-[10px] font-bold uppercase text-slate-300">{node}</span>
                       </div>
                       <Badge variant="outline" className="text-[8px] font-black uppercase border-emerald-500/20 text-emerald-500 bg-emerald-500/5">Executing</Badge>
                    </div>
                 ))}
              </div>
           </div>
           <div className="bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <Activity className="h-10 w-10 text-primary opacity-40" />
              <div className="space-y-1">
                 <p className="text-sm font-black uppercase text-white tracking-tighter">Lineage Trace Engine</p>
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed px-4">"Institutional administrators can reconstruct historical system states with 100% auditable lineage."</p>
              </div>
              <button className="text-[9px] font-black uppercase text-primary hover:underline tracking-widest pt-2">LAUNCH PROVENANCE LAB</button>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
