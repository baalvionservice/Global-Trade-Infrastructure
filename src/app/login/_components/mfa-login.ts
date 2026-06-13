/**
 * @file mfa-login.ts
 * @description MFA-enforcement helpers for the login flow.
 *
 * The auth-gateway `/auth/login` now returns one of three SUCCESS (HTTP 200) shapes:
 *   1. `{ user, csrfToken }`            → full session established (cookies set).
 *   2. `{ mfaRequired, challengeToken }`         → user already enrolled; needs a 6-digit code.
 *   3. `{ mfaEnrollmentRequired, challengeToken }` → force-MFA; user must enrol before a session.
 *
 * `MfaRequiredError` carries the challenge token + kind so the login page can transition into the
 * appropriate MFA step without re-issuing the credential exchange.
 */

export type MfaKind = 'challenge' | 'enrollment';

/** Thrown by the app-state login when the gateway demands a second factor. */
export class MfaRequiredError extends Error {
  readonly code = 'MFA_FLOW';
  readonly kind: MfaKind;
  readonly challengeToken: string;

  constructor(kind: MfaKind, challengeToken: string) {
    super(kind === 'enrollment' ? 'MFA enrolment required' : 'MFA verification required');
    this.name = 'MfaRequiredError';
    this.kind = kind;
    this.challengeToken = challengeToken;
  }
}

export function isMfaRequiredError(err: unknown): err is MfaRequiredError {
  return err instanceof MfaRequiredError;
}
