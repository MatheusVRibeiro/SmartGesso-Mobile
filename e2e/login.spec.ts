import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8081';
const CREDENTIALS = {
  email: 'a.mult@example.com',
  password: 'Senha@123456',
};

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
  });

  test('deve renderizar tela de login', async ({ page }) => {
    // Verificar campos de entrada
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]');
    await expect(emailInput).toBeVisible();
    
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    
    // Verificar botão de login
    const loginButton = page.locator('button:has-text("Entrar"), button:has-text("Login")');
    await expect(loginButton).toBeVisible();
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("Entrar"), button:has-text("Login")');

    await emailInput.fill('invalid@email.com');
    await passwordInput.fill('wrongpassword');
    await loginButton.click();

    // Esperar mensagem de erro
    const errorMessage = page.locator('text=/erro|inválid|credenciais/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('deve fazer login com sucesso e navegar para dashboard', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("Entrar"), button:has-text("Login")');

    await emailInput.fill(CREDENTIALS.email);
    await passwordInput.fill(CREDENTIALS.password);
    await loginButton.click();

    // Esperar navegação para dashboard
    await page.waitForURL('**/', { timeout: 15000 });
    
    // Verificar que está na tela principal (dashboard/tabs)
    await expect(page.locator('[role="tablist"], .tabs, nav')).toBeVisible({ timeout: 10000 });
  });

  test('deve fazer logout corretamente', async ({ page }) => {
    // Login primeiro
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("Entrar"), button:has-text("Login")');

    await emailInput.fill(CREDENTIALS.email);
    await passwordInput.fill(CREDENTIALS.password);
    await loginButton.click();

    await page.waitForURL('**/', { timeout: 15000 });

    // Navegar para tela de mais/opções
    const maisTab = page.locator('[data-testid="tab-mais"], button:has-text("Mais")');
    await maisTab.click();

    // Clicar em logout
    const logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout")');
    await logoutButton.click();

    // Confirmar logout se houver modal
    const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Sim")');
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }

    // Verificar que voltou para login
    await page.waitForURL('**/login', { timeout: 5000 });
  });
});
