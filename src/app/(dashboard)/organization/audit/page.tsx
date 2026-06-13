'use client';

/**
 * @file organization/audit/page.tsx
 * @description Organization activity log. Reads orgAdminApi.audit({ page }) →
 * { total, page, limit, logs } and renders a paginated, read-only timeline of actions,
 * actors, source IPs, and compact metadata. auth-service scopes the log to the caller's org.
 */

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AuditLog } from '@/lib/admin-api';
import { orgAdminApi } from '@/lib/admin-api';
import { EmptyState, ErrorBanner, LoadingBlock, PageHeader, formatDate } from '../_components/org-ui';

const PAGE_SIZE = 25;

/** Render metadata as compact key=value chips; falls back to an em dash when empty. */
function MetadataCell({ metadata }: { metadata: Record<string, unknown> }) {
  const entries = Object.entries(metadata ?? {});
  if (entries.length === 0) return <span className="text-muted-foreground opacity-40">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5 max-w-md">
      {entries.slice(0, 6).map(([k, v]) => (
        <span
          key={k}
          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
        >
          <span className="font-bold text-foreground/70">{k}</span>
          <span className="opacity-70">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
        </span>
      ))}
      {entries.length > 6 && <span className="text-[10px] font-bold text-muted-foreground opacity-50">+{entries.length - 6}</span>}
    </div>
  );
}

function shortId(id: string | null): string {
  if (!id) return '—';
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

export default function OrganizationAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    const res = await orgAdminApi.audit({ page: targetPage, limit: PAGE_SIZE });
    if (res.success && res.data) {
      setLogs(res.data.logs);
      setTotal(res.data.total);
      setPage(res.data.page);
    } else {
      setError(res.error?.message ?? 'Could not load the activity log.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const goTo = (p: number) => {
    if (p < 1 || p > totalPages || loading) return;
    load(p);
  };

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <PageHeader
        eyebrow="Organization Administration"
        title="Activity Log"
        description="An immutable record of administrative and security events across your organization node."
      >
        <Button
          variant="outline"
          onClick={() => load(page)}
          disabled={loading}
          className="h-12 px-6 font-black uppercase tracking-widest text-[10px] border-2 shadow-sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </PageHeader>

      <Card className="shadow-xl border-2 rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/10 border-b py-6 px-6 flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
            <ScrollText className="h-6 w-6 text-primary" /> Events
          </CardTitle>
          {!loading && !error && (
            <Badge variant="outline" className="h-7 px-3 text-[10px] font-black uppercase tracking-widest border-2">
              {total} total
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <LoadingBlock label="Loading activity…" />
          ) : error ? (
            <div className="p-6">
              <ErrorBanner message={error} onRetry={() => load(page)} />
            </div>
          ) : logs.length === 0 ? (
            <EmptyState message="No activity recorded yet." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="text-[9px] font-black uppercase tracking-widest">Action</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest">When</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest">Actor</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest">IP</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest">Metadata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/10 align-top">
                        <TableCell>
                          <span className="inline-flex rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-bold text-primary">
                            {log.action}
                          </span>
                          {log.resource_type && (
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground opacity-60">
                              {log.resource_type}{log.resource_id ? ` · ${shortId(log.resource_id)}` : ''}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">{shortId(log.user_id)}</TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">{log.ip_address ?? '—'}</TableCell>
                        <TableCell>
                          <MetadataCell metadata={log.metadata} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between gap-4 border-t bg-muted/10 px-6 py-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goTo(page - 1)}
                    disabled={page <= 1 || loading}
                    className="h-9 px-4 font-black uppercase text-[9px] tracking-widest border-2"
                  >
                    <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goTo(page + 1)}
                    disabled={page >= totalPages || loading}
                    className="h-9 px-4 font-black uppercase text-[9px] tracking-widest border-2"
                  >
                    Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
