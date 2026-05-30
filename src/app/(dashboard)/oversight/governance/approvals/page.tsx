'use client';

import { useEffect, useState } from 'react';
import { approvalService, ApprovalRequest } from '@/services/approval-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Check, X, Loader2, Filter, Search, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function ApprovalQueuePage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

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

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Governance Approval Queue</h2>
          <p className="text-muted-foreground">Authorize sensitive trade actions requiring operational oversight.</p>
        </div>
        <div className="flex items-center gap-2 bg-background p-3 rounded-lg border shadow-sm">
           <ShieldCheck className="h-5 w-5 text-primary" />
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Security</span>
              <span className="text-sm font-bold">Authority Level Active</span>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="border-dashed shadow-none py-20 text-center">
           <CardContent className="space-y-3 text-muted-foreground">
              <History className="h-10 w-10 mx-auto opacity-20" />
              <p>The approval queue is currently empty.</p>
           </CardContent>
        </Card>
      ) : (
        <Card className="shadow-none border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Reference ID</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Required Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[8px] font-black">{req.referenceType}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold">{req.referenceId}</TableCell>
                  <TableCell className="text-xs font-medium max-w-[200px] truncate">{req.reason}</TableCell>
                  <TableCell>
                     <Badge variant="secondary" className="text-[8px] uppercase">{req.requiredRole}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {format(new Date(req.createdAt), "MMM d, HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="h-8 w-8 text-red-600 hover:bg-red-50"
                         disabled={!!processingId}
                         onClick={() => handleDecision(req.id, 'rejected')}
                       >
                         <X className="h-4 w-4" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="h-8 w-8 text-green-600 hover:bg-green-50"
                         disabled={!!processingId}
                         onClick={() => handleDecision(req.id, 'approved')}
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
