/**
 * @file safe-redirect.ts
 * @description Hardened internal-redirect validation (open-redirect / CWE-601 defense).
 *
 * A `?redirect=` parameter is attacker-controllable. `new URL(value, origin)` will happily resolve
 * an absolute (`https://evil.com`) or protocol-relative (`//evil.com`) value to an OFF-ORIGIN
 * target. This validator only honors same-origin, root-relative paths; anything that could escape
 * the current origin collapses to the fallback.
 */
export function safeInternalPath(raw: unknown, fallback = '/dashboard'): string {
  if (typeof raw !== 'string') return fallback;

  const value = raw.trim();
  if (value.length === 0) return fallback;

  // Must be root-relative: exactly one leading slash.
  if (value[0] !== '/') return fallback;

  // Reject protocol-relative `//evil.com` and backslash-smuggled `/\evil.com`.
  if (value[1] === '/' || value[1] === '\\') return fallback;

  // Reject control characters (newline/tab smuggling, NUL, DEL) and backslashes — scanning code
  // points so no literal control byte ever appears in source.
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return fallback;
    if (code === 0x5c) return fallback; // backslash anywhere
  }

  return value;
}
