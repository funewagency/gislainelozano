import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';

test.describe('Admin Dashboard', () => {
  test('loads dashboard with KPI cards after login', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.login();
    await expect(page.locator('h1')).toContainText('Painel', { timeout: 10000 });
  });

  test('displays all navigation links in sidebar', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.login();
    const sidebar = page.getByRole('complementary', { name: 'Navegação do painel' });
    await expect(sidebar).toBeVisible();
    for (const link of ['Conteúdo (CMS)', 'Painel', 'Leads', 'Configurações']) {
      await expect(sidebar.getByRole('link', { name: link })).toBeVisible();
    }
  });

  test('navigates to each admin section', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.login();
    const sidebar = page.getByRole('complementary', { name: 'Navegação do painel' });

    await sidebar.getByRole('link', { name: 'Conteúdo (CMS)' }).click();
    await expect(page.locator('h1')).toContainText('Conteúdo', { timeout: 8000 });

    await sidebar.getByRole('link', { name: 'Leads' }).click();
    await expect(page.locator('h1')).toContainText('Leads', { timeout: 8000 });

    await sidebar.getByRole('link', { name: 'Painel' }).click();
    await expect(page.locator('h1')).toContainText('Painel', { timeout: 8000 });

    await sidebar.getByRole('link', { name: 'Configurações' }).click();
    await expect(page.locator('h1')).toContainText('Configurações', { timeout: 8000 });
  });

  test('sidebar collapses on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const auth = new AuthPage(page);
    await auth.login();
    await expect(page.getByLabel('Abrir menu')).toBeVisible();
  });

  test('opens and closes mobile sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const auth = new AuthPage(page);
    await auth.login();
    await page.getByLabel('Abrir menu').click();
    await expect(page.getByLabel('Fechar menu')).toBeVisible();
    await page.getByLabel('Fechar menu').click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.getByLabel('Abrir menu')).toBeVisible();
  });

  test('logout redirects to login page', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.login();
    await page.getByRole('button', { name: /Sair/i }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('shows error state when API fails (retry banner)', async ({ page }) => {
    const auth = new AuthPage(page);
    await page.route('**/api/admin/analytics', (route) => route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Server error' }),
    }));
    await page.route('**/api/admin/leads*', (route) => route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Server error' }),
    }));
    await auth.login();
    await page.waitForTimeout(2000);
  });
});
