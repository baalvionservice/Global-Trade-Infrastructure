'use client';

import { useEffect, useState } from 'react';
import { approvalService, ApprovalRequest } from '@/services/approval-service';
import { AdaptiveDataView } from '@/components/shared/adaptive-data-view';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Loader2, 
  Filter, 
  Search, 
  History, 
  Eye, 
  ChevronLeft,
  UserCheck,
  AlertOctagon,
  Gavel
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { useDeviceClass } from '@/hooks/use-device-class';

export default function ApprovalQueuePage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const { isMobile } = useDeviceClass();

  const fetchRequests = async () => {
    setLoading(true);
    const data = await approvalService.getRequests({ status: 'pending' });
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDecision = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      await approvalService.decide(id, status, 'ADMIN-001');
      toast({ title: `Request ${status === 'approved' ? 'Authorized' : 'Denied'}` });
      fetchRequests();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Decision Failed' });
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter(r => 
    r.reason.toLowerCase().includes(search.toLowerCase()) ||
    r.referenceId.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { header: 'Reference', accessorKey: 'referenceId', className: 'font-mono text-xs font-bold' },
    { 
      header: 'Type', 
      accessorKey: 'referenceType',
      cell: (row: ApprovalRequest) => (
        <Badge variant="outline" className="uppercase text-[8px] font-black">{row.referenceType}</Badge>
      )
    },
    { header: 'Reason', accessorKey: 'reason', className: 'text-xs' },
    { 
      header: 'Role Required', 
      accessorKey: 'requiredRole',
      cell: (row: ApprovalRequest) => (
        <Badge variant="secondary" className="text-[8px] uppercase">{row.requiredRole}</Badge>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: ApprovalRequest) => (
        <div className="flex gap-2">
           <Button 
             variant="ghost" 
             size="icon" 
             className="h-9 w-9 text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-100"
             disabled={!!processingId}
             onClick={() => handleDecision(row.id, 'rejected')}
           >
             <X className="h-4 w-4" />
           </Button>
           <Button 
             variant="ghost" 
             size="icon" 
             className="h-9 w-9 text-green-600 hover:bg-green-50 border-2 border-transparent hover:border-green-100"
             disabled={!!processingId}
             onClick={() => handleDecision(row.id, 'approved')}
           >
             {processingId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
           </Button>
        </div>
      )
    }
  ];

  return (
    <main className="flex-1 space-y-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className={cn(
            "font-black tracking-tight text-foreground uppercase leading-none",
            isMobile ? "text-2xl" : "text-3xl"
          )}>Governance Queue</h2>
          <p className="text-sm text-muted-foreground font-medium italic">Two-key authorization workbench for sovereign mandates.</p>
        </div>
        {!isMobile && (
          <div className="flex items-center gap-2 bg-background p-3 rounded-xl border-2 shadow-sm">
             <ShieldCheck className="h-5 w-5 text-primary" />
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Security</span>
                <span className="text-xs font-black uppercase">Adjudication Mode</span>
             </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
          <Input 
            placeholder="Search by ID or Reason..." 
            className="pl-12 h-12 bg-background border-2 rounded-xl text-sm font-bold shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isMobile && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-12 border-2 rounded-xl text-[10px] font-black uppercase">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" className="flex-1 h-12 border-2 rounded-xl text-[10px] font-black uppercase">
              <History className="mr-2 h-4 w-4" /> History
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Governance Ledger...</p>
        </div>
      ) : (
        <AdaptiveDataView 
          columns={columns as any} 
          data={filtered} 
          renderMobileCard={(row) => (
            <div className="bg-background border-2 rounded-2xl overflow-hidden shadow-lg mb-6">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] font-black text-primary">{row.id}</span>
                    <p className="text-xs font-black uppercase tracking-tight">{row.referenceType} Mandate</p>
                  </div>
                  <Badge variant="secondary" className="text-[8px] h-5 uppercase px-2 font-black">PENDING</Badge>
                </div>
                
                <div className="p-4 bg-muted/20 rounded-2xl border-2 border-dashed">
                   <p className="text-[9px] font-black text-muted-foreground uppercase mb-1 tracking-widest opacity-60">Verification Context</p>
                   <p className="text-sm font-medium leading-relaxed italic">"{row.reason}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-muted-foreground uppercase opacity-60">Reference ID</p>
                      <p className="text-[11px] font-bold truncate">{row.referenceId}</p>
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-muted-foreground uppercase opacity-60">Requested By</p>
                      <p className="text-[11px] font-bold">{row.requestedBy}</p>
                   </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-14 rounded-2xl border-2 border-red-100 text-red-600 font-black text-[10px] uppercase tracking-widest"
                    onClick={() => handleDecision(row.id, 'rejected')}
                    disabled={!!processingId}
                  >
                    <X className="mr-2 h-4 w-4" /> Reject
                  </Button>
                  <Button 
                    className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-widest shadow-xl"
                    onClick={() => handleDecision(row.id, 'approved')}
                    disabled={!!processingId}
                  >
                    {processingId === row.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Gavel className="mr-2 h-4 w-4" />}
                    Authorize
                  </Button>
                </div>
              </div>
            </div>
          )}
        />
      )}
    </main>
  );
}
