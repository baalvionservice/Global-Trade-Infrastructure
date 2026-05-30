
/**
 * @file mission-control.spec.ts
 * @description THE SUPREME E2E VALIDATION.
 * Audits the Executive Command Observatory for strategic finality and data density.
 */

import { test, expect } from '@playwright/test';
import { PATHS } from '../../src/lib/paths';

test.describe('Executive Command Observatory Integrity', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate and navigate to the Global Singularity Observatory
    await page.goto('/login');
    await page.click('button:has-text("Admin")'); // Switch to Admin role
    await page.waitForURL(PATHS.EXECUTIVE_COMMAND);
  });

  test('should render high-density strategic telemetry with zero sync drift', async ({ page }) => {
    // 1. Verify Command Header
    await expect(page.locator('h2')).toContainText('Data Singularity');
    await expect(page.locator('span:has-text("Sovereign Data Fabric")')).toBeVisible();

    // 2. Verify Strategic KPI Grid
    const kpiCards = page.locator('.grid >> .rounded-\\[32px\\]');
    await expect(kpiCards).toHaveCount(4);
    await expect(kpiCards.first()).toContainText('Decision Finality');
    await expect(kpiCards.nth(1)).toContainText('100%'); // Ledger Symmetry

    // 3. Verify Live Event Ledger Stream
    const ledgerRows = page.locator('.custom-scrollbar >> .group');
    await expect(ledgerRows.first()).toBeVisible();
    await expect(ledgerRows.first().locator('.text-emerald-400')).toContainText('ACTION::');

    // 4. Verify Identity Integrity (ShieldCheck)
    await expect(page.locator('.p-2.rounded-lg.bg-emerald-500\\/10')).toBeVisible();
  });

  test('should launch the Universal Command Palette via CMD+K', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    const palette = page.locator('role=dialog');
    await expect(palette).toBeVisible();
    await expect(palette.locator('input')).toHaveAttribute('placeholder', /Resolve Node ID/);
  });
});
