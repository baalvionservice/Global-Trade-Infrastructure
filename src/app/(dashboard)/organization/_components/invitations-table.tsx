'use client';

/**
 * @file invitations-table.tsx
 * @description Pending invitations roster: resend or revoke (with confirm) per invite.
 * Actions are gated on canManageUsers; auth-service enforces authorization server-side.
 */

import { useState } from 'react';
import { Loader2, Send, Trash2, MailWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { orgAdminApi, type OrgInvitation } from '@/lib/admin-api';
import { EmptyState, RoleBadge, formatDate } from './org-ui';

interface InvitationsTableProps {
  orgId: string;
  invitations: OrgInvitation[];
  canManage: boolean;
  onChanged: () => void;
}

export function InvitationsTable({ orgId, invitations, canManage, onChanged }: InvitationsTableProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<OrgInvitation | null>(null);
  const [revoking, setRevoking] = useState(false);

  const resend = async (inv: OrgInvitation) => {
    setBusy(inv.id);
    const res = await orgAdminApi.resendInvitation(orgId, inv.id);
    setBusy(null);
    if (res.success) {
      toast({ title: 'Invitation resent', description: `A fresh invite was sent to ${inv.email}.` });
      onChanged();
    } else {
      toast({ variant: 'destructive', title: 'Resend failed', description: res.error?.message ?? 'Could not resend the invitation.' });
    }
  };

  const confirmRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    const res = await orgAdminApi.revokeInvitation(orgId, revokeTarget.id);
    setRevoking(false);
    if (res.success) {
      toast({ title: 'Invitation revoked' });
      onChanged();
    } else {
      toast({ variant: 'destructive', title: 'Revoke failed', description: res.error?.message ?? 'Could not revoke the invitation.' });
    }
    setRevokeTarget(null);
  };

  if (invitations.length === 0) {
    return <EmptyState message="No pending invitations." />;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Email</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Role</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Expires</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">State</TableHead>
              {canManage && <TableHead className="text-right text-[9px] font-black uppercase tracking-widest">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((inv) => (
              <TableRow key={inv.id} className="hover:bg-muted/10">
                <TableCell>
                  <p className="font-black text-sm tracking-tight">{inv.email}</p>
                  {inv.fullName && <p className="text-[11px] text-muted-foreground">{inv.fullName}</p>}
                </TableCell>
                <TableCell>
                  <RoleBadge role={inv.role} />
                </TableCell>
                <TableCell className="text-[11px] font-bold text-muted-foreground">{formatDate(inv.expiresAt)}</TableCell>
                <TableCell>
                  {inv.expired ? (
                    <Badge variant="outline" className="h-6 px-3 text-[9px] font-black uppercase tracking-widest border-destructive/40 text-destructive">
                      <MailWarning className="mr-1 h-3 w-3" /> Expired
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="h-6 px-3 text-[9px] font-black uppercase tracking-widest border-amber-300 text-amber-600">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy !== null}
                        onClick={() => resend(inv)}
                        className="h-8 px-3 font-black uppercase text-[9px] tracking-widest border-2"
                      >
                        {busy === inv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
                        Resend
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy !== null}
                        onClick={() => setRevokeTarget(inv)}
                        className="h-8 px-3 font-black uppercase text-[9px] tracking-widest text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Revoke
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={revokeTarget !== null} onOpenChange={(o) => !o && setRevokeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Revoke invitation</DialogTitle>
            <DialogDescription className="font-medium">
              {revokeTarget ? `Revoke the invitation for ${revokeTarget.email}? The invite link will stop working.` : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRevokeTarget(null)} disabled={revoking} className="font-bold uppercase text-[10px] tracking-widest">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRevoke} disabled={revoking} className="font-black uppercase text-[10px] tracking-widest">
              {revoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
