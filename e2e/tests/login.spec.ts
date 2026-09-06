import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('credenciales invalidas muestran un mensaje de error', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Usuario').fill('admin');
    await page.getByLabel('Contraseña').fill('clave-incorrecta');
    await page.getByRole('button', { name: /ingresar/i }).click();

    await expect(page.getByText(/usuario o contraseña incorrectos/i)).toBeVisible();
  });

  test('un usuario (role=user) inicia sesion y su RUT queda fijo/bloqueado', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Usuario').fill('jperez');
    await page.getByLabel('Contraseña').fill('user123');
    await page.getByRole('button', { name: /ingresar/i }).click();

    await expect(page.getByRole('heading', { name: /consulta de score/i })).toBeVisible();

    const rutInput = page.getByLabel('RUT');
    await expect(rutInput).toHaveValue('12.345.678-5');
    await expect(rutInput).toHaveAttribute('readonly', '');
  });
});
