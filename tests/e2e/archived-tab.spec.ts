import { test, expect } from '@playwright/test';

test.describe('archived tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');
  });

  test('archived tab button exists and is clickable', async ({ page }) => {
    const btn = page.locator('.section-link[data-tab="archived"]');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(btn).toHaveClass(/active/);
  });

  test('clicking archived tab renders timeline container', async ({ page }) => {
    await page.locator('.section-link[data-tab="archived"]').click();
    await page.waitForSelector('.timeline-container', { timeout: 5000 });
    await expect(page.locator('.timeline-container')).toBeVisible();
  });

  test('archived tab shows at least one timeline item', async ({ page }) => {
    await page.locator('.section-link[data-tab="archived"]').click();
    await page.waitForSelector('.timeline-item', { timeout: 5000 });
    const items = page.locator('.timeline-item');
    await expect(items.first()).toBeVisible();
  });

  test('year chapter dividers are present', async ({ page }) => {
    await page.locator('.section-link[data-tab="archived"]').click();
    await page.waitForSelector('.timeline-year-badge', { timeout: 5000 });
    await expect(page.locator('.timeline-year-badge').first()).toBeVisible();
  });

  test('milestone nodes are numbered', async ({ page }) => {
    await page.locator('.section-link[data-tab="archived"]').click();
    await page.waitForSelector('.timeline-node', { timeout: 5000 });
    const firstNode = page.locator('.timeline-node').first();
    await expect(firstNode).toBeVisible();
    const text = await firstNode.textContent();
    expect(Number(text?.trim())).toBeGreaterThanOrEqual(1);
  });

  test('heroes section is hidden on archived tab', async ({ page }) => {
    await page.locator('.section-link[data-tab="archived"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('.heroes-section')).toBeHidden();
  });

  test('staff support section is hidden on archived tab', async ({ page }) => {
    await page.locator('.section-link[data-tab="archived"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('.staff-support-section')).toBeHidden();
  });

  test('switching away from archived restores heroes section', async ({ page }) => {
    await page.locator('.section-link[data-tab="archived"]').click();
    await page.waitForTimeout(200);
    await page.locator('.section-link[data-tab="everyone"]').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.heroes-section')).toBeVisible();
  });

  test('archived tab accessible via keyboard shortcut 5', async ({ page }) => {
    await page.keyboard.press('5');
    await page.waitForSelector('.timeline-container', { timeout: 5000 });
    await expect(page.locator('.timeline-container')).toBeVisible();
  });

  test('timeline cards have dashed left border (archived signal)', async ({ page }) => {
    await page.locator('.section-link[data-tab="archived"]').click();
    await page.waitForSelector('.timeline-card', { timeout: 5000 });
    const borderStyle = await page.locator('.timeline-card').first().evaluate(el => {
      return getComputedStyle(el).borderLeftStyle;
    });
    expect(borderStyle).toBe('dashed');
  });
});
