/**
 * @file src/app/(dashboard)/messages/page.tsx
 * @description The centralized Institutional Inbox for all trade-related communications.
 * High-density coordination hub for commercial, logistics, and governance dialogues.
 */
'use client';

import { useEffect, useState } from 'react';
import { communicationService, Conversation } from '@/services/communication-service';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  ArrowRight, 
  User, 
  ShieldCheck, 
  Loader2,
  Box,
  Zap,
  Package,
  AlertTriangle,
  Siren,
  Globe,
  Radio
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'warroom' | 'contextual'>('all');
  const router = useRouter();

  useEffect(() => {
    communicationService.getInbox('COMP-101')
      .then(setConversations)
      .finally(() => setLoading(false));
  }, []);

  const filtered = conversations.filter(c => {
    const matchesSearch = c.participants.some(p => p.toLowerCase().includes(search.toLowerCase())) ||
                         c.contextTitle.toLowerCase().includes(search.toLowerCase()) ||
                         c.id.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'warroom') return matchesSearch && c.isWarRoom;
    if (filter === 'contextual') return matchesSearch && !c.isWarRoom;
    return matchesSearch;
  });

  const contextIcons = {
    rfq: Box,
    deal: Zap,
    order: Package,
    general: MessageSquare,
    incident: Siren,
    compliance: ShieldCheck,
    treasury: Radio,
    logistics: Globe
  };

  return (
    <main className="flex-1 flex flex-col bg-muted/20 min-h-screen">
      <div className="p-4 md:p-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Coordination Network</p>
              <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Institutional Inbox</h2>
              <p className="text-muted-foreground font-medium italic">Authoritative dialogue nodes for multi-party trade synchronization and systemic escalations.</p>
           </div>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
                 <ShieldCheck className="h-4 w-4" />
                 E2E Encryption: AUTH_V4
              </div>
              <Button className="font-black shadow-2xl h-11 px-6 text-[10px] uppercase tracking-widest bg-primary">
                NEW THREAD
              </Button>
           </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40" />
              <Input 
                placeholder="Search by participant identity, reference signature, or context..." 
                className="pl-12 h-14 bg-background border-2 rounded-2xl text-sm font-bold shadow-sm focus-visible:ring-primary/20 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 p-1.5 bg-background border-2 rounded-2xl shadow-sm">
               {[
                 { id: 'all', label: 'All Dialogues' },
                 { id: 'warroom', label: 'War Rooms' },
                 { id: 'contextual', label: 'Trade Context' }
               ].map(btn => (
                 <Button 
                   key={btn.id}
                   variant={filter === btn.id ? 'default' : 'ghost'}
                   size="sm"
                   onClick={() => setFilter(btn.id as any)}
                   className={cn(
                     "text-[9px] font-black uppercase tracking-widest px-4 h-11 rounded-xl transition-all",
                     filter === btn.id ? "shadow-lg scale-105" : "text-muted-foreground"
                   )}
                 >
                   {btn.label}
                 </Button>
               ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl border-2" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-2 border-dashed shadow-none py-32 bg-card/30 rounded-3xl">
              <CardContent className="flex flex-col items-center text-center space-y-6">
                <div className="p-8 rounded-full bg-muted/40 border-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground opacity-30" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-2xl uppercase tracking-tighter">No Active Nodes</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed italic">
                    Initiate an institutional dialogue from a verified trade entity or operational node to begin building your relationship ledger.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {filtered.map((conv, i) => {
                  const Icon = (contextIcons as any)[conv.contextType] || MessageSquare;
                  const isCritical = conv.isWarRoom;

                  return (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card 
                        className={cn(
                          "cursor-pointer border-2 transition-all group overflow-hidden bg-background rounded-3xl hover:shadow-2xl hover:border-primary/40",
                          isCritical ? "border-red-200 ring-2 ring-red-500/10 shadow-red-500/5" : "shadow-sm",
                          conv.unreadCount > 0 && !isCritical ? "border-primary/30 ring-1 ring-primary/10" : ""
                        )}
                        onClick={() => router.push(`/messages/${conv.id}`)}
                      >
                        <CardContent className="p-0">
                          <div className="flex items-stretch h-32">
                            <div className={cn(
                              "w-2 transition-all duration-500",
                              isCritical ? "bg-red-600 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.4)]" :
                              conv.unreadCount > 0 ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.4)]" : "bg-transparent group-hover:bg-muted"
                            )} />
                            <div className="flex-1 p-8 flex items-center justify-between gap-8">
                              <div className="flex items-center gap-6 min-w-0">
                                <div className={cn(
                                  "h-12 w-16 rounded-2xl border-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner",
                                  isCritical ? "bg-red-50 border-red-100" : "bg-muted"
                                )}>
                                   {isCritical ? <Siren className="h-8 w-8 text-red-600" /> : <User className="h-8 w-8 text-muted-foreground opacity-60" />}
                                </div>
                                <div className="min-w-0 space-y-2">
                                  <div className="flex items-center gap-4">
                                     <span className="font-black text-xl truncate uppercase tracking-tight text-foreground">{conv.participants.join(' ↔ ')}</span>
                                     {isCritical && (
                                       <Badge className="bg-red-600 text-white text-[9px] font-black h-6 px-3 rounded-full shadow-lg border-none animate-pulse">
                                          WAR ROOM ACTIVE
                                       </Badge>
                                     )}
                                     {conv.unreadCount > 0 && !isCritical && (
                                       <Badge className="bg-primary text-white text-[9px] font-black h-5 px-2 rounded-full shadow-lg">
                                          {conv.unreadCount} NEW
                                       </Badge>
                                     )}
                                  </div>
                                  <div className="flex items-center gap-4">
                                     <div className={cn(
                                       "flex items-center gap-1.5 px-2.5 py-1 rounded border text-[8px] font-black uppercase tracking-widest",
                                       isCritical ? "bg-red-50 text-red-700 border-red-100" : "bg-muted/50 text-muted-foreground border-muted"
                                     )}>
                                        <Icon className="h-3 w-3" /> {conv.contextType}
                                     </div>
                                     <span className="text-[11px] font-bold text-primary truncate max-w-[300px] uppercase tracking-tighter opacity-80">{conv.contextTitle}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate italic font-medium pt-1 max-w-xl">
                                    "{conv.lastMessage.replace(/_/g, ' ')}"
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-4 shrink-0">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase opacity-40">
                                   <Clock className="h-3.5 w-3.5" />
                                   {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                                </div>
                                <div className="flex items-center gap-3">
                                   <div className="flex -space-x-3">
                                      {[1, 2].map(i => (
                                         <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-black">P{i}</div>
                                      ))}
                                   </div>
                                   <div className="p-2.5 rounded-full bg-primary/5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all border shadow-sm">
                                      <ArrowRight className="h-5 w-5" />
                                   </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-primary text-primary-foreground relative overflow-hidden group shadow-2xl">
           <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
              <Globe className="h-64 w-64 brightness-0 invert" />
           </div>
           <div className="relative z-10 max-w-3xl space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Baalvion Coordination Standard v4.2</h4>
              <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Globally Synchronized Dialogue.</h3>
              <p className="text-lg font-medium leading-relaxed italic opacity-80">
                "Trade coordination requires more than messages—it requires context. Baalvion Dialogue Nodes link directly to the operational ledger, providing every participant with a cryptographically verified source of truth."
              </p>
              <div className="flex gap-6 pt-4">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase opacity-60">Registry Node</p>
                    <p className="text-xl font-black tracking-tighter text-emerald-400">SYNC_MASTER_A</p>
                 </div>
                 <div className="space-y-1 border-l pl-12 border-white/10">
                    <p className="text-[10px] font-black uppercase opacity-60">Dialogue Latency</p>
                    <p className="text-xl font-black tracking-tighter">~140ms</p>
                 </div>
                 <div className="space-y-1 border-l pl-12 border-white/10">
                    <p className="text-[10px] font-black uppercase opacity-60">Security Level</p>
                    <p className="text-xl font-black tracking-tighter">TIER 1 SOVEREIGN</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
