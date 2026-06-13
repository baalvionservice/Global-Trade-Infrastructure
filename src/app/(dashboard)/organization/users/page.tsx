'use client';

/**
 * @file organization/users/page.tsx
 * @description Self-service member administration: the members roster (inline role edit +
 * lifecycle + security actions), single + bulk invite, and the pending-invitations roster.
 * Mutating UI is gated on canManageUsers; auth-service enforces authorization server-side.
 */

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Users, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '../../_components/app-state';
import { canManageUsers } from '@/core/authorization';
import { orgAdminApi, type OrgInvitation, type OrgMember } from '@/lib/admin-api';
import { ErrorBanner, LoadingBlock, PageHeader } from '../_components/org-ui';
import { MembersTable } from '../_components/members-table';
import { InvitationsTable } from '../_components/invitations-table';
import { InviteForm } from '../_components/invite-dialogs';

export default function OrganizationUsersPage() {
  const { tenantId, authz } = useAppState();
  const orgId = tenantId;
  const canManage = canManageUsers(authz);

  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invitations, setInvitations] = useState<OrgInvitation[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [invitesError, setInvitesError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setLoadingMembers(true);
    setMembersError(null);
    const res = await orgAdminApi.listMembers(orgId, true);
    if (res.success && res.data) setMembers(res.data);
    else setMembersError(res.error?.message ?? 'Could not load members.');
    setLoadingMembers(false);
  }, [orgId]);

  const loadInvitations = useCallback(async () => {
    setLoadingInvites(true);
    setInvitesError(null);
    const res = await orgAdminApi.listInvitations(orgId);
    if (res.success && res.data) setInvitations(res.data);
    else setInvitesError(res.error?.message ?? 'Could not load invitations.');
    setLoadingInvites(false);
  }, [orgId]);

  useEffect(() => {
    loadMembers();
    loadInvitations();
  }, [loadMembers, loadInvitations]);

  const activeCount = members.filter((m) => m.status === 'active').length;

  return (
    <main className="flex-1 space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <PageHeader
        eyebrow="Organization Administration"
        title="Members & Access"
        description="Provision identities, steward roles, and govern the lifecycle of everyone in your organization."
      >
        <Button
          variant="outline"
          onClick={() => {
            loadMembers();
            loadInvitations();
          }}
          disabled={loadingMembers || loadingInvites}
          className="h-12 px-6 font-black uppercase tracking-widest text-[10px] border-2 shadow-sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loadingMembers || loadingInvites ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </PageHeader>

      {canManage && <InviteForm orgId={orgId} onInvited={loadInvitations} />}

      {/* Members */}
      <Card className="shadow-xl border-2 rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/10 border-b py-6 px-6 flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
            <Users className="h-6 w-6 text-primary" /> Members
          </CardTitle>
          {!loadingMembers && !membersError && (
            <Badge variant="outline" className="h-7 px-3 text-[10px] font-black uppercase tracking-widest border-2">
              {activeCount} active · {members.length} total
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loadingMembers ? (
            <LoadingBlock label="Loading members…" />
          ) : membersError ? (
            <div className="p-6">
              <ErrorBanner message={membersError} onRetry={loadMembers} />
            </div>
          ) : (
            <MembersTable orgId={orgId} members={members} canManage={canManage} onChanged={loadMembers} />
          )}
        </CardContent>
      </Card>

      {/* Pending invitations */}
      <Card className="shadow-xl border-2 rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/10 border-b py-6 px-6 flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4">
            <Mail className="h-6 w-6 text-primary" /> Pending Invitations
          </CardTitle>
          {!loadingInvites && !invitesError && (
            <Badge variant="outline" className="h-7 px-3 text-[10px] font-black uppercase tracking-widest border-2">
              {invitations.length}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loadingInvites ? (
            <LoadingBlock label="Loading invitations…" />
          ) : invitesError ? (
            <div className="p-6">
              <ErrorBanner message={invitesError} onRetry={loadInvitations} />
            </div>
          ) : (
            <InvitationsTable orgId={orgId} invitations={invitations} canManage={canManage} onChanged={loadInvitations} />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
