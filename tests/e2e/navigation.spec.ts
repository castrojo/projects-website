import { test, expect } from '@playwright/test';

test('home page loads with project cards', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.project-card')).not.toHaveCount(0);
});

test('graduated tab shows only graduated projects', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-tab="graduated"]');
  const cards = page.locator('.project-card');
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
});

test('search filters cards', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => document.querySelectorAll('.project-card').length > 0);
  await page.fill('#search-input', 'kubernetes');
  await expect(page.locator('.project-card')).not.toHaveCount(0);
});

test('site switcher has three pills', async ({ page }) => {
  await page.goto('/');
  const pills = page.locator('.switcher-pill');
  await expect(pills).toHaveCount(3);
});

test('theme toggle changes theme', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await page.click('#theme-toggle');
  await expect(html).toHaveAttribute('data-theme', 'dark');
});
