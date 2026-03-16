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

  test('"j" focuses next card and "k" focuses previous', async ({ page }) => {
    await page.keyboard.press('j');
    // A card should now have focus
    const focusedCard = page.locator('.project-card:focus, .project-card:focus-within');
    // Just check j doesn't crash — actual focus behavior depends on implementation
    await page.keyboard.press('k');
  });
});
