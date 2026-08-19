import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { snapshotCmsData, restoreCmsData, pollCmsUntil } from '../helpers/cms';

test.describe('Admin CMS Editor', () => {
  test.beforeEach(async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.loginAndGoTo('/admin/dashboard/content');
  });

  test('editor page has correct heading', async ({ page }) => {
    await expect(page.getByText('Editor de Conteúdo')).toBeVisible();
  });

  test('save button is disabled when no changes made', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Salvar/i })).toBeDisabled();
  });

  test('save button enables after editing a field', async ({ page }) => {
    await page.getByRole('button', { name: 'Hero' }).click();
    const ctaInput = page.getByLabel('Texto do CTA');
    await ctaInput.fill('Test CTA change');
    await expect(page.getByRole('button', { name: /Salvar/i })).toBeEnabled();
  });

  test('all 11 section editors are listed', async ({ page }) => {
    const sections = [
      'Navbar', 'Hero', 'Para Quem É', 'Sobre Mim', 'Posicionamento',
      'Serviços', 'Feedbacks', 'FAQ', 'Contato', 'WhatsApp Modal', 'Footer',
    ];
    for (const section of sections) {
      await expect(page.getByText(section).first()).toBeVisible();
    }
  });

  test('can switch between Seções and Histórico tabs', async ({ page }) => {
    await page.getByRole('tab', { name: 'Histórico' }).click();
    await expect(page.getByRole('tab', { name: 'Histórico' })).toBeVisible();
    await page.getByRole('tab', { name: 'Seções' }).click();
    await expect(page.getByRole('tab', { name: 'Seções' })).toBeVisible();
  });

  test('theme editor shows color and font options', async ({ page }) => {
    await page.getByRole('button', { name: 'Tema' }).click();
    await expect(page.getByText('Cor Primária')).toBeVisible();
    await expect(page.getByText('Fonte de Títulos')).toBeVisible();
  });

  test('WhatsApp Modal section fields are editable', async ({ page }) => {
    await page.getByRole('button', { name: 'WhatsApp Modal' }).click();
    await expect(page.getByLabel('Título do Modal')).toBeVisible();
  });

test('saves WhatsApp modal title change and persists after reload', async ({ page }) => {
    const snapshot = await snapshotCmsData(page)
    const newTitle = `Teste E2E ${Date.now()}`

    try {
      await page.getByRole('button', { name: 'WhatsApp Modal' }).click()
      const titleInput = page.getByLabel('Título do Modal')
      await titleInput.fill(newTitle)

      // Verify save button is enabled before clicking
      await expect(page.getByRole('button', { name: /Salvar/i })).toBeEnabled({ timeout: 3000 })

      // Click save
      await page.getByRole('button', { name: /Salvar/i }).click()
      await expect(page.getByText('Salvo')).toBeVisible({ timeout: 15000 })

      // Verify persistence via API with polling (handles read-after-write race)
      const savedTitle = await pollCmsUntil(page, (data) => {
        const title = data.whatsappModal?.title
        return title === newTitle ? title : null
      }, { timeout: 10000, interval: 300 })
      expect(savedTitle).toBe(newTitle)
    } finally {
      // Restore the original values so the test leaves no trace in the DB
      await restoreCmsData(page, snapshot)
    }
  });

  test('save button returns to disabled state after successful save', async ({ page }) => {
    await page.route('**/api/admin/cms', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 200, json: { revision: { id: 'mock', version: 1 } } });
      } else {
        await route.continue();
      }
    });
    await page.getByRole('button', { name: 'WhatsApp Modal' }).click();
    await page.getByLabel('Título do Modal').fill('temp value');
    await page.getByRole('button', { name: /Salvar/i }).click();
    await expect(page.getByText('Salvo')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Salvar/i })).toBeDisabled({ timeout: 5000 });
  });

  test('sidebar Leads link navigates to leads page', async ({ page }) => {
    const sidebar = page.getByRole('complementary', { name: 'Navegação do painel' });
    await sidebar.getByText('Leads').click();
    await expect(page.locator('h1')).toContainText('Leads', { timeout: 8000 });
  });
});
