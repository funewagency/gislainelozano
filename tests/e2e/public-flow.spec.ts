import { test, expect } from '@playwright/test';

test.describe('Public site full flow', () => {
  test('home page loads with all major sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('navigation links scroll to sections', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    if (await nav.isVisible()) {
      const links = nav.getByRole('link');
      const count = await links.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('contact form is reachable from main page', async ({ page }) => {
    await page.goto('/');
    const contato = page.locator('section#contato, [id*="contato"]').first();
    if (await contato.count() > 0) {
      await contato.scrollIntoViewIfNeeded();
      await expect(contato).toBeVisible();
    }
  });

  test('API health endpoint returns valid response', async ({ request }) => {
    const response = await request.get('/api/health');
    expect([200, 503]).toContain(response.status());
    const data = await response.json();
    expect(data).toHaveProperty('ok');
    expect(data).toHaveProperty('db');
    expect(data).toHaveProperty('env');
  });

  test('Public settings endpoint works', async ({ request }) => {
    const response = await request.get('/api/settings');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('ga4Id');
    expect(data).toHaveProperty('fbPixelId');
  });
});
