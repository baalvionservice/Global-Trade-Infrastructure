'use client';

import { useEffect, useState } from 'react';
import { getServiceRequests, ServiceRequest } from '@/services/agent-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Filter, Briefcase, ExternalLink, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PATHS } from '@/lib/paths';
import { useRouter } from 'next/navigation';

export default function MyServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    getServiceRequests()
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  const filtered = requests.filter(r => 
    r.agentName.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    requested: "bg-blue-100 text-blue-700 border-blue-200",
    accepted: "bg-orange-100 text-orange-700 border-orange-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expert Service Requests</h2>
          <p className="text-muted-foreground">Manage and track your operational support requests across all global agents.</p>
        </div>
        <Button onClick={() => router.push(PATHS.AGENTS)}>
           Hire New Agent
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Request ID or Agent..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="shrink-0">
          <Filter className="mr-2 h-4 w-4" /> Filter by Status
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed shadow-none py-20 text-center">
           <CardContent className="space-y-4">
              <Briefcase className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
              <h3 className="font-bold text-lg">No active service requests</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                 Hire experts in customs, inspections, and logistics to support your trade executions.
              </p>
              <Button variant="outline" onClick={() => router.push(PATHS.AGENTS)}>Discover Agents</Button>
           </CardContent>
        </Card>
      ) : (
        <Card className="shadow-none border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Linked ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((req) => (
                <TableRow key={req.id} className="group">
                  <TableCell className="font-mono text-xs font-bold">{req.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                       <span className="text-sm font-bold">{req.agentName}</span>
                       <span className="text-[10px] text-muted-foreground uppercase font-medium">{req.agentType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{req.type}</TableCell>
                  <TableCell className="text-xs font-mono">{req.shipmentId || req.orderId || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("uppercase text-[9px] font-black px-2", statusColors[req.status])}>
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                       <ExternalLink className="h-4 w-4" />
                    </Button>
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
