import { test, expect } from '@playwright/test';

test.describe('header — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');
  });

  test('CNCF logo renders at exactly 42×42', async ({ page }) => {
    const size = await page.evaluate(() => {
      const img = document.querySelector('.cncf-logo-wrapper img') as HTMLImageElement | null;
      if (!img) return null;
      return { w: Math.round(img.getBoundingClientRect().width), h: Math.round(img.getBoundingClientRect().height) };
    });
    expect(size).not.toBeNull();
    expect(size!.w).toBe(42);
    expect(size!.h).toBe(42);
  });

  test('site title reads "CNCF Projects"', async ({ page }) => {
    const text = await page.locator('.site-title').textContent();
    expect(text?.trim()).toBe('CNCF Projects');
  });

  test('site-title white-space is nowrap — title must never wrap to two lines', async ({ page }) => {
    const ws = await page.evaluate(() => {
      const el = document.querySelector('.site-title');
      return el ? getComputedStyle(el).whiteSpace : null;
    });
    expect(ws, 'site-title must have white-space: nowrap to prevent title wrapping').toBe('nowrap');
  });

  test('site title renders on exactly one line', async ({ page }) => {
    const isSingleLine = await page.evaluate(() => {
      const el = document.querySelector('.site-title');
      if (!el) return false;
      const style = getComputedStyle(el);
      const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.4;
      return el.getBoundingClientRect().height <= lineHeight * 1.5;
    });
    expect(isSingleLine, 'site-title must render on a single line — check white-space: nowrap on .site-title in layout.css').toBe(true);
  });

  test('site title font-size is at least 20px', async ({ page }) => {
    const fontSize = await page.evaluate(() => {
      const el = document.querySelector('.site-title');
      return el ? parseFloat(getComputedStyle(el).fontSize) : 0;
    });
    expect(fontSize).toBeGreaterThanOrEqual(20);
  });

  test('SiteSwitcher has exactly 3 pills', async ({ page }) => {
    const count = await page.locator('.switcher-pill').count();
    expect(count).toBe(3);
  });

  test('"Projects" pill is active', async ({ page }) => {
    const activePill = await page.locator('.switcher-pill.active').textContent();
    expect(activePill?.trim()).toBe('Projects');
  });

  test('search input is visible', async ({ page }) => {
    await expect(page.locator('#search-input')).toBeVisible();
  });

  test('search clear button is hidden on load', async ({ page }) => {
    const display = await page.evaluate(() => {
      const btn = document.getElementById('search-clear');
      return btn ? getComputedStyle(btn).display : null;
    });
    expect(display).toBe('none');
  });

  test('typing in search shows clear button', async ({ page }) => {
    await page.locator('#search-input').fill('kubernetes');
    const display = await page.evaluate(() => {
      const btn = document.getElementById('search-clear') as HTMLElement | null;
      return btn ? btn.style.display : null;
    });
    expect(display).toBe('flex');
  });

  test('clicking clear button empties input and hides button', async ({ page }) => {
    await page.locator('#search-input').fill('kubernetes');
    await page.locator('#search-clear').click();
    const value = await page.locator('#search-input').inputValue();
    expect(value).toBe('');
    const display = await page.evaluate(() => {
      const btn = document.getElementById('search-clear') as HTMLElement | null;
      return btn ? btn.style.display : null;
    });
    expect(display).toBe('none');
  });

  test('search input has blue border on focus', async ({ page }) => {
    await page.locator('#search-input').focus();
    const borderColor = await page.evaluate(() => {
      const el = document.getElementById('search-input');
      return el ? getComputedStyle(el).borderColor : null;
    });
    // #0086FF or var(--color-cncf-blue) resolves to rgb(0, 134, 255)
    expect(borderColor).toBe('rgb(0, 134, 255)');
  });

  test('section-nav has exactly 5 tab buttons', async ({ page }) => {
    const count = await page.locator('.section-nav .section-link').count();
    expect(count).toBe(5);
  });

  test('section-nav tabs are Everyone/Graduated/Incubating/Sandbox/Archived', async ({ page }) => {
    const tabs = await page.locator('.section-nav .section-link').allTextContents();
    expect(tabs.map(t => t.trim())).toEqual(['Everyone', 'Graduated', 'Incubating', 'Sandbox', 'Archived']);
  });

  test('"Everyone" tab is active on load', async ({ page }) => {
    const activeTab = await page.locator('.section-nav .section-link.active').textContent();
    expect(activeTab?.trim()).toBe('Everyone');
  });

  test('ThemeToggle button is visible', async ({ page }) => {
    await expect(page.locator('.theme-toggle, [aria-label*="theme" i], [aria-label*="Theme" i]').first()).toBeVisible();
  });

  test('keyboard help button is visible', async ({ page }) => {
    await expect(page.locator('#help-button')).toBeVisible();
  });

  test('nav-group is to the right of header-left (horizontal layout on desktop)', async ({ page }) => {
    const positions = await page.evaluate(() => {
      const left = document.querySelector('.header-left');
      const nav = document.querySelector('.nav-group');
      if (!left || !nav) return null;
      return {
        leftRight: left.getBoundingClientRect().right,
        navLeft: nav.getBoundingClientRect().left,
      };
    });
    expect(positions).not.toBeNull();
    expect(positions!.navLeft).toBeGreaterThan(positions!.leftRight);
  });
});

test.describe('header — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');
  });

  test('nav-group stacks below header-left on mobile', async ({ page }) => {
    const positions = await page.evaluate(() => {
      const left = document.querySelector('.header-left');
      const nav = document.querySelector('.nav-group');
      if (!left || !nav) return null;
      return {
        leftBottom: left.getBoundingClientRect().bottom,
        navTop: nav.getBoundingClientRect().top,
      };
    });
    expect(positions).not.toBeNull();
    // nav-group should start at or below header-left's bottom
    expect(positions!.navTop).toBeGreaterThanOrEqual(positions!.leftBottom - 4); // 4px tolerance
  });

  test('search input has positive width on mobile', async ({ page }) => {
    const width = await page.evaluate(() => {
      const el = document.getElementById('search-input');
      return el ? el.getBoundingClientRect().width : 0;
    });
    expect(width).toBeGreaterThan(100);
  });

  test('SiteSwitcher pills are smaller on mobile than desktop', async ({ page }) => {
    const mobilePadding = await page.evaluate(() => {
      const pill = document.querySelector('.switcher-pill');
      return pill ? parseFloat(getComputedStyle(pill).paddingTop) : 0;
    });
    // Desktop pill padding is 0.3rem (~4.8px), mobile override is 0.2rem (~3.2px)
    expect(mobilePadding).toBeLessThanOrEqual(4);
  });
});

test.describe('pinned newsletter section', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');
  });

  test('pinned-newsletter is visible on Everyone tab when present', async ({ page }) => {
    // The element may not exist if changelog.json has no newsletter events yet (first build).
    // When it exists, it MUST be visible on the Everyone tab.
    const exists = (await page.locator('#pinned-newsletter').count()) > 0;
    if (exists) {
      await expect(page.locator('#pinned-newsletter')).toBeVisible();
    }
    // If absent, that's valid — no newsletter data yet.
  });

  test('pinned-newsletter is hidden on all non-Everyone tabs when present', async ({ page }) => {
    const exists = (await page.locator('#pinned-newsletter').count()) > 0;
    if (!exists) return; // no newsletter data, nothing to assert

    for (const tab of ['graduated', 'incubating', 'sandbox', 'archived']) {
      await page.click(`[data-tab="${tab}"]`);
      await expect(
        page.locator('#pinned-newsletter'),
        `pinned-newsletter must be hidden on the "${tab}" tab`,
      ).toBeHidden();
    }

    // Switching back to Everyone must restore visibility
    await page.click('[data-tab="everyone"]');
    await expect(page.locator('#pinned-newsletter')).toBeVisible();
  });

  test('pinned-newsletter contains logo, title, and lwcn.dev link when present', async ({ page }) => {
    const exists = (await page.locator('#pinned-newsletter').count()) > 0;
    if (!exists) return; // no newsletter data, nothing to assert

    const section = page.locator('#pinned-newsletter');
    await expect(section.locator('.pinned-newsletter-logo')).toBeVisible();
    await expect(section.locator('.pinned-newsletter-title')).toBeVisible();
    await expect(section.locator('.pinned-newsletter-cta')).toBeVisible();

    const href = await section.locator('a.pinned-newsletter-card').getAttribute('href');
    expect(href, 'pinned newsletter card must link to lwcn.dev').toMatch(/lwcn\.dev/);
  });

  test('pinned-newsletter badge reads "Latest Newsletter"', async ({ page }) => {
    const exists = (await page.locator('#pinned-newsletter').count()) > 0;
    if (!exists) return;

    const badge = page.locator('#pinned-newsletter .pinned-badge');
    const text = await badge.textContent();
    expect(text?.trim()).toContain('Latest Newsletter');
  });
});
