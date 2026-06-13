'use client';

/**
 * @file invite-dialogs.tsx
 * @description Single-invite form + bulk-invite dialog for the organization users page.
 * Bulk invite parses CSV / newline `email,role` lines client-side, validates each role
 * against MEMBERSHIP_ROLES, and surfaces the {invited, failed} summary returned by the API.
 */

import { useMemo, useState } from 'react';
import { Loader2, UserPlus, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MEMBERSHIP_ROLES, type MembershipRole } from '@/core/organizations';
import { orgAdminApi } from '@/lib/admin-api';
import { ROLE_OPTIONS, RoleSelect } from './org-ui';

const VALID_ROLES = new Set<string>(Object.values(MEMBERSHIP_ROLES));

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

interface ParsedInvite {
  email: string;
  role: MembershipRole;
}

interface ParseResult {
  invites: ParsedInvite[];
  errors: string[];
}

/** Parse `email,role` lines (CSV or newline-separated). Validates email + role. */
export function parseBulkInvites(raw: string): ParseResult {
  const invites: ParsedInvite[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const parts = line.split(',').map((p) => p.trim());
    const email = (parts[0] ?? '').toLowerCase();
    const role = (parts[1] ?? '').toLowerCase();
    if (!email || !role) {
      errors.push(`"${line}" — expected "email,role".`);
      continue;
    }
    if (!isEmail(email)) {
      errors.push(`${email} — not a valid email.`);
      continue;
    }
    if (!VALID_ROLES.has(role)) {
      errors.push(`${email} — unknown role "${role}".`);
      continue;
    }
    if (seen.has(email)) {
      errors.push(`${email} — duplicate, skipped.`);
      continue;
    }
    seen.add(email);
    invites.push({ email, role: role as MembershipRole });
  }
  return { invites, errors };
}

/** Inline single-member invite form (card). */
export function InviteForm({ orgId, onInvited }: { orgId: string; onInvited: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<MembershipRole>(MEMBERSHIP_ROLES.VIEWER);
  const [busy, setBusy] = useState(false);

  const handleInvite = async () => {
    const normalized = email.trim().toLowerCase();
    if (!isEmail(normalized)) {
      toast({ variant: 'destructive', title: 'Invalid email', description: 'Enter a valid email address.' });
      return;
    }
    setBusy(true);
    const res = await orgAdminApi.invite(orgId, normalized, role, fullName.trim() || undefined);
    setBusy(false);
    if (res.success) {
      toast({ title: 'Invitation sent', description: `${normalized} was invited as ${role}.` });
      setEmail('');
      setFullName('');
      setRole(MEMBERSHIP_ROLES.VIEWER);
      onInvited();
    } else {
      toast({ variant: 'destructive', title: 'Invite failed', description: res.error?.message ?? 'Could not send invitation.' });
    }
  };

  return (
    <Card className="shadow-xl border-2 rounded-2xl overflow-hidden">
      <CardHeader className="bg-muted/10 border-b py-6 px-6 flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
            <UserPlus className="h-6 w-6 text-primary" /> Invite Member
          </CardTitle>
          <CardDescription className="font-medium text-sm italic">Provision a new identity into this organization.</CardDescription>
        </div>
        <BulkInviteDialog orgId={orgId} onInvited={onInvited} />
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground ml-1">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@org.com"
              className="h-11 font-bold border-2 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground ml-1">Full Name (optional)</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Trader"
              className="h-11 font-bold border-2 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground ml-1">Role</Label>
            <RoleSelect value={role} onValueChange={setRole} className="h-11 w-full md:w-[140px] font-bold border-2 rounded-xl text-xs uppercase" ariaLabel="Invite role" />
          </div>
          <Button onClick={handleInvite} disabled={busy} className="h-11 px-6 font-black uppercase tracking-widest text-[10px]">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />} Invite
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type BulkSummary = {
  invited: { email: string; role: string; id: string }[];
  failed: { email: string; reason: string }[];
};

/** CSV / newline bulk invite dialog. */
export function BulkInviteDialog({ orgId, onInvited }: { orgId: string; onInvited: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState('');
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<BulkSummary | null>(null);

  const parsed = useMemo(() => parseBulkInvites(raw), [raw]);

  const handleSubmit = async () => {
    if (parsed.invites.length === 0) {
      toast({ variant: 'destructive', title: 'Nothing to invite', description: 'No valid "email,role" lines were found.' });
      return;
    }
    setBusy(true);
    const res = await orgAdminApi.bulkInvite(orgId, parsed.invites);
    setBusy(false);
    if (res.success && res.data) {
      setSummary(res.data);
      toast({
        title: 'Bulk invite processed',
        description: `${res.data.invited.length} invited, ${res.data.failed.length} failed.`,
      });
      onInvited();
    } else {
      toast({ variant: 'destructive', title: 'Bulk invite failed', description: res.error?.message ?? 'Could not process bulk invites.' });
    }
  };

  const reset = () => {
    setRaw('');
    setSummary(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 px-5 font-black uppercase tracking-widest text-[10px] border-2">
          <Upload className="mr-2 h-4 w-4" /> Bulk Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight">Bulk invite members</DialogTitle>
          <DialogDescription className="font-medium">
            One per line as <span className="font-mono">email,role</span>. Roles: {ROLE_OPTIONS.map((r) => r.value).join(', ')}.
          </DialogDescription>
        </DialogHeader>

        {summary ? (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
            <div className="p-4 rounded-2xl border-2 bg-emerald-50/60 border-emerald-200">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Invited ({summary.invited.length})</p>
              <ul className="mt-2 space-y-1 text-xs font-bold text-emerald-900">
                {summary.invited.map((i) => (
                  <li key={i.id}>{i.email} · {i.role}</li>
                ))}
                {summary.invited.length === 0 && <li className="opacity-50">None</li>}
              </ul>
            </div>
            {summary.failed.length > 0 && (
              <div className="p-4 rounded-2xl border-2 bg-destructive/5 border-destructive/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-destructive">Failed ({summary.failed.length})</p>
                <ul className="mt-2 space-y-1 text-xs font-bold text-destructive">
                  {summary.failed.map((f) => (
                    <li key={f.email}>{f.email} — {f.reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={8}
              placeholder={'analyst@org.com,analyst\noperator@org.com,operator'}
              className="font-mono text-xs border-2 rounded-2xl p-4"
            />
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-emerald-600">{parsed.invites.length} valid</span>
              {parsed.errors.length > 0 && <span className="text-destructive">{parsed.errors.length} ignored</span>}
            </div>
            {parsed.errors.length > 0 && (
              <ul className="max-h-28 overflow-y-auto space-y-1 text-[11px] font-medium text-destructive">
                {parsed.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <DialogFooter>
          {summary ? (
            <>
              <Button variant="ghost" onClick={reset} className="font-bold uppercase text-[10px] tracking-widest">
                Invite More
              </Button>
              <Button onClick={() => setOpen(false)} className="font-black uppercase text-[10px] tracking-widest">
                Done
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)} className="font-bold uppercase text-[10px] tracking-widest">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={busy || parsed.invites.length === 0} className="font-black uppercase text-[10px] tracking-widest">
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send {parsed.invites.length} Invite{parsed.invites.length === 1 ? '' : 's'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
