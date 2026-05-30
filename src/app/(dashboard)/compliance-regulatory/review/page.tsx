/**
 * @file src/app/(dashboard)/compliance-regulatory/review/page.tsx
 * @description The authoritative Trade Document Review queue.
 * Hardened: Renamed local Activity component to ActivityIcon to prevent shadowing collisions.
 */
'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { TradeDocument, verifyDocument } from '@/services/document-service';
import { documentIntelligence, DocumentAnomaly } from '@/services/intelligence/document';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ShieldCheck, 
  Eye, 
  Check, 
  X, 
  Loader2, 
  Filter, 
  FileText, 
  ExternalLink, 
  Clock,
  AlertTriangle,
  BrainCircuit,
  Lock,
  Landmark,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentReviewPage() {
  const [documents, setDocuments] = useState<TradeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedDocAnomalies, setSelectedDocAnomalies] = useState<DocumentAnomaly[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const res = await apiClient.get<TradeDocument[]>('/trade_documents', { status: 'uploaded' });
    const docs = res.data || [];
    setDocuments(docs);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (docId: string, action: 'verified' | 'rejected') => {
    setProcessingId(docId);
    try {
      await verifyDocument(docId, action);
      toast({ 
        title: action === 'verified' ? "Verification Authorized" : "Document Rejected", 
        description: "Institutional state synchronized on the global ledger." 
      });
      fetchData();
    } catch (e) {
      toast({ variant: "destructive", title: "Action failed" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleAudit = async (docId: string) => {
    const anomalies = await documentIntelligence.auditDocument(docId);
    setSelectedDocAnomalies(anomalies);
    if (anomalies.length > 0) {
      toast({ variant: 'destructive', title: "Audit Discrepancies Detected", description: "Document extraction reveals mismatch with order ground-truth." });
    } else {
      toast({ title: "Audit Integrity Passed", description: "Extracted data matches platform ledger." });
    }
  };

  const filtered = documents.filter(d => 
    d.referenceId.toLowerCase().includes(search.toLowerCase()) ||
    d.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Node: COMPLIANCE_CONTROL</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Document Review Queue</h2>
          <p className="text-muted-foreground font-medium italic">Authorize institutional trade documentation for customs and financial finality.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40" />
              <Input 
                placeholder="Search by Shipment ID, File Name, or Participant..." 
                className="pl-12 h-14 bg-background border-2 rounded-2xl text-sm font-bold shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-6 rounded-3xl border-2 border-dashed bg-card/50">
               <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
               <p className="text-[11px] font-black uppercase text-muted-foreground tracking-wide animate-pulse">Syncing Operational Ledger...</p>
            </div>
          ) : (
            <div className="rounded-3xl border-2 bg-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-b-2">
                    <TableHead className="text-[10px] font-black uppercase tracking-wide pl-10 py-6">Dossier / Entity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wide">Participant</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wide">State</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-wide pr-10">Verification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((doc) => (
                    <TableRow key={doc.id} className="group hover:bg-primary/[0.01] transition-colors border-b last:border-0">
                      <TableCell className="pl-10 py-8">
                        <div className="flex items-center gap-5">
                           <div className="p-3 rounded-2xl bg-muted border-2 shadow-inner group-hover:scale-105 transition-transform"><FileText className="h-6 w-6 text-primary opacity-60" /></div>
                           <div className="space-y-1">
                              <p className="font-black text-sm uppercase tracking-tight truncate max-w-[200px]">{doc.fileName}</p>
                              <div className="flex items-center gap-3">
                                 <Badge variant="secondary" className="text-[8px] font-black uppercase h-5 px-1.5 border-none">V{doc.version}</Badge>
                                 <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60">Ref: {doc.referenceId}</span>
                              </div>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-tight text-foreground">{doc.uploadedBy}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">{format(new Date(doc.createdAt), "MMM d, HH:mm")}</p>
                         </div>
                      </TableCell>
                      <TableCell>
                         <Badge variant="outline" className="text-[9px] font-black uppercase bg-blue-50 text-blue-700 border-2 border-blue-100 px-2 h-6 rounded-full">
                            {doc.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <div className="flex justify-end gap-3">
                           <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-muted border-2" onClick={() => handleAudit(doc.id)}>
                              <BrainCircuit className="h-5 w-5 text-primary" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-10 w-10 rounded-2xl text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-100"
                             disabled={!!processingId}
                             onClick={() => handleAction(doc.id, 'rejected')}
                           >
                             <X className="h-5 w-5" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-10 w-10 rounded-2xl text-green-600 hover:bg-green-50 border-2 border-transparent hover:border-green-100"
                             disabled={!!processingId}
                             onClick={() => handleAction(doc.id, 'verified')}
                           >
                             {processingId === doc.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* FORENSIC AUDIT PANEL */}
           <Card className="shadow-2xl border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125 group-hover:scale-150 transition-transform duration-1000">
                 <BrainCircuit className="h-56 w-56 brightness-0 invert" />
              </div>
              <CardHeader className="pb-4 relative border-b border-white/10 px-6 py-6">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-4">
                    <Zap className="h-5 w-5 text-yellow-300" />
                    Forensic Auditor
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative space-y-6">
                 <AnimatePresence mode="wait">
                    {selectedDocAnomalies.length > 0 ? (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                          <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight">Discrepancies Detected</h3>
                          <div className="space-y-4">
                             {selectedDocAnomalies.map(anom => (
                                <div key={anom.id} className="p-5 rounded-3xl bg-red-500/20 border border-white/20 backdrop-blur-md space-y-3">
                                   <div className="flex items-center justify-between">
                                      <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{anom.field}</span>
                                      <Badge className="bg-white text-red-600 text-[8px] font-black border-none uppercase h-5 px-2">{anom.severity}</Badge>
                                   </div>
                                   <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                         <p className="text-[8px] font-bold opacity-40 uppercase">Extracted</p>
                                         <p className="text-base font-black text-red-100">{anom.extractedValue}</p>
                                      </div>
                                      <div className="space-y-0.5 text-right">
                                         <p className="text-[8px] font-bold opacity-40 uppercase">Ledger Target</p>
                                         <p className="text-base font-black text-emerald-400">{anom.expectedValue}</p>
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </div>
                          <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] tracking-wide shadow-2xl bg-white text-primary border-none rounded-2xl">
                             OPEN INVESTIGATION WAR ROOM
                          </Button>
                       </motion.div>
                    ) : (
                       <div className="py-6 text-center space-y-6">
                          <CheckCircle2 className="h-12 w-16 mx-auto opacity-30" />
                          <p className="text-sm font-bold leading-relaxed italic opacity-80">
                             "Run automated forensic audit to detect discrepancies between document extraction and platform ground-truth."
                          </p>
                       </div>
                    )}
                 </AnimatePresence>
              </CardContent>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Verification Telemetry</h4>
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-8">
                 {[
                   { label: 'Audit Accuracy', val: '99.8%', icon: ShieldCheck },
                   { label: 'Throughput', val: '42 docs/h', icon: ActivityIcon },
                   { label: 'Lineage Integrity', val: 'Verified', icon: Lock }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-muted/50 border shadow-inner"><stat.icon className="h-4 w-4 text-primary" /></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-xl font-black tracking-tighter">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}

function ActivityIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
}
