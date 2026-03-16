import { test, expect } from '@playwright/test';

test.describe('visual layout verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');
  });

  test('page-layout uses CSS grid with sidebar-left 2-column layout', async ({ page }) => {
    const layout = await page.evaluate(() => {
      const el = document.querySelector('.page-layout');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { display: cs.display, cols: cs.gridTemplateColumns };
    });
    expect(layout).not.toBeNull();
    expect(layout!.display).toBe('grid');
    // Should be 2 columns: ~300px sidebar + rest
    const colParts = layout!.cols.split(' ');
    expect(colParts.length).toBe(2);
    expect(parseInt(colParts[0])).toBeGreaterThanOrEqual(280);
    expect(parseInt(colParts[0])).toBeLessThanOrEqual(320);
  });

  test('sidebar renders to the LEFT of main content', async ({ page }) => {
    const positions = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar, aside');
      const main = document.querySelector('.main-content, .content-area');
      if (!sidebar || !main) return null;
      return {
        sidebarX: sidebar.getBoundingClientRect().x,
        mainX: main.getBoundingClientRect().x,
      };
    });
    expect(positions).not.toBeNull();
    expect(positions!.sidebarX).toBeLessThan(positions!.mainX);
  });

  test('hero grid has 4 columns', async ({ page }) => {
    await page.goto('./');
    const visibleGrid = page.locator('.heroes-grid[data-heroes-tab]').filter({ hasNot: page.locator('[style*="display:none"]') }).first();
    const cols = await visibleGrid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    expect(cols.split(' ')).toHaveLength(4);
  });

  test('hero cards are square (aspect-ratio ~1)', async ({ page }) => {
    await page.goto('./');
    const box = await page.locator('.hero-card').first().boundingBox();
    expect(box).toBeTruthy();
    expect(Math.abs(box!.width - box!.height) / box!.width).toBeLessThan(0.15);
  });

  test('graduated tab shows graduated hero cards', async ({ page }) => {
    await page.goto('./');
    await page.click('.section-link[data-tab="graduated"]');
    await page.waitForTimeout(200);
    const visibleGrid = page.locator('.heroes-grid[data-heroes-tab="graduated"]');
    await expect(visibleGrid).toBeVisible();
    const heroCount = await visibleGrid.locator('.hero-card').count();
    expect(heroCount).toBeGreaterThanOrEqual(1);
  });

  test('heroes change between tabs', async ({ page }) => {
    await page.goto('./');
    const everyoneGridVisible = await page.locator('.heroes-grid[data-heroes-tab="everyone"]').isVisible();
    expect(everyoneGridVisible).toBe(true);
    await page.click('.section-link[data-tab="graduated"]');
    await page.waitForTimeout(200);
    const graduatedGridVisible = await page.locator('.heroes-grid[data-heroes-tab="graduated"]').isVisible();
    expect(graduatedGridVisible).toBe(true);
    const everyoneGridNowHidden = await page.locator('.heroes-grid[data-heroes-tab="everyone"]').isVisible();
    expect(everyoneGridNowHidden).toBe(false);
  });

  test('cards-container uses flex column layout for letterbox cards', async ({ page }) => {
    const cardsContainer = await page.evaluate(() => {
      const el = document.querySelector('#cards-container');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { display: cs.display, flexDirection: cs.flexDirection };
    });
    expect(cardsContainer).not.toBeNull();
    expect(cardsContainer!.display).toBe('flex');
    expect(cardsContainer!.flexDirection).toBe('column');
  });

  test('maintainers section renders with cards', async ({ page }) => {
    const section = page.locator('.maintainers-section');
    await expect(section).toBeVisible();
  });

  test('project cards use letterbox layout', async ({ page }) => {
    await page.waitForTimeout(1000);
    const firstCard = page.locator('.project-card').first();
    await expect(firstCard).toBeVisible();
    const display = await firstCard.evaluate(el => getComputedStyle(el).flexDirection);
    expect(display).toBe('row');
  });
});
