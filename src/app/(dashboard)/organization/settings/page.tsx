'use client';

/**
 * @file organization/settings/page.tsx
 * @description Organization profile + ownership transfer (self-service org admin).
 * Loads the caller's own org via orgAdminApi.getOrg(orgId); inline edit of the
 * profile fields is gated on canManageOrganization, and ownership transfer is
 * owner-only. auth-service enforces all of this server-side regardless of the UI gate.
 */

import { useCallback, useEffect, useState } from 'react';
import { Building2, Crown, Loader2, Save, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppState } from '../../_components/app-state';
import { canManageOrganization } from '@/core/authorization';
import { MEMBERSHIP_ROLES, getOrgTypeLabel, resolveOrgType } from '@/core/organizations';
import { orgAdminApi, type Organization, type OrgMember } from '@/lib/admin-api';
import { ErrorBanner, LoadingBlock, PageHeader, StatusBadge } from '../_components/org-ui';

type EditableFields = Pick<
  Organization,
  'name' | 'legalName' | 'displayName' | 'country' | 'jurisdiction' | 'contactEmail' | 'contactPhone'
>;

const FIELD_DEFS: ReadonlyArray<{ key: keyof EditableFields; label: string; type?: string; required?: boolean }> = [
  { key: 'name', label: 'Organization Name', required: true },
  { key: 'legalName', label: 'Legal Entity Name' },
  { key: 'displayName', label: 'Display Name' },
  { key: 'country', label: 'Country' },
  { key: 'jurisdiction', label: 'Jurisdiction' },
  { key: 'contactEmail', label: 'Contact Email', type: 'email' },
  { key: 'contactPhone', label: 'Contact Phone', type: 'tel' },
];

function toForm(org: Organization): EditableFields {
  return {
    name: org.name,
    legalName: org.legalName,
    displayName: org.displayName,
    country: org.country,
    jurisdiction: org.jurisdiction,
    contactEmail: org.contactEmail,
    contactPhone: org.contactPhone,
  };
}

export default function OrganizationSettingsPage() {
  const { toast } = useToast();
  const { tenantId, authz, membershipRole } = useAppState();
  const orgId = tenantId;

  const canManage = canManageOrganization(authz);
  const isOwner = membershipRole === MEMBERSHIP_ROLES.OWNER;

  const [org, setOrg] = useState<Organization | null>(null);
  const [form, setForm] = useState<EditableFields | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await orgAdminApi.getOrg(orgId);
    if (res.success && res.data) {
      setOrg(res.data);
      setForm(toForm(res.data));
    } else {
      setError(res.error?.message ?? 'Could not load the organization.');
    }
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key: keyof EditableFields, value: string) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSave = async () => {
    if (!form || !canManage) return;
    if (!form.name?.trim()) {
      toast({ variant: 'destructive', title: 'Name required', description: 'Organization name cannot be empty.' });
      return;
    }
    setSaving(true);
    const res = await orgAdminApi.updateOrg(orgId, {
      name: form.name.trim(),
      legalName: form.legalName ?? undefined,
      displayName: form.displayName ?? undefined,
      country: form.country ?? undefined,
      jurisdiction: form.jurisdiction ?? undefined,
      contactEmail: form.contactEmail ?? undefined,
      contactPhone: form.contactPhone ?? undefined,
    });
    setSaving(false);
    if (res.success && res.data) {
      setOrg(res.data);
      setForm(toForm(res.data));
      toast({ title: 'Organization updated', description: 'Profile changes were saved.' });
    } else {
      toast({ variant: 'destructive', title: 'Update failed', description: res.error?.message ?? 'Could not save changes.' });
    }
  };

  const resolvedType = org ? resolveOrgType(org.type) : null;
  const orgTypeLabel = resolvedType ? getOrgTypeLabel(resolvedType) : (org?.type ?? '');

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <PageHeader
        eyebrow="Organization Administration"
        title="Organization Settings"
        description="Maintain your organization's authoritative profile and steward ownership of the node."
      />

      {loading ? (
        <LoadingBlock label="Loading organization…" />
      ) : error ? (
        <ErrorBanner message={error} onRetry={load} />
      ) : org && form ? (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-xl border-2 rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/10 border-b py-6 px-6">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
                  <Building2 className="h-7 w-7 text-primary" /> Institutional Registry
                </CardTitle>
                <CardDescription className="font-medium text-sm italic">
                  {canManage
                    ? 'Edit the corporate node data carried across the global ledger.'
                    : 'Read-only. Organization management is reserved for owners.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {FIELD_DEFS.map((f) => (
                    <div key={f.key} className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground ml-1">
                        {f.label}
                      </Label>
                      <Input
                        type={f.type ?? 'text'}
                        value={form[f.key] ?? ''}
                        onChange={(e) => setField(f.key, e.target.value)}
                        disabled={!canManage || saving}
                        className="h-12 font-bold border-2 rounded-2xl disabled:bg-muted/30 disabled:cursor-not-allowed"
                      />
                    </div>
                  ))}
                </div>
                {canManage && (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-8 font-black uppercase tracking-widest text-[11px] shadow-xl"
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Profile
                  </Button>
                )}
              </CardContent>
            </Card>

            <TransferOwnershipCard orgId={orgId} ownerId={org.ownerId} isOwner={isOwner} onTransferred={load} />
          </div>

          {/* Identity sidebar */}
          <div className="space-y-8">
            <Card className="shadow-xl border-2 rounded-2xl">
              <CardHeader className="bg-muted/10 border-b py-6 px-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Node Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                    Organization Type
                  </p>
                  <p className="text-lg font-black uppercase tracking-tight">{orgTypeLabel}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Status</p>
                  <StatusBadge status={org.status} />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Plan</p>
                  <p className="text-sm font-black uppercase tracking-tight">{org.plan}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Slug</p>
                  <p className="font-mono text-xs text-muted-foreground">{org.slug}</p>
                </div>
                {typeof org.memberCount === 'number' && (
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Members</p>
                    <p className="text-2xl font-black tracking-tighter">{org.memberCount}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </main>
  );
}

/** Owner-only ownership transfer. Lists active members and confirms before handover. */
function TransferOwnershipCard({
  orgId,
  ownerId,
  isOwner,
  onTransferred,
}: {
  orgId: string;
  ownerId: string | null;
  isOwner: boolean;
  onTransferred: () => void;
}) {
  const { toast } = useToast();
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    if (!isOwner) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await orgAdminApi.listMembers(orgId, false);
      if (!cancelled && res.success && res.data) {
        setMembers(res.data.filter((m) => m.status === 'active' && m.userId !== ownerId));
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [orgId, ownerId, isOwner]);

  if (!isOwner) return null;

  const selectedMember = members.find((m) => m.userId === selected);

  const handleTransfer = async () => {
    if (!selected) return;
    setTransferring(true);
    const res = await orgAdminApi.transferOwnership(orgId, selected);
    setTransferring(false);
    setConfirmOpen(false);
    if (res.success) {
      toast({ title: 'Ownership transferred', description: 'The selected member is now the organization owner.' });
      setSelected('');
      onTransferred();
    } else {
      toast({ variant: 'destructive', title: 'Transfer failed', description: res.error?.message ?? 'Could not transfer ownership.' });
    }
  };

  return (
    <Card className="shadow-xl border-2 border-amber-200 rounded-2xl overflow-hidden">
      <CardHeader className="bg-amber-50/60 border-b border-amber-100 py-6 px-6">
        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4 text-amber-900">
          <Crown className="h-7 w-7 text-amber-500" /> Transfer Ownership
        </CardTitle>
        <CardDescription className="font-medium text-sm italic text-amber-800/80">
          Hand sovereign control of this organization to another active member. This cannot be undone from this screen.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2 max-w-md">
          <Label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground ml-1">New Owner</Label>
          <Select value={selected} onValueChange={setSelected} disabled={loading || members.length === 0}>
            <SelectTrigger className="h-12 font-bold border-2 rounded-2xl" aria-label="Select new owner">
              <SelectValue placeholder={loading ? 'Loading members…' : members.length === 0 ? 'No eligible members' : 'Select a member'} />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.userId} value={m.userId} className="font-bold">
                  {m.fullName ? `${m.fullName} · ${m.email}` : m.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          disabled={!selected}
          onClick={() => setConfirmOpen(true)}
          className="h-12 px-8 font-black uppercase tracking-widest text-[11px] border-2 border-amber-400 text-amber-700 hover:bg-amber-50"
        >
          Transfer Ownership
        </Button>
      </CardContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Confirm ownership transfer</DialogTitle>
            <DialogDescription className="font-medium">
              {selectedMember
                ? `You are about to make ${selectedMember.fullName ?? selectedMember.email} the owner of this organization. You will be demoted to admin.`
                : 'Select a member first.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={transferring} className="font-bold uppercase text-[10px] tracking-widest">
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={transferring || !selected}
              className="font-black uppercase text-[10px] tracking-widest bg-amber-600 hover:bg-amber-700"
            >
              {transferring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
