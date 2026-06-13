import { test, expect } from '@playwright/test';
import { mapAuthorityRole, resolveAuthority, AUTHORITY_RANK } from '../../src/core/authority-mapping';
import { USER_ROLES } from '../../src/core/roles';

test.describe('authority mapping — fail-closed RBAC', () => {
  test('C-1: org owner/admin map to ORG_OWNER, never a sovereign tier', () => {
    expect(mapAuthorityRole('owner')).toBe(USER_ROLES.ORG_OWNER);
    expect(mapAuthorityRole('org_owner')).toBe(USER_ROLES.ORG_OWNER);
    expect(mapAuthorityRole('admin')).toBe(USER_ROLES.ORG_OWNER);
    expect(mapAuthorityRole('owner')).not.toBe(USER_ROLES.SUPER_ADMIN);
  });

  test('explicit platform roles still resolve to god-view tiers', () => {
    expect(mapAuthorityRole('super_admin')).toBe(USER_ROLES.SUPER_ADMIN);
    expect(mapAuthorityRole('platform_admin')).toBe(USER_ROLES.PLATFORM_ADMIN);
    expect(mapAuthorityRole('sovereign_admin')).toBe(USER_ROLES.SOVEREIGN_ADMIN);
  });

  test('C-2: unknown / empty / garbage roles FAIL CLOSED to MEMBER', () => {
    expect(mapAuthorityRole('wizard')).toBe(USER_ROLES.MEMBER);
    expect(mapAuthorityRole('')).toBe(USER_ROLES.MEMBER);
    expect(mapAuthorityRole(undefined)).toBe(USER_ROLES.MEMBER);
    expect(mapAuthorityRole(null)).toBe(USER_ROLES.MEMBER);
    expect(mapAuthorityRole('x')).toBe(USER_ROLES.MEMBER);
    // crucially: a string that merely *contains* a privileged word must not escalate (no fuzzy match)
    expect(mapAuthorityRole('not_super_admin')).toBe(USER_ROLES.MEMBER);
  });

  test('normalization handles case / spacing / hyphens', () => {
    expect(mapAuthorityRole('Super-Admin')).toBe(USER_ROLES.SUPER_ADMIN);
    expect(mapAuthorityRole('  BANK ADMIN ')).toBe(USER_ROLES.BANK_ADMIN);
  });

  test('multi-role resolves to the HIGHEST-ranked authority (order-independent)', () => {
    expect(resolveAuthority(['buyer', 'compliance_officer'])).toBe(USER_ROLES.COMPLIANCE_OFFICER);
    expect(resolveAuthority(['compliance_officer', 'buyer'])).toBe(USER_ROLES.COMPLIANCE_OFFICER);
    expect(resolveAuthority(['buyer', 'super_admin'])).toBe(USER_ROLES.SUPER_ADMIN);
  });

  test('unknown roles never raise effective authority', () => {
    expect(resolveAuthority(['buyer', 'wizard'])).toBe(USER_ROLES.BUYER);
    expect(resolveAuthority(['wizard', 'nonsense'])).toBe(USER_ROLES.MEMBER);
    expect(resolveAuthority([])).toBe(USER_ROLES.MEMBER);
    expect(resolveAuthority(undefined)).toBe(USER_ROLES.MEMBER);
  });

  test('every authority has a defined rank; MEMBER is the floor', () => {
    expect(AUTHORITY_RANK[USER_ROLES.MEMBER]).toBe(0);
    for (const role of Object.values(USER_ROLES)) {
      expect(typeof AUTHORITY_RANK[role], role).toBe('number');
    }
    // sovereign strictly outranks an org owner — the heart of the C-1 fix
    expect(AUTHORITY_RANK[USER_ROLES.SUPER_ADMIN]).toBeGreaterThan(AUTHORITY_RANK[USER_ROLES.ORG_OWNER]);
  });
});
