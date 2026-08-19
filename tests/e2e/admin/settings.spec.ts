import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';

test.describe('Admin Settings', () => {
  test.beforeEach(async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.loginAndGoTo('/admin/dashboard/settings');
  });

  test('settings page has correct heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Configurações');
  });

  test('shows onboarding wizard or integration cards', async ({ page }) => {
    // Either the wizard (no integrations yet) or the cards (integrations configured)
    const wizard = page.getByText(/configurar integrações/i);
    const gaCard = page.getByText('Google Analytics');
    const fbCard = page.getByText('Facebook Pixel');

    const wizardVisible = await wizard.isVisible().catch(() => false);
    const gaVisible = await gaCard.isVisible().catch(() => false);

    expect(wizardVisible || gaVisible).toBe(true);

    if (gaVisible) {
      await expect(fbCard).toBeVisible();
      await expect(page.getByText('Google Ads')).toBeVisible();
    }
  });

  test('sidebar navigation has all 4 items', async ({ page }) => {
    const sidebar = page.getByRole('navigation', { name: 'Navegação do painel' });
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByText('Painel')).toBeVisible();
    await expect(sidebar.getByText('Conteúdo')).toBeVisible();
    await expect(sidebar.getByText('Leads')).toBeVisible();
    await expect(sidebar.getByText('Configurações')).toBeVisible();
  });

  test('Configurações link is marked as active page', async ({ page }) => {
    const configLink = page.getByRole('navigation', { name: 'Navegação do painel' })
      .getByRole('link', { name: 'Configurações' });
    await expect(configLink).toHaveAttribute('aria-current', 'page');
  });

  test('can navigate to Conteúdo from settings sidebar', async ({ page }) => {
    const sidebar = page.getByRole('navigation', { name: 'Navegação do painel' });
    await sidebar.getByText('Conteúdo').click();
    await expect(page.locator('h1')).toContainText('Editor', { timeout: 8000 });
  });

  test('can navigate to Painel from settings sidebar', async ({ page }) => {
    const sidebar = page.getByRole('navigation', { name: 'Navegação do painel' });
    await sidebar.getByText('Painel').click();
    await expect(page.locator('h1')).toContainText('Painel', { timeout: 8000 });
  });

  test('retry banner appears on API failure', async ({ page }) => {
    await page.route('/api/admin/settings', (route) =>
      route.fulfill({ status: 500, json: { error: 'Server error' } })
    );
    await page.goto('/admin/dashboard/settings', { waitUntil: 'networkidle' });
    const retryBtn = page.getByRole('button', { name: /tentar novamente/i });
    await expect(retryBtn).toBeVisible({ timeout: 8000 });
  });
});

test.describe('POST /api/admin/settings/test — analytics ID format validation', () => {
  let authCookie: string;

  test.beforeEach(async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.login();
  });

  test('validates valid GA4 ID', async ({ request }) => {
    const res = await request.post('/api/admin/settings/test', {
      data: { service: 'ga4', id: 'G-MEASUREMENT12' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('rejects invalid GA4 ID format', async ({ request }) => {
    const res = await request.post('/api/admin/settings/test', {
      data: { service: 'ga4', id: 'UA-123456789' },
    });
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  test('validates valid Facebook Pixel ID', async ({ request }) => {
    const res = await request.post('/api/admin/settings/test', {
      data: { service: 'facebook', id: '1234567890123' },
    });
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('rejects Facebook Pixel ID with letters', async ({ request }) => {
    const res = await request.post('/api/admin/settings/test', {
      data: { service: 'facebook', id: 'ABC123456789012' },
    });
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  test('validates valid Google Ads ID', async ({ request }) => {
    const res = await request.post('/api/admin/settings/test', {
      data: { service: 'google-ads', id: 'AW-1234567890' },
    });
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('rejects Google Ads ID with wrong prefix', async ({ request }) => {
    const res = await request.post('/api/admin/settings/test', {
      data: { service: 'google-ads', id: 'GA-1234567890' },
    });
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  test('rejects empty ID', async ({ request }) => {
    const res = await request.post('/api/admin/settings/test', {
      data: { service: 'ga4', id: '' },
    });
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  test('rejects ID longer than 100 characters', async ({ request }) => {
    const res = await request.post('/api/admin/settings/test', {
      data: { service: 'ga4', id: 'G-' + 'A'.repeat(100) },
    });
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  test('rejects unknown service type', async ({ request }) => {
    const res = await request.post('/api/admin/settings/test', {
      data: { service: 'tiktok', id: 'TT-12345' },
    });
    const body = await res.json();
    expect(body.ok).toBe(false);
  });
});
