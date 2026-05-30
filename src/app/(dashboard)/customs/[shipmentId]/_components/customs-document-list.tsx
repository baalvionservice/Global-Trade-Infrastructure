'use client';

import { useEffect, useState } from "react";
import { getDocuments, uploadDocument, TradeDocument, DocumentType } from "@/services/document-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, Upload, Loader2, Eye, History, XCircle, Clock, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function CustomsDocumentList({ shipmentId }: { shipmentId: string }) {
  const [documents, setDocuments] = useState<TradeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const docs = await getDocuments(shipmentId);
    setDocuments(docs);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [shipmentId]);

  const handleUpload = async (type: DocumentType) => {
    setUploading(type);
    try {
      await uploadDocument({
        referenceType: 'shipment',
        referenceId: shipmentId,
        type,
        fileName: `${type.toUpperCase()}_v${(documents.filter(d => d.type === type).length + 1)}.pdf`,
        uploadedBy: 'COMP-102', // Mock Current Seller Node
        companyId: 'COMP-102'
      });
      await fetchData();
      toast({ title: "Version Node Created", description: "Document has been vaulted and queued for AI extraction." });
    } catch (e) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploading(null);
    }
  };

  const docTypes: { label: string, value: DocumentType }[] = [
    { label: 'Commercial Invoice', value: 'commercial_invoice' },
    { label: 'Packing List', value: 'packing_list' },
    { label: 'Certificate of Origin', value: 'certificate_of_origin' },
    { label: 'Bill of Lading', value: 'bill_of_lading' }
  ];

  if (loading) return <div className="h-40 flex items-center justify-center opacity-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <Card className="shadow-none border-2 bg-background h-full rounded-3xl overflow-hidden">
      <CardHeader className="pb-4 bg-muted/10 border-b">
        <CardTitle className="text-sm font-black uppercase tracking-wide flex items-center gap-2">
           <FileText className="h-4 w-4 text-primary" />
           Digital Trade Dossier
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {docTypes.map(item => {
          const versions = documents.filter(d => d.type === item.value).sort((a, b) => b.version - a.version);
          const latest = versions[0];
          
          return (
            <div key={item.value} className="flex flex-col gap-3 p-4 rounded-2xl border-2 bg-muted/5 group transition-all hover:border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-background rounded-xl border-2 shadow-sm group-hover:scale-105 transition-transform">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-tight leading-none">{item.label}</p>
                    <div className="flex items-center gap-2">
                      {latest ? (
                        <>
                           <Badge variant="outline" className={cn(
                             "text-[8px] h-5 uppercase px-1.5 font-black border-2",
                             latest.status === 'verified' ? "text-green-600 border-green-200 bg-green-50" : 
                             latest.status === 'extracting' ? "text-blue-600 border-blue-200 bg-blue-50 animate-pulse" :
                             latest.status === 'rejected' ? "text-red-600 border-red-200 bg-red-50" : 
                             "text-indigo-600 border-indigo-200 bg-indigo-50"
                           )}>
                             {latest.status.replace(/_/g, ' ')}
                           </Badge>
                           <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter opacity-40">V{latest.version}</span>
                        </>
                      ) : (
                        <span className="text-[9px] text-muted-foreground uppercase font-black opacity-30 italic">Not Vaulted</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   {latest && (
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border hover:bg-muted">
                         <Eye className="h-4 w-4" />
                      </Button>
                   )}
                   <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-xl border text-primary hover:bg-primary/5"
                      onClick={() => handleUpload(item.value)}
                      disabled={uploading === item.value}
                    >
                      {uploading === item.value ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                </div>
              </div>

              {versions.length > 1 && (
                <div className="pl-14">
                   <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="h-4 p-0 text-[9px] text-muted-foreground font-black uppercase tracking-widest hover:text-primary hover:no-underline">
                         <History className="h-3 w-3 mr-1.5 opacity-40" /> {versions.length} REVISIONS
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl">
                      <DialogHeader>
                         <DialogTitle className="text-xl font-black uppercase tracking-tighter">Dossier Lineage: {item.label}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-6">
                         {versions.map(v => (
                           <div key={v.id} className="flex items-center justify-between p-4 rounded-2xl border-2 bg-muted/5">
                              <div className="flex items-center gap-4">
                                 <Badge variant="secondary" className="text-[9px] font-black h-6 px-2 border-none">V{v.version}</Badge>
                                 <div className="space-y-0.5">
                                    <p className="text-xs font-black uppercase">{v.fileName}</p>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase opacity-60">{format(new Date(v.createdAt), "MMM d, yyyy HH:mm")}</p>
                                 </div>
                              </div>
                              <Badge variant="outline" className="text-[9px] font-black uppercase h-6 px-2 border-2">{v.status}</Badge>
                           </div>
                         ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
