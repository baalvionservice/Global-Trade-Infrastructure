'use client';

import { useEffect, useState } from 'react';
import { getServiceRequests, updateRequestStatus, ServiceRequest } from '@/services/agent-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, ShieldCheck, Briefcase, Activity, Clock, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AgentDashboardPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getServiceRequests()
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: string, status: 'accepted' | 'completed' | 'cancelled') => {
    try {
      await updateRequestStatus(id, status);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast({ title: `Request ${status.charAt(0).toUpperCase() + status.slice(1)}` });
    } catch (e) {
      toast({ variant: "destructive", title: "Update failed" });
    }
  };

  const stats = {
    pending: requests.filter(r => r.status === 'requested').length,
    active: requests.filter(r => r.status === 'accepted').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent Control Tower</h2>
          <p className="text-muted-foreground">Manage your service workload and report task completions to institutional clients.</p>
        </div>
        <div className="flex items-center gap-2 bg-background p-3 rounded-lg border shadow-sm">
           <ShieldCheck className="h-5 w-5 text-green-600" />
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Status</span>
              <span className="text-sm font-bold">Online & Active</span>
           </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-none border">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pending Invites</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{stats.pending}</div></CardContent>
        </Card>
        <Card className="shadow-none border">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Work</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{stats.active}</div></CardContent>
        </Card>
        <Card className="shadow-none border">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Completed</CardTitle>
              <Globe className="h-4 w-4 text-green-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{stats.completed}</div></CardContent>
        </Card>
      </div>

      <Card className="shadow-none border">
        <CardHeader>
          <CardTitle className="text-lg">Incoming Work Queue</CardTitle>
          <CardDescription>Service requests from institutional trade partners.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service Required</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">No active requests in queue.</TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono text-xs font-bold">{String(req.id).slice(0, 8).toUpperCase()}</TableCell>
                    <TableCell className="text-sm font-bold">{req.clientName || (req.orderId ? `Order #${req.orderId}` : req.shipmentId ? `Shipment #${req.shipmentId}` : 'Institutional Client')}</TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="text-xs font-medium">{req.type}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{req.shipmentId || 'General Advisory'}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "uppercase text-[9px] font-bold",
                        req.status === 'requested' ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"
                      )}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                          {req.status === 'requested' && (
                             <>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleAction(req.id, 'cancelled')}><X className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => handleAction(req.id, 'accepted')}><Check className="h-4 w-4" /></Button>
                             </>
                          )}
                          {req.status === 'accepted' && (
                             <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold" onClick={() => handleAction(req.id, 'completed')}>MARK COMPLETED</Button>
                          )}
                          {req.status === 'completed' && <Check className="h-4 w-4 text-green-600 mr-4" />}
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
