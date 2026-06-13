import { test, expect } from '@playwright/test';
import { PERSONAS, getPersona, getPersonaHome, personaAllowsPath } from '../../src/core/personas';
import { USER_ROLES } from '../../src/core/roles';

test.describe('persona ↔ route-guard invariants', () => {
  test('every persona may view its OWN home (no guard redirect loop)', () => {
    for (const persona of PERSONAS) {
      expect(personaAllowsPath(persona, persona.home), `${persona.id} home ${persona.home}`).toBe(true);
    }
  });

  test('every role resolves to a persona that permits its home', () => {
    for (const role of Object.values(USER_ROLES)) {
      const persona = getPersona(role);
      const home = getPersonaHome(role);
      expect(personaAllowsPath(persona, home), `${role} -> ${home}`).toBe(true);
    }
  });

  test('non-god personas cannot view sovereign routes; god-view can view everything', () => {
    expect(personaAllowsPath(getPersona(USER_ROLES.BUYER), '/governance/sovereign-admin')).toBe(false);
    expect(personaAllowsPath(getPersona(USER_ROLES.MEMBER), '/governance/bank-admin')).toBe(false);

    const sovereign = getPersona(USER_ROLES.SUPER_ADMIN);
    expect(personaAllowsPath(sovereign, '/governance/sovereign-admin')).toBe(true);
    expect(personaAllowsPath(sovereign, '/anything/at/all')).toBe(true); // '*' allowlist
  });

  test('MEMBER is least privilege — only its baseline surfaces', () => {
    const member = getPersona(USER_ROLES.MEMBER);
    expect(personaAllowsPath(member, '/dashboard')).toBe(true);
    expect(personaAllowsPath(member, '/governance')).toBe(false);
    expect(personaAllowsPath(member, '/financials/treasury')).toBe(false);
  });

  test('prefix allow does not over-grant a sibling path', () => {
    // bank-admin nav allows '/financials/trade-finance' but must NOT grant '/financials/treasury'
    const bank = getPersona(USER_ROLES.BANK_ADMIN);
    expect(personaAllowsPath(bank, '/financials/trade-finance')).toBe(true);
    expect(personaAllowsPath(bank, '/financials/treasury')).toBe(false);
  });
});
