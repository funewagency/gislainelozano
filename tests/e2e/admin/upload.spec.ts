import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';

test.describe('Admin Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.loginAndGoTo('/admin/dashboard/content');
  });

  test('sidebar is visible on content page', async ({ page }) => {
    const sidebar = page.getByRole('navigation', { name: 'Navegação do painel' });
    await expect(sidebar).toBeVisible();
  });

  test('can navigate Painel → Leads → Painel via sidebar', async ({ page }) => {
    const sidebar = page.getByRole('navigation', { name: 'Navegação do painel' });

    await sidebar.getByRole('link', { name: 'Leads' }).click();
    await expect(page.locator('h1')).toContainText('Leads', { timeout: 8000 });

    await sidebar.getByRole('link', { name: 'Painel' }).click();
    await expect(page.locator('h1')).toContainText('Painel', { timeout: 8000 });
  });

  test('active link has aria-current=page attribute', async ({ page }) => {
    const sidebar = page.getByRole('navigation', { name: 'Navegação do painel' });
    const activeLink = sidebar.locator('[aria-current="page"]');
    await expect(activeLink).toHaveCount(1);
  });
});

test.describe('POST /api/admin/upload — image upload', () => {
  test.beforeEach(async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.login();
  });

  test('returns 401 without authentication', async ({ request }) => {
    const buffer = Buffer.from('fake image data');
    const res = await request.post('/api/admin/upload', {
      multipart: {
        file: { name: 'test.jpg', mimeType: 'image/jpeg', buffer },
      },
    });
    expect(res.status()).toBe(401);
  });

  test('returns 400 when no file is sent', async ({ page, request }) => {
    // Session cookie is set from beforeEach login
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

    const res = await request.post('/api/admin/upload', {
      headers: { Cookie: cookieHeader },
      multipart: {},
    });
    expect(res.status()).toBe(400);
  });
});
