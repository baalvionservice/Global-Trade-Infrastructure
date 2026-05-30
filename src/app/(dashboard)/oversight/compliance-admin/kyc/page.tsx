'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { approveVerification, rejectVerification, VerificationRequest } from '@/services/verification-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ShieldCheck, Eye, Check, X, Loader2, Filter, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ComplianceAdminKYCPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const res = await apiClient.get<VerificationRequest[]>('/verification_requests', { status: 'pending' });
    if (res.success && res.data) setRequests(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (requestId: string, companyId: string, action: 'approve' | 'reject') => {
    setProcessingId(requestId);
    try {
      if (action === 'approve') {
        await approveVerification(requestId, companyId);
        toast({ title: "Institution Verified", description: "Company status updated to verified." });
      } else {
        await rejectVerification(requestId, companyId);
        toast({ title: "Request Rejected", description: "Verification denied." });
      }
      fetchData();
    } catch (e) {
      toast({ variant: "destructive", title: "Action failed" });
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter(r => 
    r.companyId.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Institutional KYC Queue</h2>
          <p className="text-muted-foreground">Manage organizational verification requests and legal document audits.</p>
        </div>
        <div className="flex items-center gap-2 bg-background p-3 rounded-lg border shadow-sm">
           <ShieldCheck className="h-5 w-5 text-primary" />
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Security</span>
              <span className="text-sm font-bold">Audit Mode Active</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Request ID or Company ID..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filters</Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed shadow-none py-20 text-center">
           <CardContent className="space-y-3 text-muted-foreground">
              <ShieldCheck className="h-10 w-10 mx-auto opacity-20" />
              <p>No pending institutional verifications.</p>
           </CardContent>
        </Card>
      ) : (
        <Card className="shadow-none border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Company ID</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead className="text-right">Manage Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-mono text-xs font-bold">{req.id}</TableCell>
                  <TableCell className="text-xs font-bold">{req.companyId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <FileText className="h-4 w-4 text-muted-foreground" />
                       <span className="text-xs capitalize">{req.documentType.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {format(new Date(req.uploadedAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary">
                          <Eye className="mr-2 h-4 w-4" /> VIEW DOC
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="h-8 w-8 text-red-600 hover:bg-red-50"
                         disabled={!!processingId}
                         onClick={() => handleAction(req.id, req.companyId, 'reject')}
                       >
                         <X className="h-4 w-4" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="h-8 w-8 text-green-600 hover:bg-green-50"
                         disabled={!!processingId}
                         onClick={() => handleAction(req.id, req.companyId, 'approve')}
                       >
                         {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </main>
  );
}
