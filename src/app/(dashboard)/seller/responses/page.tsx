'use client';

import { useEffect, useState } from 'react';
import { getMyResponses, RFQResponse } from '@/services/rfq-service';
import { ResponsesTable } from './_components/responses-table';
import { Loader2, FileText, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SellerResponsesPage() {
  const [responses, setResponses] = useState<RFQResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyResponses()
      .then(setResponses)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: responses.length,
    pending: responses.filter(r => r.status === 'pending').length,
    accepted: responses.filter(r => r.status === 'accepted').length,
  };

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Quotations</h2>
        <p className="text-muted-foreground">Track and manage your submitted bids across the marketplace.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Bids</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ResponsesTable data={responses} />
      )}
    </main>
  );
}
