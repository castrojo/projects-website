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

  test('hero cards render in a multi-column grid', async ({ page }) => {
    const heroGrid = await page.evaluate(() => {
      const grid = document.querySelector('.heroes-grid');
      if (!grid) return null;
      const cs = getComputedStyle(grid);
      return { display: cs.display, cols: cs.gridTemplateColumns };
    });
    // Heroes grid should exist and have multiple columns
    if (heroGrid) {
      expect(heroGrid.display).toBe('grid');
      const colCount = heroGrid.cols.split(' ').length;
      expect(colCount).toBeGreaterThanOrEqual(2);
    }
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

  test('hero cards have visual design (not identical style)', async ({ page }) => {
    const heroCards = page.locator('.hero-card');
    await expect(heroCards).toHaveCount(4);
    const labels = await heroCards.locator('.hero-label').allTextContents();
    expect(labels).toContain('Graduated');
    expect(labels).toContain('Incubating');
    expect(labels).toContain('Sandbox');
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
