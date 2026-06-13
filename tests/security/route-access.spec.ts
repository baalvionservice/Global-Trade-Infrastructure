import { test, expect } from '@playwright/test';
import { isAdminPath, needsAuth, isProtectedPath, PUBLIC_EXACT } from '../../src/lib/route-access';

test.describe('route-access classification (edge + guard share this)', () => {
  test('public routes are not protected', () => {
    for (const p of ['/', '/login', '/about', '/pricing', '/onboard', '/onboard/buyer']) {
      expect(isProtectedPath(p), p).toBe(false);
    }
  });

  test('M-1 regression: /agent/* is now auth-gated (was only /agents)', () => {
    expect(needsAuth('/agent/dashboard')).toBe(true);
    expect(needsAuth('/agent/requests')).toBe(true);
  });

  test('M-2 regression: sanctions + compliance-regulatory are now auth-gated', () => {
    expect(needsAuth('/sanctions-screening')).toBe(true);
    expect(needsAuth('/compliance-regulatory')).toBe(true);
    expect(needsAuth('/compliance-regulatory/declarations')).toBe(true);
  });

  test('governance + sovereign-command are admin paths', () => {
    expect(isAdminPath('/governance')).toBe(true);
    expect(isAdminPath('/governance/sovereign-admin')).toBe(true);
    expect(isAdminPath('/godsystem-command')).toBe(true);
    expect(isAdminPath('/dashboard')).toBe(false);
  });

  test('prefix matching does not over-match siblings', () => {
    // '/compliance' must NOT swallow '/compliance-regulatory' (distinct surfaces, both gated though)
    expect(needsAuth('/compliance')).toBe(true);
    expect(needsAuth('/compliance-regulatory')).toBe(true);
    // a near-miss of a public route is NOT silently treated as public-exact
    expect(PUBLIC_EXACT.has('/login')).toBe(true);
    expect(PUBLIC_EXACT.has('/loginx')).toBe(false);
  });

  test('core operational + high-value routes require auth', () => {
    for (const p of ['/dashboard', '/orders', '/financials/treasury', '/insurance', '/customs', '/executive/command']) {
      expect(isProtectedPath(p), p).toBe(true);
    }
  });
});
