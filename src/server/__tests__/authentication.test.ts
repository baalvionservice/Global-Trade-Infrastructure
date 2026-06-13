/**
 * @file server/__tests__/authentication.test.ts
 * @description Phase A (CR-1): identity is taken ONLY from a verified, signed
 * gateway envelope. Forged headers, anonymous requests and role spoofing fail.
 */
import { describe, it, expect } from 'vitest';
import { verifyIdentity, signIdentity, UnauthorizedError, Principal } from '../http/identity';
import { requireActor, principalFrom } from '../http/api';
import { USER_ROLES, UserRole } from '@/core/roles';

const ORG = '11111111-1111-1111-1111-111111111111';
const PRINCIPAL: Principal = { actorId: 'u-1', actorRole: USER_ROLES.BUYER as UserRole, organizationId: ORG };

function reqWith(headers: Record<string, string>): Request {
  return new Request('http://localhost/api/trades', { headers });
}

describe('authentication — verified identity envelope (CR-1)', () => {
  it('rejects an anonymous request (no headers)', () => {
    expect(() => requireActor(reqWith({}))).toThrow(UnauthorizedError);
    expect(() => principalFrom(reqWith({}))).toThrow(UnauthorizedError);
  });

  it('rejects forged x-actor-* / x-organization-id headers without a signed envelope', () => {
    const forged = reqWith({
      'x-actor-id': 'attacker',
      'x-actor-role': 'super_admin',
      'x-organization-id': '22222222-2222-2222-2222-222222222222',
    });
    expect(() => requireActor(forged)).toThrow(UnauthorizedError);
  });

  it('rejects a tampered signature', () => {
    const headers = signIdentity(PRINCIPAL);
    const badSig = headers['x-identity-signature'].replace(/.$/, (c) => (c === 'a' ? 'b' : 'a'));
    expect(() =>
      verifyIdentity(reqWith({ 'x-identity-envelope': headers['x-identity-envelope'], 'x-identity-signature': badSig })),
    ).toThrow(UnauthorizedError);
  });

  it('rejects an envelope signed with the wrong secret', () => {
    const headers = signIdentity(PRINCIPAL, { secret: 'a_completely_different_secret_value_32b!' });
    expect(() => verifyIdentity(reqWith(headers))).toThrow(UnauthorizedError);
  });

  it('rejects an expired envelope', () => {
    const headers = signIdentity(PRINCIPAL, { ttlMs: -1_000 });
    expect(() => verifyIdentity(reqWith(headers))).toThrow(UnauthorizedError);
  });

  it('does NOT allow role spoofing: the signed role wins, header role is ignored', () => {
    // Principal is a BUYER. Attacker also sets x-actor-role: super_admin.
    const headers = signIdentity(PRINCIPAL);
    const spoofed = reqWith({ ...headers, 'x-actor-role': 'super_admin', 'x-actor-id': 'root' });
    const p = principalFrom(spoofed);
    expect(p.actorRole).toBe(USER_ROLES.BUYER);
    expect(p.actorId).toBe('u-1');
    expect(p.organizationId).toBe(ORG);
  });

  it('does NOT allow tenant spoofing: org comes from the signed envelope, not the header', () => {
    const headers = signIdentity(PRINCIPAL);
    const spoofed = reqWith({ ...headers, 'x-organization-id': '33333333-3333-3333-3333-333333333333' });
    expect(principalFrom(spoofed).organizationId).toBe(ORG);
  });

  it('accepts a valid signed envelope', () => {
    const actor = requireActor(reqWith(signIdentity(PRINCIPAL)));
    expect(actor.actorId).toBe('u-1');
    expect(actor.actorRole).toBe(USER_ROLES.BUYER);
  });
});
