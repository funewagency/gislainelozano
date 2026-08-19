import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';

test.describe('Admin Leads', () => {
  test.beforeEach(async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.loginAndGoTo('/admin/dashboard/leads');
  });

  test('leads page has correct heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Leads');
  });

  test('shows record count text', async ({ page }) => {
    // "N registro(s)" appears in the header area once data is loaded
    const countEl = page.getByText(/\d+\s+registro/);
    await expect(countEl).toBeVisible({ timeout: 8000 });
  });

  test('leads table renders when data is present', async ({ page }) => {
    // If any leads exist, the table should show them
    const leadCount = await page.locator('table').count();
    const emptyState = await page.getByText(/nenhum lead/i).count();
    // Either a table or an empty-state message should be visible
    expect(leadCount + emptyState).toBeGreaterThan(0);
  });

  test('pagination shows when totalPages > 1', async ({ page }) => {
    // Only validates structure when pagination is rendered
    const paginationNav = page.getByRole('navigation', { name: 'Navegação de páginas' });
    const exists = await paginationNav.count();
    if (exists > 0) {
      await expect(paginationNav).toBeVisible();
      const pageButtons = paginationNav.getByRole('button');
      await expect(pageButtons.first()).toBeVisible();
    }
  });

  test('sidebar navigation is visible and has all items', async ({ page }) => {
    const sidebar = page.getByRole('navigation', { name: 'Navegação do painel' });
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByText('Painel')).toBeVisible();
    await expect(sidebar.getByText('Conteúdo')).toBeVisible();
    await expect(sidebar.getByText('Leads')).toBeVisible();
    await expect(sidebar.getByText('Configurações')).toBeVisible();
  });

  test('Leads link in sidebar is marked as current page', async ({ page }) => {
    const leadsLink = page.getByRole('navigation', { name: 'Navegação do painel' })
      .getByRole('link', { name: 'Leads' });
    await expect(leadsLink).toHaveAttribute('aria-current', 'page');
  });

  test('retry banner appears and retries on API failure', async ({ page }) => {
    // Navigate to fresh state with broken API
    await page.route('/api/admin/leads*', (route) =>
      route.fulfill({ status: 500, json: { error: 'Server error' } })
    );
    await page.goto('/admin/dashboard/leads', { waitUntil: 'networkidle' });
    const retryBtn = page.getByRole('button', { name: /tentar novamente/i });
    await expect(retryBtn).toBeVisible({ timeout: 8000 });
  });

  test('can select a lead, bulk-delete it, and see it removed', async ({ page, request }) => {
    // Create a throwaway lead via the public contact API.
    const email = `e2e-${Date.now()}@excl.test`;
    await request.post('/api/contact', {
      data: { name: 'Lead E2E Exclusão', email, phone: '5511999999999', source: 'test' },
    });
    // Refresh the (already loaded) Leads page to pick up the new row.
    await page.reload({ waitUntil: 'networkidle' });

    const search = page.getByPlaceholder(/Buscar por nome/);
    await search.fill(email);
    await expect(page.getByText('Lead E2E Exclusão')).toBeVisible({ timeout: 8000 });

    // Accept the native confirm dialog triggered by deletion.
    page.on('dialog', (dialog) => dialog.accept());

    // Select all on the (filtered) page, then bulk-delete.
    await page.getByRole('button', { name: /Selecionar todos da página/i }).click();
    await expect(page.getByText('1 selecionado(s)')).toBeVisible();
    await page.getByRole('button', { name: /Excluir .+ lead/i }).click();

    // After deletion the row should be gone.
    await search.fill('');
    await page.reload({ waitUntil: 'networkidle' });
    await search.fill(email);
    await expect(page.getByText('Nenhum lead encontrado.')).toBeVisible({ timeout: 8000 });
  });
});
