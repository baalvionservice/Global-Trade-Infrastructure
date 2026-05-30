/**
 * @file src/app/(dashboard)/documents/page.tsx
 * @description THE INSTITUTIONAL DIGITAL VAULT.
 * High-fidelity command center for trade dossiers and digital records governance.
 */
'use client';

import { useEffect, useState } from 'react';
import { documentService, TradeDocument, DocumentType, DocumentClassification } from '@/services/document-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Activity } from 'lucide-react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Loader2, 
  FolderLock, 
  Download, 
  Eye, 
  History, 
  ShieldCheck, 
  CheckCircle2,
  Clock,
  ExternalLink,
  Upload,
  BrainCircuit,
  Zap,
  Lock,
  Database,
  FileStack,
  Tags,
  Archive,
  ArrowRight,
  Landmark
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstitutionalVaultPage() {
  const [documents, setDocuments] = useState<TradeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'COMMERCIAL' | 'LOGISTICS' | 'COMPLIANCE' | 'GOVERNANCE'>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const companyId = 'COMP-101'; 

  const fetchData = async () => {
    setLoading(true);
    const data = await documentService.queryVault({ companyId });
    setDocuments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await documentService.vaultDocument({
        referenceType: 'general',
        referenceId: (formData.get('refId') as string) || 'GEN-VAULT',
        type: formData.get('type') as DocumentType,
        fileName: (formData.get('name') as string) + '.pdf',
        uploadedBy: 'Alexander Chen',
        classification: formData.get('classification') as DocumentClassification
      });
      
      toast({ title: "Document Vaulted", description: "Identity and metadata have been cryptographically recorded." });
      setIsUploadOpen(false);
      fetchData();
    } catch (e) {
      toast({ variant: "destructive", title: "Vault Failure" });
    } finally {
      setUploading(false);
    }
  };

  const filtered = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(search.toLowerCase()) || 
                          doc.referenceId.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'all' || doc.classification === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Service Node: VAULT_CORE_ALPHA</p>
           </div>
           <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter leading-[0.8]">Records <br />Governance.</h2>
           <p className="text-muted-foreground font-medium italic text-lg max-w-2xl">"Authoritative planetary oversight of institutional trade dossiers and digital knowledge artifacts."</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-6 py-3 bg-background rounded-2xl border-2 border-primary/5 shadow-xl text-xs font-black uppercase tracking-widest text-indigo-700">
              <Lock className="h-4 w-4" />
              Encryption: AES-256 Verified
           </div>
           <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
             <DialogTrigger asChild>
                <Button className="h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-md hover:scale-[1.02] transition-all">
                  <Plus className="mr-3 h-5 w-5 fill-current" /> Vault Mandate
                </Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden border-none shadow-md">
                <div className="bg-primary p-6 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Zap className="h-40 w-40 brightness-0 invert" /></div>
                   <h2 className="text-3xl font-black uppercase tracking-tighter">Vaulting Protocol</h2>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-2">Registry Synchronization Node</p>
                </div>
                <form onSubmit={handleUpload} className="p-6 space-y-8 bg-background">
                    <div className="grid gap-6">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Document Identity</Label>
                          <Input name="name" placeholder="e.g. Master Supply Agreement" required className="h-14 border-2 font-bold rounded-2xl" />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Classification</Label>
                             <Select name="classification" defaultValue="OPERATIONAL">
                                <SelectTrigger className="h-14 border-2 font-bold rounded-2xl">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="CONFIDENTIAL">CONFIDENTIAL</SelectItem>
                                   <SelectItem value="RESTRICTED">RESTRICTED</SelectItem>
                                   <SelectItem value="OPERATIONAL">OPERATIONAL</SelectItem>
                                   <SelectItem value="GOVERNANCE">GOVERNANCE</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Context Reference</Label>
                             <Input name="refId" placeholder="e.g. ORD-9921" className="h-14 border-2 font-bold rounded-2xl" />
                          </div>
                       </div>
                       <div className="p-6 border-2 border-dashed rounded-2xl text-center hover:bg-muted/50 transition-all cursor-pointer group border-primary/20 bg-muted/10">
                          <Upload className="h-10 w-10 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                          <p className="text-[11px] text-muted-foreground mt-4 font-black uppercase tracking-wide">Deposit Institutional PDF (Max 25MB)</p>
                       </div>
                    </div>
                    <Button type="submit" className="w-full h-12 font-black uppercase tracking-wide shadow-2xl text-base rounded-2xl" disabled={uploading}>
                       {uploading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <ShieldCheck className="mr-3 h-6 w-6" />}
                       Authorize Vaulting
                    </Button>
                </form>
             </DialogContent>
           </Dialog>
        </div>
      </div>

      {/* VAULT EXPLORER */}
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground opacity-30" />
             <Input 
               placeholder="Resolve document by identity, hash reference, or operational node..." 
               className="pl-16 h-12 bg-background border-2 rounded-2xl text-lg font-black tracking-tight shadow-inner focus-visible:ring-primary/20"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
          <div className="flex gap-2 p-1.5 bg-background border-2 rounded-2xl shadow-sm">
             {['all', 'COMMERCIAL', 'LOGISTICS', 'COMPLIANCE', 'GOVERNANCE'].map(cat => (
                <Button 
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveCategory(cat as any)}
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-6 h-12 rounded-xl transition-all",
                    activeCategory === cat ? "shadow-lg scale-105" : "text-muted-foreground"
                  )}
                >
                  {cat === 'all' ? 'Everything' : cat}
                </Button>
             ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-[500px] flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed bg-card/50">
             <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
             <p className="text-[11px] font-black uppercase text-muted-foreground tracking-wide animate-pulse">Establishing Secure Knowledge Link...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-2 border-dashed shadow-none py-48 text-center bg-card/30 rounded-2xl">
             <CardContent className="space-y-8">
                <div className="mx-auto h-24 w-24 rounded-2xl bg-muted/40 border-4 flex items-center justify-center opacity-30">
                  <FolderLock className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-3xl uppercase tracking-tighter">Vault Integrity Maintained</h3>
                  <p className="text-lg text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed italic">
                    No trade documents found in this classification. Secure your first institutional record to build the global dossier.
                  </p>
                </div>
             </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
             <AnimatePresence>
                {filtered.map((doc, i) => (
                  <motion.div 
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="shadow-2xl border-2 border-primary/5 hover:border-primary/40 transition-all group overflow-hidden bg-background rounded-2xl">
                       <CardHeader className="bg-muted/10 border-b p-8 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-6">
                             <div className="p-4 rounded-2xl bg-background border-2 shadow-inner group-hover:scale-110 transition-transform">
                                <FileText className="h-7 w-7 text-primary opacity-60" />
                             </div>
                             <div className="space-y-1">
                                <Badge variant="secondary" className="text-[9px] font-black uppercase h-5 px-2 border-none">V{doc.version}</Badge>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{doc.type.replace(/_/g, ' ')}</p>
                             </div>
                          </div>
                          <Badge className="bg-slate-900 text-white text-[8px] font-black uppercase h-6 px-3 rounded-full border-none shadow-sm">{doc.classification}</Badge>
                       </CardHeader>
                       <CardContent className="p-8 space-y-8">
                          <div className="space-y-1">
                             <h4 className="font-black text-xl truncate uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{doc.fileName}</h4>
                             <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">LEDGER_REF: {doc.referenceId}</p>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                             <div className="flex items-center gap-3">
                                {doc.status === 'verified' ? (
                                   <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border-2 border-emerald-100 shadow-sm">
                                      <CheckCircle2 className="h-4 w-4" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                   </div>
                                ) : doc.status === 'extracting' ? (
                                   <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border-2 border-blue-100 shadow-sm">
                                      <BrainCircuit className="h-4 w-4 animate-pulse" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">Parsing Node</span>
                                   </div>
                                ) : (
                                   <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border-2 border-indigo-100 shadow-sm">
                                      <Lock className="h-4 w-4" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">Vaulted</span>
                                   </div>
                                )}
                             </div>
                             <span className="text-[11px] font-black text-muted-foreground opacity-30 uppercase">{format(new Date(doc.createdAt), "MMM d")}</span>
                          </div>

                          {doc.metadata?.extractionConfidence && (
                             <div className="p-6 bg-muted/20 rounded-3xl border-2 border-dashed space-y-4">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wide opacity-60">
                                   <span>Intelligence Score</span>
                                   <span className="text-primary">{Math.round(doc.metadata.extractionConfidence * 100)}% Match</span>
                                </div>
                                <Progress value={doc.metadata.extractionConfidence * 100} className="h-1 bg-muted rounded-full shadow-inner" />
                             </div>
                          )}

                          <div className="flex gap-4 pt-2">
                             <Button variant="outline" className="flex-1 h-12 border-2 font-black text-[10px] uppercase tracking-widest rounded-xl">
                                <Eye className="mr-2 h-4 w-4 opacity-40" /> PREVIEW
                             </Button>
                             <Button variant="outline" className="flex-1 h-12 border-2 font-black text-[10px] uppercase tracking-widest rounded-xl">
                                <History className="mr-2 h-4 w-4 opacity-40" /> LINEAGE
                             </Button>
                          </div>
                       </CardContent>
                    </Card>
                  </motion.div>
                ))}
             </AnimatePresence>
          </div>
        )}
      </div>

      {/* RECORDS GOVERNANCE FOOTER */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 shadow-lg border-none bg-primary text-primary-foreground relative overflow-hidden group rounded-2xl">
           <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 scale-150 group-hover:scale-[1.7] transition-transform duration-1000">
              <FileStack className="h-64 w-64 brightness-0 invert" />
           </div>
           <CardContent className="p-16 relative z-10 space-y-6 max-w-4xl">
              <h4 className="text-[11px] font-black uppercase tracking-widest opacity-60">Identity Integrity Standard v4.2</h4>
              <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Sovereign <br />Digital Dossiers.</h3>
              <p className="text-2xl font-medium leading-relaxed italic opacity-80">
                "Baalvion transforms static documents into operational intelligence. Every artifact is cryptographically resolved, version-locked, and indexed across the Global Knowledge Graph for absolute audit finality."
              </p>
              <div className="flex gap-16 pt-8">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Vault Capacity</p>
                    <p className="text-3xl font-black tracking-tighter text-emerald-400">UNLIMITED</p>
                 </div>
                 <div className="space-y-1 border-l pl-16 border-white/10">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Sync Finality</p>
                    <p className="text-3xl font-black tracking-tighter">450ms</p>
                 </div>
                 <div className="space-y-1 border-l pl-16 border-white/10">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Redundancy</p>
                    <p className="text-3xl font-black tracking-tighter">TRIPLE_NODE</p>
                 </div>
              </div>
           </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-6">
           <Card className="shadow-none border-2 bg-background p-6 space-y-8 rounded-2xl">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Records Health</h4>
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Audit Readiness', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Signature Success', val: '100%', icon: Landmark, color: 'text-blue-500' },
                   { label: 'Ingestion Latency', val: '140ms', icon: Activity, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black tracking-tighter text-foreground">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-8 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-700">
              <Archive className="h-12 w-16 mx-auto text-muted-foreground opacity-10 group-hover:text-primary group-hover:opacity-30 transition-all duration-1000" />
              <div className="space-y-3">
                 <p className="text-sm font-black uppercase tracking-wide text-muted-foreground">Archival Governance</p>
                 <p className="text-xs font-medium italic leading-relaxed px-4 opacity-60">
                    "Historical dossiers are programmatically archived to the cold-storage layer following the 10-year jurisdictional retention window. Zero data-loss verified."
                 </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-2 font-black uppercase text-[9px] tracking-wide bg-background">CONFIGURE RETENTION</Button>
           </Card>
        </div>
      </div>
    </main>
  );
}
