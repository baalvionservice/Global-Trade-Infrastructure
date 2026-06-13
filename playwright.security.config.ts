import { defineConfig } from '@playwright/test';

/**
 * Dedicated config for the security unit suite (pure-logic; no browser, no web server).
 * Scoped to tests/security so it never picks up the stale browser specs under testing/.
 * Run with: pnpm test:security
 */
export default defineConfig({
  testDir: './tests/security',
  testMatch: '**/*.spec.ts',
  reporter: [['list']],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
});
