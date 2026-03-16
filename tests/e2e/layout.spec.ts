import { test, expect } from '@playwright/test';

test.describe('layout structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.site-header', { timeout: 10000 });
  });

  test('sidebar is on the LEFT side of content', async ({ page }) => {
    // Reference (people-website): sidebar comes before .main-content in a .page-layout grid
    // Sidebar should be visually to the LEFT of the main content area
    const sidebar = page.locator('aside.sidebar');
    const content = page.locator('.main-content, .content-area');
    await expect(sidebar).toBeVisible();
    await expect(content.first()).toBeVisible();
    const sidebarBox = await sidebar.boundingBox();
    const contentBox = await content.first().boundingBox();
    expect(sidebarBox!.x).toBeLessThan(contentBox!.x);
  });

  test('CNCF logo is visible in header at 42x42', async ({ page }) => {
    // Canonical size is 42×42 — matches projects-website reference implementation
    const logo = page.locator('header .cncf-logo-wrapper');
    await expect(logo).toBeVisible();
    const img = logo.locator('img, svg').first();
    const width = await img.getAttribute('width');
    const height = await img.getAttribute('height');
    expect(width).toBe('42');
    expect(height).toBe('42');
  });

  test('header contains logo, title, SiteSwitcher, search, theme toggle, help button', async ({ page }) => {
    // Canonical header: no rotating slogan (removed from design)
    const header = page.locator('header');
    await expect(header.locator('h1')).toBeVisible();
    await expect(header.locator('.site-switcher')).toBeVisible();
    await expect(header.locator('#search-input')).toBeVisible();
    await expect(header.locator('#theme-toggle')).toBeVisible();
    await expect(header.locator('#help-button')).toBeVisible();
  });

  test('search input is in nav-group (not header-left)', async ({ page }) => {
    // Canonical: search lives in .nav-group (sibling of .header-left), NOT inside .header-left
    const searchInNav = page.locator('.nav-group .search-wrapper, .nav-group #search-input');
    await expect(searchInNav.first()).toBeVisible();
  });

  test('tab navigation is inside the header container', async ({ page }) => {
    // Reference: maturity tab navigation (section-nav) is inside <header> > .container
    // Bug: projects-website has <nav class="tab-nav"> as a SIBLING of <header>, outside it
    const tabsInHeader = page.locator('header .tab-nav, header .section-nav, header .tab-list');
    await expect(tabsInHeader).toBeVisible();
  });

  test('sidebar stats box exists as first sidebar item', async ({ page }) => {
    const statsBox = page.locator('aside.sidebar .stats-box');
    await expect(statsBox).toBeVisible();
  });

  test('search count span exists in search wrapper', async ({ page }) => {
    const searchCount = page.locator('.search-wrapper #search-count, #search-count');
    await expect(searchCount).toBeAttached();
  });

  test('kbd-live-region div exists for accessibility', async ({ page }) => {
    const liveRegion = page.locator('#kbd-live-region');
    await expect(liveRegion).toBeAttached();
  });

  test('SiteSwitcher has 3 pills with correct labels', async ({ page }) => {
    const pills = page.locator('.switcher-pill');
    await expect(pills).toHaveCount(3);
    await expect(pills.nth(0)).toContainText(/People/i);
    await expect(pills.nth(1)).toContainText(/Projects/i);
    await expect(pills.nth(2)).toContainText(/End Users/i);
  });

  test('header uses .header-left and .header-actions structure', async ({ page }) => {
    // Reference: header has .header-left (logo + search) and .header-actions (toggle + help)
    // Canonical: projects-website uses .header-left and .header-actions
    const headerLeft = page.locator('header .header-left');
    const headerActions = page.locator('header .header-actions');
    await expect(headerLeft).toBeVisible();
    await expect(headerActions).toBeVisible();
  });

  test('footer exists with attribution', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('landscape.cncf.io');
  });
});
