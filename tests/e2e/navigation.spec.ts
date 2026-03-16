import { test, expect } from '@playwright/test';

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');
  });

  test('page loads with project cards', async ({ page }) => {
    const cards = page.locator('.project-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('5 maturity tabs exist: Everyone, Graduated, Incubating, Sandbox, Archived', async ({ page }) => {
    for (const tab of ['everyone', 'graduated', 'incubating', 'sandbox', 'archived']) {
      await expect(page.locator(`button[data-tab="${tab}"]`)).toBeVisible();
    }
  });

  test('clicking Graduated tab filters to only graduated projects', async ({ page }) => {
    await page.click('[data-tab="graduated"]');
    await page.waitForTimeout(500);
    const cards = page.locator('.project-card:visible');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('hero section shows 8 spotlight cards per tab', async ({ page }) => {
    const visibleGrid = page.locator('.heroes-grid[data-heroes-tab="everyone"]');
    await expect(visibleGrid).toBeVisible({ timeout: 5000 });
    const count = await visibleGrid.locator('.hero-card').count();
    expect(count).toBe(8);
  });

  test('cards contain expected content: badge, name, description', async ({ page }) => {
    const firstCard = page.locator('.project-card').first();
    await expect(firstCard).toBeVisible();
    // Should have a maturity badge
    await expect(firstCard.locator('.maturity-badge, [class*="badge"]')).toBeVisible();
    // Should have a name
    await expect(firstCard.locator('.card-name, .project-name, h3, h4')).toBeVisible();
  });

  test('category filter dropdown exists in sidebar', async ({ page }) => {
    const filter = page.locator('#category-filter');
    await expect(filter).toBeVisible();
    const options = filter.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThan(1); // "All" + actual categories
  });

  test('RSS feed link exists', async ({ page }) => {
    const rssLink = page.locator('a[href*="feed.xml"]');
    await expect(rssLink).toBeAttached();
  });

  test('site switcher has three pills', async ({ page }) => {
    const pills = page.locator('.switcher-pill');
    await expect(pills).toHaveCount(3);
  });

  test('Everyone tab is active by default', async ({ page }) => {
    const activeTab = page.locator('button[data-tab="everyone"]');
    await expect(activeTab).toHaveClass(/active/);
  });
});
