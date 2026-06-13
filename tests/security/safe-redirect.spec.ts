import { test, expect } from '@playwright/test';
import { safeInternalPath } from '../../src/lib/safe-redirect';

const FALLBACK = '/dashboard';

test.describe('safeInternalPath — open-redirect / CWE-601 defense', () => {
  test('preserves legitimate same-origin paths (incl. query)', () => {
    expect(safeInternalPath('/governance/audit-logs')).toBe('/governance/audit-logs');
    expect(safeInternalPath('/buyer/dashboard?tab=open')).toBe('/buyer/dashboard?tab=open');
  });

  test('rejects protocol-relative //evil.com', () => {
    expect(safeInternalPath('//evil.com', FALLBACK)).toBe(FALLBACK);
  });

  test('rejects absolute URLs', () => {
    expect(safeInternalPath('https://evil.com', FALLBACK)).toBe(FALLBACK);
    expect(safeInternalPath('http://evil.com/path', FALLBACK)).toBe(FALLBACK);
  });

  test('rejects backslash-smuggled targets', () => {
    expect(safeInternalPath('/\\evil.com', FALLBACK)).toBe(FALLBACK);
    expect(safeInternalPath('/\\/evil.com', FALLBACK)).toBe(FALLBACK);
    expect(safeInternalPath('/path\\with\\backslash', FALLBACK)).toBe(FALLBACK);
  });

  test('rejects non-root-relative, empty, and non-string input', () => {
    expect(safeInternalPath('evil.com', FALLBACK)).toBe(FALLBACK);
    expect(safeInternalPath('', FALLBACK)).toBe(FALLBACK);
    expect(safeInternalPath(null, FALLBACK)).toBe(FALLBACK);
    expect(safeInternalPath(undefined, FALLBACK)).toBe(FALLBACK);
    expect(safeInternalPath(123 as unknown, FALLBACK)).toBe(FALLBACK);
  });

  test('rejects control-character smuggling', () => {
    expect(safeInternalPath('/foo\nbar', FALLBACK)).toBe(FALLBACK);
    expect(safeInternalPath('/foo\tbar', FALLBACK)).toBe(FALLBACK);
  });

  test('fallback defaults to /dashboard', () => {
    expect(safeInternalPath('//evil.com')).toBe('/dashboard');
  });
});
