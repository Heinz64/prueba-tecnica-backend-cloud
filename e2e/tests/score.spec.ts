import { test, expect, type Page } from '@playwright/test';

async function login(page: Page, username: string, password: string) {
  await page.goto('/');
  await page.getByLabel('Usuario').fill(username);
  await page.getByLabel('Contrasena').fill(password);
  await page.getByRole('button', { name: /ingresar/i }).click();
  await expect(page.getByRole('heading', { name: /consulta de score/i })).toBeVisible();
}

test.describe('Consulta de score', () => {
  test('un usuario consulta exitosamente el score de su propio RUT', async ({ page }) => {
    await login(page, 'jperez', 'user123');
    await page.getByRole('button', { name: /consultar/i }).click();

    await expect(page.getByText(/rut consultado/i)).toBeVisible();
    await expect(page.locator('.score-value')).toBeVisible();
  });

  test('un admin puede consultar el score de un RUT que no es el suyo', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await page.getByLabel('RUT').fill('9.876.543-3');
    await page.getByRole('button', { name: /consultar/i }).click();

    await expect(page.getByText('9.876.543-3')).toBeVisible();
    await expect(page.locator('.score-value')).toBeVisible();
  });

  test('cerrar sesion limpia el estado y vuelve al login', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await page.getByRole('button', { name: /cerrar sesion/i }).click();

    await expect(page.getByRole('heading', { name: /iniciar sesion/i })).toBeVisible();
  });
});
