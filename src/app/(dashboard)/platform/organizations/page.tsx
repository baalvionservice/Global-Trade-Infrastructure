/**
 * @file platform/organizations/page.tsx
 * @description Platform-owner organization registry. Cross-tenant authority surface: lists every
 * organization on the platform with server-side search/filter/pagination, a live metrics strip,
 * organization creation (with optional first-owner invite), and suspend/reactivate controls.
 *
 * auth-service enforces platform-owner authority on every /platform/* call; the client gate is UX only.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building,
  Search,
  Loader2,
  ArrowRight,
  Users,
  Clock,
  ShieldCheck,
  Ban,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { platformApi, type Organization, type PlatformMetrics } from '@/lib/admin-api';
import { ORG_TYPE_CONFIG, resolveOrgType, type OrgType } from '@/core/organizations';
import { getFlag } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PlatformGate } from './_components/platform-gate';
import { OrgStatusBadge } from './_components/org-status-badge';
import { CreateOrgDialog } from './_components/create-org-dialog';

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 350;
const ORG_TYPE_FILTER_OPTIONS = Object.keys(ORG_TYPE_CONFIG) as OrgType[];

function typeLabel(type: OrgType | string): string {
  const resolved = resolveOrgType(type);
  return resolved ? ORG_TYPE_CONFIG[resolved].label : String(type);
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

function MetricsStrip({ metrics }: { metrics: PlatformMetrics | null }) {
  const cards: { label: string; value: string; icon: typeof Building }[] = metrics
    ? [
        { label: 'Organizations', value: String(metrics.organizations.total), icon: Building },
        { label: 'Active', value: String(metrics.organizations.byStatus.active ?? 0), icon: ShieldCheck },
        { label: 'Suspended', value: String(metrics.organizations.byStatus.suspended ?? 0), icon: Ban },
        { label: 'Total users', value: String(metrics.users.total), icon: Users },
        { label: 'Pending invites', value: String(metrics.invitations.pending), icon: Clock },
      ]
    : [];

  const topTypes = metrics
    ? Object.entries(metrics.organizations.byType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
    : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {metrics
          ? cards.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="border-2 rounded-2xl shadow-sm">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 bg-muted/30">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {label}
                    </p>
                    <p className="text-2xl font-black tabular-nums tracking-tighter">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          : Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-2 rounded-2xl">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-16 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-10 animate-pulse rounded bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {topTypes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            By type:
          </span>
          {topTypes.map(([type, count]) => (
            <span
              key={type}
              className="rounded-full border-2 bg-muted/20 px-3 py-1 text-[11px] font-bold uppercase tracking-tight"
            >
              {typeLabel(type)} · <span className="tabular-nums text-primary">{count}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RegistryConsole() {
  const router = useRouter();
  const { toast } = useToast();

  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actingId, setActingId] = useState<string | null>(null);

  // Debounce the free-text search so we don't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Reset to page 1 whenever a filter changes so results stay coherent.
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, statusFilter]);

  const loadMetrics = useCallback(async () => {
    const res = await platformApi.metrics();
    if (res.success && res.data) setMetrics(res.data);
  }, []);

  const loadOrgs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformApi.listOrganizations({
        search: search || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        limit: PAGE_LIMIT,
      });
      if (!res.success || !res.data) {
        setError(res.error?.message ?? 'Failed to load organizations.');
        setOrgs([]);
        setTotal(0);
        return;
      }
      setOrgs(res.data.items);
      setTotal(res.data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error loading organizations.');
      setOrgs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, page]);

  useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    void loadOrgs();
  }, [loadOrgs]);

  const refresh = useCallback(() => {
    void loadMetrics();
    void loadOrgs();
  }, [loadMetrics, loadOrgs]);

  const handleSetStatus = async (org: Organization, next: 'active' | 'suspended') => {
    const verb = next === 'suspended' ? 'Suspend' : 'Reactivate';
    if (!window.confirm(`${verb} "${org.name}"?`)) return;

    setActingId(org.id);
    try {
      const res = await platformApi.setStatus(org.id, next);
      if (!res.success || !res.data) {
        toast({
          title: `${verb} failed`,
          description: res.error?.message ?? 'Could not update status.',
          variant: 'destructive',
        });
        return;
      }
      toast({ title: `${verb}d`, description: `${org.name} is now ${next}.` });
      refresh();
    } catch (e) {
      toast({
        title: `${verb} failed`,
        description: e instanceof Error ? e.message : 'Unexpected error.',
        variant: 'destructive',
      });
    } finally {
      setActingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <header className="flex flex-col gap-6 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">
              Platform owner · Cross-tenant authority
            </p>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Organization registry</h1>
          <p className="text-sm font-medium text-muted-foreground italic">
            Provision, govern, and audit every tenant on the platform.
          </p>
        </div>
        <CreateOrgDialog onCreated={refresh} />
      </header>

      <MetricsStrip metrics={metrics} />

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search organizations by name…"
            className="h-11 rounded-xl pl-11"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-11 w-full rounded-xl md:w-56">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {ORG_TYPE_FILTER_OPTIONS.map((type) => (
              <SelectItem key={type} value={type}>
                {ORG_TYPE_CONFIG[type].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 w-full rounded-xl md:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-2 rounded-2xl overflow-hidden shadow-sm">
        <CardContent className="p-0">
          {error ? (
            <div className="flex flex-col items-center gap-4 p-16 text-center">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <p className="text-sm font-bold text-red-600">{error}</p>
              <Button variant="outline" onClick={() => void loadOrgs()}>
                Retry
              </Button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center gap-4 p-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-40" />
              <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Loading organizations…
              </p>
            </div>
          ) : orgs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-16 text-center">
              <Building className="h-10 w-10 text-muted-foreground opacity-40" />
              <p className="text-sm font-bold">No organizations match your filters.</p>
              <p className="text-xs text-muted-foreground">
                Adjust the search or filters, or create a new organization.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">
                    Organization
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Type</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Members</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Country</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Created</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgs.map((org) => {
                  const busy = actingId === org.id;
                  return (
                    <TableRow
                      key={org.id}
                      className="group cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={() => router.push(`/platform/organizations/${org.id}`)}
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 bg-muted/30">
                            <Building className="h-5 w-5 text-primary opacity-70" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-black uppercase tracking-tight leading-none">
                              {org.name}
                            </p>
                            <p className="truncate text-[10px] font-bold text-muted-foreground">
                              {org.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold uppercase tracking-tight">
                          {typeLabel(org.type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <OrgStatusBadge status={org.status} />
                      </TableCell>
                      <TableCell className="tabular-nums font-bold">{org.memberCount ?? '—'}</TableCell>
                      <TableCell>
                        {org.country ? (
                          <span className="flex items-center gap-2 text-xs font-bold uppercase">
                            <span className="text-lg">{getFlag(org.country)}</span>
                            {org.country}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground">
                        {formatDate(org.createdAt)}
                      </TableCell>
                      <TableCell className="pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {org.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => handleSetStatus(org, 'suspended')}
                              className="h-8 border-red-500/30 text-red-600 hover:bg-red-500/10 text-[11px] font-bold uppercase"
                            >
                              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                              <span className="ml-1.5 hidden sm:inline">Suspend</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => handleSetStatus(org, 'active')}
                              className="h-8 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 text-[11px] font-bold uppercase"
                            >
                              {busy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              <span className="ml-1.5 hidden sm:inline">Reactivate</span>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => router.push(`/platform/organizations/${org.id}`)}
                            className="h-8 text-[11px] font-bold uppercase"
                          >
                            Manage <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Page <span className="font-black text-foreground">{page}</span> of{' '}
            <span className="font-black text-foreground">{totalPages}</span> ·{' '}
            <span className="tabular-nums">{total}</span> organizations
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function PlatformOrganizationsPage() {
  return (
    <PlatformGate>
      <RegistryConsole />
    </PlatformGate>
  );
}
