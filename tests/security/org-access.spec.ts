import { test, expect } from '@playwright/test';
import {
  ORG_TYPES,
  OrgType,
  ORG_TYPE_CONFIG,
  getDashboardForOrgType,
  orgTypeAllowsPath,
  resolveOrgType,
  resolveMembershipRole,
  getRoleCapabilities,
  isPlatformOrgType,
} from '../../src/core/organizations';
import {
  AuthzContext,
  canView,
  canEdit,
  canApprove,
  canManageUsers,
  canManageOrganization,
  canAccessDashboard,
} from '../../src/core/authorization';

const ALL_ORG_TYPES = Object.values(ORG_TYPES) as OrgType[];

// Expected (spec-defined) dashboard per organization type.
const EXPECTED_DASHBOARD: Record<OrgType, string> = {
  buyer: '/buyer/dashboard',
  seller: '/seller/dashboard',
  trade_agent: '/agent/dashboard',
  logistics_provider: '/logistics-shipment/control-tower',
  customs_authority: '/governance/customs',
  bank: '/governance/bank-admin',
  insurance_provider: '/insurance',
  compliance_agency: '/governance/compliance-admin',
  regulator: '/governance',
  platform_owner: '/executive/command',
};

const ctx = (orgType: OrgType | null, role: string, isPlatformAdmin = false): AuthzContext => ({
  orgType,
  role: resolveMembershipRole(role),
  isPlatformAdmin,
});

test.describe('organization-type → dashboard mapping', () => {
  test('every org type maps to its spec-defined dashboard', () => {
    for (const type of ALL_ORG_TYPES) {
      expect(getDashboardForOrgType(type), type).toBe(EXPECTED_DASHBOARD[type]);
    }
  });

  test('every org type allows its OWN dashboard (no guard redirect loop)', () => {
    for (const type of ALL_ORG_TYPES) {
      expect(orgTypeAllowsPath(type, ORG_TYPE_CONFIG[type].home), type).toBe(true);
    }
  });

  test('resolveOrgType is an explicit allowlist (unknown → null)', () => {
    expect(resolveOrgType('bank')).toBe('bank');
    expect(resolveOrgType('Customs Authority')).toBe('customs_authority'); // normalized
    expect(resolveOrgType('hacker')).toBeNull();
    expect(resolveOrgType(undefined)).toBeNull();
  });
});

test.describe('cross-organization isolation', () => {
  test('a buyer cannot reach bank / customs / regulator surfaces', () => {
    expect(orgTypeAllowsPath('buyer', '/governance/bank-admin')).toBe(false);
    expect(orgTypeAllowsPath('buyer', '/governance/customs')).toBe(false);
    expect(orgTypeAllowsPath('buyer', '/governance')).toBe(false);
  });

  test('a bank cannot reach the buyer / seller dashboards', () => {
    expect(orgTypeAllowsPath('bank', '/buyer/dashboard')).toBe(false);
    expect(orgTypeAllowsPath('bank', '/seller/dashboard')).toBe(false);
  });

  test('canAccessDashboard blocks members from another org type', () => {
    const buyer = ctx('buyer', 'admin');
    expect(canAccessDashboard(buyer, '/buyer/dashboard')).toBe(true);
    expect(canAccessDashboard(buyer, '/governance/bank-admin')).toBe(false);

    const bank = ctx('bank', 'officer');
    expect(canAccessDashboard(bank, '/governance/bank-admin')).toBe(true);
    expect(canAccessDashboard(bank, '/buyer/dashboard')).toBe(false);
  });

  test('a session with no org type is denied every dashboard (fail-closed)', () => {
    const legacy = ctx(null, 'admin');
    expect(canAccessDashboard(legacy, '/buyer/dashboard')).toBe(false);
    expect(canAccessDashboard(legacy, '/governance')).toBe(false);
  });
});

test.describe('platform-level (cross-tenant) authority', () => {
  test('platform_owner is platform-level and sees everything', () => {
    expect(isPlatformOrgType('platform_owner')).toBe(true);
    expect(orgTypeAllowsPath('platform_owner', '/anything/at/all')).toBe(true);
    const owner = ctx('platform_owner', 'owner');
    expect(canAccessDashboard(owner, '/governance/bank-admin')).toBe(true);
    expect(canAccessDashboard(owner, '/buyer/dashboard')).toBe(true);
  });

  test('an explicit super_admin authority overrides org-type scoping', () => {
    const superAdmin = ctx('buyer', 'admin', true); // isPlatformAdmin = true (super_admin)
    expect(canAccessDashboard(superAdmin, '/governance/sovereign-admin')).toBe(true);
    expect(canApprove(superAdmin)).toBe(true);
    expect(canManageOrganization(superAdmin)).toBe(true);
  });

  test('non-platform org types are NOT platform-level', () => {
    for (const type of ALL_ORG_TYPES) {
      if (type === 'platform_owner') continue;
      expect(isPlatformOrgType(type), type).toBe(false);
    }
  });
});

test.describe('membership-role capabilities', () => {
  test('viewer can only view; operator can edit but not approve; officer/manager can approve', () => {
    expect(getRoleCapabilities('viewer')).toMatchObject({ view: true, edit: false, approve: false });
    expect(getRoleCapabilities('operator')).toMatchObject({ view: true, edit: true, approve: false });
    expect(getRoleCapabilities('officer')).toMatchObject({ approve: true, manageUsers: false });
    expect(getRoleCapabilities('manager')).toMatchObject({ approve: true, manageUsers: false });
  });

  test('only owner/admin manage users; only owner manages the organization', () => {
    expect(canManageUsers(ctx('bank', 'owner'))).toBe(true);
    expect(canManageUsers(ctx('bank', 'admin'))).toBe(true);
    expect(canManageUsers(ctx('bank', 'manager'))).toBe(false);
    expect(canManageUsers(ctx('bank', 'officer'))).toBe(false);

    expect(canManageOrganization(ctx('bank', 'owner'))).toBe(true);
    expect(canManageOrganization(ctx('bank', 'admin'))).toBe(false);
  });

  test('unknown role fails closed to viewer capabilities', () => {
    const unknown = ctx('buyer', 'wizard');
    expect(canView(unknown)).toBe(true);
    expect(canEdit(unknown)).toBe(false);
    expect(canApprove(unknown)).toBe(false);
    expect(canManageUsers(unknown)).toBe(false);
  });

  test('analyst is read + export oriented (view yes, edit/approve no)', () => {
    const analyst = ctx('regulator', 'analyst');
    expect(canView(analyst)).toBe(true);
    expect(canEdit(analyst)).toBe(false);
    expect(canApprove(analyst)).toBe(false);
  });
});
