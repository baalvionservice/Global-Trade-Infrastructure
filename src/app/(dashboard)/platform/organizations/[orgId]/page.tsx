/**
 * @file platform/organizations/[orgId]/page.tsx
 * @description Platform-owner organization detail. Inline-edit the org profile, inspect its members,
 * and review its audit trail. Suspend/reactivate from the header. All writes go through platformApi
 * and are authoritatively gated by auth-service; the client gate is UX only.
 */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Building,
  Loader2,
  Save,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Users,
  History,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import {
  platformApi,
  type Organization,
  type OrgMember,
  type AuditLog,
  type CreateOrgInput,
} from '@/lib/admin-api';
import { ORG_TYPE_CONFIG, resolveOrgType, type OrgType } from '@/core/organizations';
import { getFlag } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PlatformGate } from '../_components/platform-gate';
import { OrgStatusBadge } from '../_components/org-status-badge';

const AUDIT_PAGE_LIMIT = 25;
const ORG_TYPE_OPTIONS = Object.keys(ORG_TYPE_CONFIG) as OrgType[];

function typeLabel(type: OrgType | string): string {
  const resolved = resolveOrgType(type);
  return resolved ? ORG_TYPE_CONFIG[resolved].label : String(type);
}

function formatDateTime(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

type EditState = {
  name: string;
  type: OrgType | '';
  slug: string;
  legalName: string;
  displayName: string;
  country: string;
  jurisdiction: string;
  contactEmail: string;
  contactPhone: string;
};

function toEditState(org: Organization): EditState {
  return {
    name: org.name ?? '',
    type: resolveOrgType(org.type) ?? '',
    slug: org.slug ?? '',
    legalName: org.legalName ?? '',
    displayName: org.displayName ?? '',
    country: org.country ?? '',
    jurisdiction: org.jurisdiction ?? '',
    contactEmail: org.contactEmail ?? '',
    contactPhone: org.contactPhone ?? '',
  };
}

// ── Profile tab ───────────────────────────────────────────────────────────────

function ProfileTab({
  org,
  onSaved,
}: {
  org: Organization;
  onSaved: (updated: Organization) => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<EditState>(() => toEditState(org));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seed the form when the source org changes (e.g. after a status flip refresh).
  useEffect(() => {
    setForm(toEditState(org));
  }, [org]);

  const setField = (key: keyof EditState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const dirty = useMemo(() => {
    const base = toEditState(org);
    return (Object.keys(base) as (keyof EditState)[]).some((k) => base[k] !== form[k]);
  }, [org, form]);

  const handleSave = async () => {
    setError(null);
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!form.type) {
      setError('Type is required.');
      return;
    }
    if (form.country && form.country.trim().length !== 2) {
      setError('Country must be a 2-letter ISO code.');
      return;
    }

    const fields: Partial<CreateOrgInput> = {
      name: form.name.trim(),
      type: form.type,
      slug: form.slug.trim() || undefined,
      legalName: form.legalName.trim() || undefined,
      displayName: form.displayName.trim() || undefined,
      country: form.country.trim() ? form.country.trim().toUpperCase() : undefined,
      jurisdiction: form.jurisdiction.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      contactPhone: form.contactPhone.trim() || undefined,
    };

    setSaving(true);
    try {
      const res = await platformApi.updateOrganization(org.id, fields);
      if (!res.success || !res.data) {
        setError(res.error?.message ?? 'Failed to save changes.');
        return;
      }
      toast({ title: 'Profile saved', description: `${res.data.name} updated.` });
      onSaved(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 rounded-2xl shadow-sm">
        <CardHeader className="border-b bg-muted/10 p-6">
          <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter">
            <Building className="h-5 w-5 text-primary" /> Organization profile
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 p-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="d-name">Name</Label>
            <Input id="d-name" value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-type">Type</Label>
            <Select value={form.type} onValueChange={(v) => setField('type', v)}>
              <SelectTrigger id="d-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ORG_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {ORG_TYPE_CONFIG[type].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-slug">Slug</Label>
            <Input id="d-slug" value={form.slug} onChange={(e) => setField('slug', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-legal">Legal name</Label>
            <Input id="d-legal" value={form.legalName} onChange={(e) => setField('legalName', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-display">Display name</Label>
            <Input id="d-display" value={form.displayName} onChange={(e) => setField('displayName', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-country">Country (2-letter)</Label>
            <Input
              id="d-country"
              maxLength={2}
              value={form.country}
              onChange={(e) => setField('country', e.target.value.toUpperCase())}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-juris">Jurisdiction</Label>
            <Input id="d-juris" value={form.jurisdiction} onChange={(e) => setField('jurisdiction', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-email">Contact email</Label>
            <Input
              id="d-email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setField('contactEmail', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-phone">Contact phone</Label>
            <Input id="d-phone" value={form.contactPhone} onChange={(e) => setField('contactPhone', e.target.value)} />
          </div>

          {error && (
            <p className="md:col-span-2 rounded-xl border-2 border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="md:col-span-2 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="font-black uppercase tracking-widest text-[11px]"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Users tab ─────────────────────────────────────────────────────────────────

function UsersTab({ orgId }: { orgId: string }) {
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformApi.listUsers(orgId);
      if (!res.success || !res.data) {
        setError(res.error?.message ?? 'Failed to load members.');
        setMembers([]);
        return;
      }
      setMembers(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error loading members.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card className="border-2 rounded-2xl overflow-hidden shadow-sm">
      <CardContent className="p-0">
        {error ? (
          <div className="flex flex-col items-center gap-4 p-12 text-center">
            <AlertTriangle className="h-9 w-9 text-red-500" />
            <p className="text-sm font-bold text-red-600">{error}</p>
            <Button variant="outline" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-3 p-12">
            <Loader2 className="h-7 w-7 animate-spin text-primary opacity-40" />
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Loading members…
            </p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Users className="h-9 w-9 text-muted-foreground opacity-40" />
            <p className="text-sm font-bold">No members yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Member</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Role</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Member status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Account</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">MFA</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest pr-6">Last login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="pl-6 py-4">
                    <p className="font-bold leading-none">{m.fullName ?? '—'}</p>
                    <p className="text-[11px] text-muted-foreground">{m.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-2 text-[9px] uppercase">
                      {m.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        m.status === 'active'
                          ? 'text-xs font-bold uppercase text-emerald-600'
                          : 'text-xs font-bold uppercase text-muted-foreground'
                      }
                    >
                      {m.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-medium uppercase text-muted-foreground">
                    {m.userStatus}
                  </TableCell>
                  <TableCell>
                    {m.mfaEnabled ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <ShieldCheck className="h-3.5 w-3.5" /> On
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">Off</span>
                    )}
                  </TableCell>
                  <TableCell className="pr-6 text-xs font-medium text-muted-foreground">
                    {formatDateTime(m.lastLoginAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ── Activity tab ────────────────────────────────────────────────────────────────

function ActivityTab({ orgId }: { orgId: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformApi.audit(orgId, { page, limit: AUDIT_PAGE_LIMIT });
      if (!res.success || !res.data) {
        setError(res.error?.message ?? 'Failed to load activity.');
        setLogs([]);
        setTotal(0);
        return;
      }
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error loading activity.');
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [orgId, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / AUDIT_PAGE_LIMIT));

  return (
    <Card className="border-2 rounded-2xl overflow-hidden shadow-sm">
      <CardContent className="p-0">
        {error ? (
          <div className="flex flex-col items-center gap-4 p-12 text-center">
            <AlertTriangle className="h-9 w-9 text-red-500" />
            <p className="text-sm font-bold text-red-600">{error}</p>
            <Button variant="outline" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-3 p-12">
            <Loader2 className="h-7 w-7 animate-spin text-primary opacity-40" />
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Loading activity…
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <History className="h-9 w-9 text-muted-foreground opacity-40" />
            <p className="text-sm font-bold">No activity recorded.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Action</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">When</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Actor</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest pr-6">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="pl-6 py-4">
                      <Badge variant="outline" className="border-2 text-[9px] uppercase">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {log.user_id ?? 'system'}
                    </TableCell>
                    <TableCell className="pr-6">
                      <code className="block max-w-md truncate rounded bg-muted/40 px-2 py-1 text-[10px] text-muted-foreground">
                        {log.metadata && Object.keys(log.metadata).length > 0
                          ? JSON.stringify(log.metadata)
                          : log.resource_type ?? '—'}
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Page <span className="font-black text-foreground">{page}</span> of{' '}
                <span className="font-black text-foreground">{totalPages}</span> ·{' '}
                <span className="tabular-nums">{total}</span> events
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Detail console ──────────────────────────────────────────────────────────────

function DetailConsole({ orgId }: { orgId: string }) {
  const { toast } = useToast();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformApi.getOrganization(orgId);
      if (!res.success || !res.data) {
        setError(res.error?.message ?? 'Organization not found.');
        setOrg(null);
        return;
      }
      setOrg(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error loading organization.');
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSetStatus = async (next: 'active' | 'suspended') => {
    if (!org) return;
    const verb = next === 'suspended' ? 'Suspend' : 'Reactivate';
    if (!window.confirm(`${verb} "${org.name}"?`)) return;

    setStatusBusy(true);
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
      setOrg(res.data);
      toast({ title: `${verb}d`, description: `${org.name} is now ${next}.` });
    } catch (e) {
      toast({
        title: `${verb} failed`,
        description: e instanceof Error ? e.message : 'Unexpected error.',
        variant: 'destructive',
      });
    } finally {
      setStatusBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-9 w-9 animate-spin text-primary opacity-40" />
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          Loading organization…
        </p>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <p className="text-sm font-bold text-red-600">{error ?? 'Organization not found.'}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()}>
            Retry
          </Button>
          <Link href="/platform/organizations">
            <Button>Back to organizations</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <Link
        href="/platform/organizations"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to organizations
      </Link>

      <header className="flex flex-col gap-6 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 bg-muted/30">
            <Building className="h-7 w-7 text-primary opacity-70" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{org.name}</h1>
              <OrgStatusBadge status={org.status} />
            </div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>{typeLabel(org.type)}</span>
              <span>·</span>
              <span>{org.slug}</span>
              {org.country && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <span className="text-base">{getFlag(org.country)}</span>
                    {org.country}
                  </span>
                </>
              )}
              <span>·</span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {org.memberCount ?? 0} members
              </span>
            </p>
            {org.owner && (
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                <Crown className="h-3.5 w-3.5 text-amber-500" />
                Owner: {org.owner.fullName ?? org.owner.email}{' '}
                <span className="font-normal">({org.owner.email})</span>
              </p>
            )}
          </div>
        </div>

        <div>
          {org.status === 'active' ? (
            <Button
              variant="outline"
              disabled={statusBusy}
              onClick={() => handleSetStatus('suspended')}
              className="h-11 border-red-500/30 text-red-600 hover:bg-red-500/10 font-black uppercase tracking-widest text-[11px]"
            >
              {statusBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
              Suspend organization
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={statusBusy}
              onClick={() => handleSetStatus('active')}
              className="h-11 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 font-black uppercase tracking-widest text-[11px]"
            >
              {statusBusy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Reactivate organization
            </Button>
          )}
        </div>
      </header>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="font-black uppercase tracking-widest text-[11px]">
            Profile
          </TabsTrigger>
          <TabsTrigger value="users" className="font-black uppercase tracking-widest text-[11px]">
            Users
          </TabsTrigger>
          <TabsTrigger value="activity" className="font-black uppercase tracking-widest text-[11px]">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab org={org} onSaved={setOrg} />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab orgId={org.id} />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityTab orgId={org.id} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default function PlatformOrganizationDetailPage() {
  const params = useParams<{ orgId: string }>();
  const orgId = Array.isArray(params.orgId) ? params.orgId[0] : params.orgId;

  return (
    <PlatformGate>
      {orgId ? (
        <DetailConsole orgId={orgId} />
      ) : (
        <div className="flex h-[70vh] items-center justify-center">
          <p className="text-sm font-bold text-muted-foreground">Invalid organization id.</p>
        </div>
      )}
    </PlatformGate>
  );
}
