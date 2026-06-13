'use client';

/**
 * @file members-table.tsx
 * @description Members roster for the organization users page. Inline role edit (7 roles),
 * member-lifecycle row actions (suspend/reactivate/remove), and security actions
 * (force password reset / force MFA). The owner row is protected: role is locked and the
 * member cannot be removed. All mutating actions are gated on canManageUsers; auth-service
 * is the authoritative gate regardless.
 */

import { useState } from 'react';
import { Loader2, MoreHorizontal, ShieldCheck, ShieldOff, KeyRound, UserMinus, Pause, Play, Crown } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MEMBERSHIP_ROLES, type MembershipRole } from '@/core/organizations';
import { orgAdminApi, type OrgMember } from '@/lib/admin-api';
import { EmptyState, RoleSelect, StatusBadge, formatDate } from './org-ui';

interface MembersTableProps {
  orgId: string;
  members: OrgMember[];
  canManage: boolean;
  onChanged: () => void;
}

export function MembersTable({ orgId, members, canManage, onChanged }: MembersTableProps) {
  const { toast } = useToast();
  const [busyUser, setBusyUser] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<OrgMember | null>(null);
  const [removing, setRemoving] = useState(false);

  const notify = (ok: boolean, okMsg: string, err?: string) =>
    ok
      ? toast({ title: okMsg })
      : toast({ variant: 'destructive', title: 'Action failed', description: err ?? 'Could not complete the action.' });

  const run = async (
    userId: string,
    action: () => Promise<{ success: boolean; error?: { message: string } }>,
    okMsg: string,
  ) => {
    setBusyUser(userId);
    const res = await action();
    setBusyUser(null);
    notify(res.success, okMsg, res.error?.message);
    if (res.success) onChanged();
  };

  const changeRole = async (m: OrgMember, role: MembershipRole) => {
    if (role === m.role) return;
    await run(m.userId, () => orgAdminApi.updateMemberRole(orgId, m.userId, role), `Role updated to ${role}.`);
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    const res = await orgAdminApi.removeMember(orgId, removeTarget.userId);
    setRemoving(false);
    notify(res.success, 'Member removed.', res.error?.message);
    setRemoveTarget(null);
    if (res.success) onChanged();
  };

  if (members.length === 0) {
    return <EmptyState message="No members in this organization yet." />;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Member</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Role</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">MFA</TableHead>
              <TableHead className="text-[9px] font-black uppercase tracking-widest">Last Login</TableHead>
              {canManage && <TableHead className="text-right text-[9px] font-black uppercase tracking-widest">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => {
              const isOwnerRow = m.role === MEMBERSHIP_ROLES.OWNER;
              const isSuspended = m.status === 'suspended';
              const busy = busyUser === m.userId;
              return (
                <TableRow key={m.userId} className="hover:bg-muted/10">
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
                        {(m.fullName ?? m.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm tracking-tight truncate flex items-center gap-1.5">
                          {m.fullName ?? m.email.split('@')[0]}
                          {isOwnerRow && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">{m.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {canManage && !isOwnerRow ? (
                      <RoleSelect
                        value={m.role}
                        onValueChange={(role) => changeRole(m, role)}
                        disabled={busy}
                        ariaLabel={`Role for ${m.email}`}
                      />
                    ) : (
                      <Badge variant="outline" className="h-6 px-3 text-[9px] font-black uppercase tracking-widest border-muted-foreground/30">
                        {m.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                      {m.mfaEnabled ? (
                        <span className="text-emerald-600 flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> On</span>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1"><ShieldOff className="h-3.5 w-3.5" /> Off</span>
                      )}
                      {m.mfaRequired && (
                        <Badge variant="outline" className="h-5 px-1.5 text-[8px] font-black uppercase border-amber-300 text-amber-600">Req</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-[11px] font-bold text-muted-foreground">{formatDate(m.lastLoginAt)}</TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary ml-auto" />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label={`Actions for ${m.email}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            {isSuspended ? (
                              <DropdownMenuItem
                                className="text-xs font-bold uppercase tracking-wide"
                                onClick={() => run(m.userId, () => orgAdminApi.reactivateMember(orgId, m.userId), 'Member reactivated.')}
                              >
                                <Play className="mr-2 h-3.5 w-3.5" /> Reactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-xs font-bold uppercase tracking-wide"
                                disabled={isOwnerRow}
                                onClick={() => run(m.userId, () => orgAdminApi.suspendMember(orgId, m.userId), 'Member suspended.')}
                              >
                                <Pause className="mr-2 h-3.5 w-3.5" /> Suspend
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-xs font-bold uppercase tracking-wide"
                              onClick={() =>
                                run(m.userId, () => orgAdminApi.forcePasswordReset(orgId, m.userId), 'Reset email sent.')
                              }
                            >
                              <KeyRound className="mr-2 h-3.5 w-3.5" /> Force Password Reset
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-xs font-bold uppercase tracking-wide"
                              disabled={m.mfaRequired}
                              onClick={() => run(m.userId, () => orgAdminApi.forceMfa(orgId, m.userId, true), 'MFA now required for member.')}
                            >
                              <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Force MFA
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-xs font-bold uppercase tracking-wide text-destructive focus:text-destructive"
                              disabled={isOwnerRow}
                              onClick={() => setRemoveTarget(m)}
                            >
                              <UserMinus className="mr-2 h-3.5 w-3.5" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={removeTarget !== null} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Remove member</DialogTitle>
            <DialogDescription className="font-medium">
              {removeTarget
                ? `Remove ${removeTarget.fullName ?? removeTarget.email} from this organization? They will lose all access immediately.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)} disabled={removing} className="font-bold uppercase text-[10px] tracking-widest">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemove}
              disabled={removing}
              className="font-black uppercase text-[10px] tracking-widest"
            >
              {removing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
