import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';

test.describe('Admin Login', () => {
  test('redirects to login when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator('h2')).toContainText('Acesse o painel');
  });

  test('redirects to login for all protected admin routes', async ({ page }) => {
    for (const path of ['/admin/dashboard/leads', '/admin/dashboard/content', '/admin/dashboard/settings']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login/);
    }
  });

  test('login form shows username, password, and submit button', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('username field has focus on load', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForTimeout(1000); // framer-motion entrance animation
    await expect(page.locator('#username')).toBeFocused();
  });

  test('shows client-side error when username is empty', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('#password').fill('somepassword');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText(/Informe usuário e senha/i)).toBeVisible();
  });

  test('shows client-side error when password is empty', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('#username').fill('admin');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText(/Informe usuário e senha/i)).toBeVisible();
  });

  test('shows error on wrong password', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('wrong-password-xyz');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText(/usuário ou senha inválidos/i)).toBeVisible({ timeout: 10000 });
  });

  test('shows error on wrong username', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('#username').fill('notanadmin');
    await page.locator('#password').fill('somepassword');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText(/usuário ou senha inválidos/i)).toBeVisible({ timeout: 10000 });
  });

  test('error has role=alert for screen readers', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('wrong');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.login();
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('h1')).toContainText('Painel');
  });

  test('shows loading spinner while login is in progress', async ({ page }) => {
    let resolve: () => void;
    const blocker = new Promise<void>((r) => { resolve = r; });
    await page.route('**/api/auth/**', async (route) => {
      await blocker;
      await route.continue();
    });

    await page.goto('/admin/login');
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('any');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Entrando...')).toBeVisible();
    resolve!();
  });

  test('logout button signs out and redirects to login', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.login();
    await page.getByRole('button', { name: /Sair/i }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator('h2')).toContainText('Acesse o painel');
  });
});
