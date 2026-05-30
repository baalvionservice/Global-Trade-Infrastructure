/**
 * @file ecosystem-graph.tsx
 * @description Geopolitical Topology Graph. Visualizes the planetary mesh of institutional nodes.
 */
'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  Landmark, 
  Truck, 
  Gavel, 
  Zap, 
  Globe, 
  Lock,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type NodeType = 'kernel' | 'buyer' | 'seller' | 'bank' | 'customs' | 'logistics' | 'insurance';

interface Node {
  id: string;
  type: NodeType;
  label: string;
  status: 'online' | 'syncing' | 'idle' | 'flagged';
  x: number; // Percent 0-100
  y: number;
  metadata: Record<string, any>;
}

const NODES: Node[] = [
  { id: 'kernel', type: 'kernel', label: 'SGEK Core', status: 'online', x: 50, y: 50, metadata: { version: '4.2.0', load: '12%', up: '99.99%' } },
  
  // Finance Cluster
  { id: 'bank-1', type: 'bank', label: 'Treasury Node A', status: 'online', x: 30, y: 30, metadata: { liquidity: '$480M', region: 'US' } },
  { id: 'bank-2', type: 'bank', label: 'Treasury Node B', status: 'syncing', x: 25, y: 45, metadata: { liquidity: '$1.2B', region: 'EU' } },
  
  // Commerce Cluster
  { id: 'buyer-1', type: 'buyer', label: 'Buyer Proxy 01', status: 'online', x: 70, y: 25, metadata: { activeRfqs: 12, trust: 942 } },
  { id: 'seller-1', type: 'seller', label: 'Seller Node 01', status: 'online', x: 75, y: 40, metadata: { activeDeals: 5, trust: 884 } },
  
  // Regulatory Cluster
  { id: 'customs-1', type: 'customs', label: 'US Customs Gate', status: 'online', x: 50, y: 20, metadata: { throughput: '420/h', drift: '0.01%' } },
  { id: 'gov-1', type: 'customs', label: 'SG Trade Command', status: 'online', x: 40, y: 15, metadata: { policy: 'AEO-T1', latency: '40ms' } },
  
  // Logistics Cluster
  { id: 'log-1', type: 'logistics', label: 'Maersk Hub', status: 'online', x: 70, y: 70, metadata: { vessels: 14, region: 'Global' } },
  { id: 'log-2', type: 'logistics', label: 'Port Shanghai', status: 'flagged', x: 80, y: 60, metadata: { congestion: '84%', trend: 'rising' } },
  
  // Protection
  { id: 'ins-1', type: 'insurance', label: 'Underwriting Node', status: 'online', x: 30, y: 70, metadata: { coverage: '$4.2B', activeClaims: 0 } },
];

const CONNECTIONS = [
  { from: 'kernel', to: 'bank-1' },
  { from: 'kernel', to: 'bank-2' },
  { from: 'kernel', to: 'buyer-1' },
  { from: 'kernel', to: 'seller-1' },
  { from: 'kernel', to: 'customs-1' },
  { from: 'kernel', to: 'gov-1' },
  { from: 'kernel', to: 'log-1' },
  { from: 'kernel', to: 'log-2' },
  { from: 'kernel', to: 'ins-1' },
  { from: 'bank-1', to: 'bank-2' },
  { from: 'buyer-1', to: 'seller-1' },
  { from: 'log-1', to: 'log-2' },
  { from: 'customs-1', to: 'gov-1' },
];

const ICONS: Record<NodeType, any> = {
  kernel: Cpu,
  buyer: Users,
  seller: Landmark,
  bank: Landmark,
  customs: Gavel,
  logistics: Truck,
  insurance: ShieldCheck
};

export function EcosystemGraph() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(NODES[0]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[600px] bg-slate-950 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* SVG CONNECTIONS LAYER */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {CONNECTIONS.map((conn, i) => {
          const from = NODES.find(n => n.id === conn.from)!;
          const to = NODES.find(n => n.id === conn.to)!;
          
          return (
            <React.Fragment key={i}>
              <line 
                x1={`${from.x}%`} 
                y1={`${from.y}%`} 
                x2={`${to.x}%`} 
                y2={`${to.y}%`} 
                stroke="rgba(255,255,255,0.05)" 
                strokeWidth="1" 
              />
              
              <motion.line
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 0], 
                  opacity: [0, 1, 0],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
                x1={`${from.x}%`} 
                y1={`${from.y}%`} 
                x2={`${to.x}%`} 
                y2={`${to.y}%`} 
                stroke="rgba(59, 130, 246, 0.4)" 
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </React.Fragment>
          );
        })}
      </svg>

      {/* NODES LAYER */}
      {NODES.map((node) => {
        const Icon = ICONS[node.type];
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode === node.id;

        return (
          <motion.div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            whileHover={{ scale: 1.1 }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => setSelectedNode(node)}
          >
            <div className={cn(
              "relative p-3 rounded-2xl border-2 transition-all duration-500",
              isSelected ? "bg-primary border-white shadow-[0_0_30px_rgba(59,130,246,0.6)]" : 
              node.type === 'kernel' ? "bg-slate-900 border-primary shadow-xl" :
              "bg-slate-950 border-white/10 hover:border-white/30"
            )}>
               <Icon className={cn(
                 "h-5 w-5",
                 isSelected ? "text-white" : "text-primary opacity-60"
               )} />

               <div className={cn(
                 "absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-slate-950",
                 node.status === 'online' ? "bg-emerald-500" :
                 node.status === 'syncing' ? "bg-blue-500 animate-pulse" :
                 node.status === 'flagged' ? "bg-red-500 animate-ping" : "bg-slate-500"
               )} />
            </div>
          </motion.div>
        );
      })}

      {/* INTELLIGENCE PANEL OVERLAY */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-8 right-8 w-80 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-md z-30"
          >
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <Badge className="bg-primary text-white text-[8px] font-black uppercase h-5 border-none">{selectedNode.type}</Badge>
                   <div className="flex items-center gap-2">
                      <div className={cn("h-1.5 w-1.5 rounded-full", selectedNode.status === 'online' ? 'bg-emerald-500' : 'bg-red-500')} />
                      <span className="text-[9px] font-black uppercase text-slate-500">{selectedNode.status}</span>
                   </div>
                </div>

                <div className="space-y-1">
                   <h3 className="text-xl font-black uppercase tracking-tighter text-white">{selectedNode.label}</h3>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Node Path: /{selectedNode.id}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                   <p className="text-[9px] font-black uppercase tracking-wide text-primary">Node Telemetry</p>
                   <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedNode.metadata).map(([key, val]) => (
                         <div key={key} className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-[8px] font-black text-slate-500 uppercase mb-1">{key}</p>
                            <p className="text-xs font-black text-white">{val}</p>
                         </div>
                      ))}
                   </div>
                </div>

                <Button className="w-full h-12 font-black uppercase text-[9px] tracking-widest bg-white text-slate-950 hover:bg-slate-200">
                   RESOLVE NODE DETAILS
                </Button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
