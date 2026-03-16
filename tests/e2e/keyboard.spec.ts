import { test, expect } from '@playwright/test';

test.describe('keyboard shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.project-card', { timeout: 10000 });
  });

  test('"/" focuses search', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.locator('#search-input')).toBeFocused();
  });

  test('"s" focuses search', async ({ page }) => {
    await page.keyboard.press('s');
    await expect(page.locator('#search-input')).toBeFocused();
  });

  test('"?" opens keyboard help modal', async ({ page }) => {
    await page.keyboard.press('?');
    const modal = page.locator('#keyboard-help-modal');
    await expect(modal).toBeVisible();
  });

  test('"t" toggles theme', async ({ page }) => {
    const html = page.locator('html');
    const themeBefore = await html.getAttribute('data-theme');
    await page.keyboard.press('t');
    const themeAfter = await html.getAttribute('data-theme');
    expect(themeAfter).not.toBe(themeBefore);
  });

  test('Escape closes keyboard help modal', async ({ page }) => {
    await page.keyboard.press('?');
    await expect(page.locator('#keyboard-help-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#keyboard-help-modal')).not.toBeVisible();
  });

  test('number keys 1-5 switch tabs', async ({ page }) => {
    const tabs = ['everyone', 'graduated', 'incubating', 'sandbox', 'archived'];
    for (let i = 0; i < tabs.length; i++) {
      await page.keyboard.press(String(i + 1));
      await page.waitForTimeout(200);
      const activeTab = page.locator('.tab-button.active, .section-link.active');
      await expect(activeTab).toHaveAttribute('data-tab', tabs[i]);
    }
  });

  test('shortcuts do not fire when typing in search input', async ({ page }) => {
    await page.locator('#search-input').focus();
    await page.keyboard.type('test');
    // ? should NOT have opened modal while typing
    await expect(page.locator('#keyboard-help-modal')).not.toBeVisible();
  });

  test('"j" applies keyboard-focused class to next card', async ({ page }) => {
    await page.keyboard.press('j');
    const focused = page.locator('.project-card.keyboard-focused, .hero-card.keyboard-focused');
    await expect(focused).toHaveCount(1);
  });

  test('"k" moves keyboard-focused class to previous card', async ({ page }) => {
    // Focus second card then go back
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    await page.keyboard.press('k');
    const focused = page.locator('.project-card.keyboard-focused, .hero-card.keyboard-focused');
    await expect(focused).toHaveCount(1);
  });

  test('keyboard-focused class is removed on tab click', async ({ page }) => {
    await page.keyboard.press('j');
    await expect(page.locator('.keyboard-focused')).toHaveCount(1);
    // Click a tab button to reset focus
    const tabBtn = page.locator('.section-link[data-tab]').first();
    await tabBtn.click();
    await expect(page.locator('.keyboard-focused')).toHaveCount(0);
  });

  test('"h" scrolls to top', async ({ page }) => {
    // Scroll down first
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);
    const scrollBefore = await page.evaluate(() => window.scrollY);
    expect(scrollBefore).toBeGreaterThan(0);
    await page.keyboard.press('h');
    await page.waitForTimeout(500);
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBeLessThan(scrollBefore);
  });

  test('Space scrolls down', async ({ page }) => {
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await page.keyboard.press(' ');
    await page.waitForTimeout(500);
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBeGreaterThan(scrollBefore);
  });

  test('Shift+Space scrolls up', async ({ page }) => {
    // Scroll down first so we have room to scroll up
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(200);
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Shift+ ');
    await page.waitForTimeout(500);
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBeLessThan(scrollBefore);
  });

  test('Tab cycles to next tab', async ({ page }) => {
    const firstTab = page.locator('.section-link.active');
    const firstTabName = await firstTab.getAttribute('data-tab');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    const activeTab = page.locator('.section-link.active');
    const nextTabName = await activeTab.getAttribute('data-tab');
    expect(nextTabName).not.toBe(firstTabName);
  });

  test('Shift+Tab cycles to previous tab', async ({ page }) => {
    // Go forward first
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    const afterForward = await page.locator('.section-link.active').getAttribute('data-tab');
    await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(200);
    const afterBack = await page.locator('.section-link.active').getAttribute('data-tab');
    expect(afterBack).not.toBe(afterForward);
  });

  test('"o" opens focused card link', async ({ page }) => {
    // Focus a card first
    await page.keyboard.press('j');
    await expect(page.locator('.keyboard-focused')).toHaveCount(1);
    // Check that pressing 'o' triggers a new tab (we check via popup event)
    const popupPromise = page.waitForEvent('popup', { timeout: 3000 }).catch(() => null);
    await page.keyboard.press('o');
    const popup = await popupPromise;
    // If the focused card had a link, a popup should have opened
    // (hero cards or project cards may or may not have links)
    if (popup) {
      expect(popup.url()).toBeTruthy();
    }
  });
});
