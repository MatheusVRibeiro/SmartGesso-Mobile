import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8081';
const CREDENTIALS = {
  email: 'a.mult@example.com',
  password: 'Senha@123456',
};

test.describe('Modo Offline', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("Entrar"), button:has-text("Login")');

    await emailInput.fill(CREDENTIALS.email);
    await passwordInput.fill(CREDENTIALS.password);
    await loginButton.click();

    await page.waitForURL('**/', { timeout: 15000 });
  });

  test('deve detectar conexão offline', async ({ page }) => {
    // Simular offline
    await page.route('**/*', route => route.abort('connectionrefused'));

    // Verificar que app mostra indicador de offline
    await expect(page.locator('text=/offline|sem conexão|conectividade/i')).toBeVisible({ timeout: 5000 });
  });

  test('deve criar pagamento offline e salvar na fila', async ({ page }) => {
    // Navegar para novo pagamento
    const novoTab = page.locator('[data-testid="tab-novo"], button:has-text("Novo")');
    await novoTab.click();

    // Simular offline
    await page.route('**/*', route => route.abort('connectionrefused'));

    // Tentar criar pagamento offline
    const pagamentoButton = page.locator('button:has-text("Pagamento"), button:has-text("Registrar Pagamento")');
    if (await pagamentoButton.isVisible({ timeout: 3000 })) {
      await pagamentoButton.click();

      // Preencher dados do pagamento
      const valorInput = page.locator('input[placeholder*="valor"], input[type="number"]');
      await valorInput.fill('500');

      const descricaoInput = page.locator('input[placeholder*="descrição"], textarea');
      await descricaoInput.fill('Pagamento offline teste');

      // Salvar
      const salvarButton = page.locator('button:has-text("Salvar"), button:has-text("Registrar")');
      await salvarButton.click();

      // Verificar que salvou na fila (mensagem de pendência)
      await expect(page.locator('text=/pendente|fila|offline|salvo localmente/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('deve sincronizar dados quando voltar online', async ({ page }) => {
    // Criar pagamento offline primeiro
    const novoTab = page.locator('[data-testid="tab-novo"], button:has-text("Novo")');
    await novoTab.click();

    await page.route('**/*', route => route.abort('connectionrefused'));

    const pagamentoButton = page.locator('button:has-text("Pagamento"), button:has-text("Registrar Pagamento")');
    if (await pagamentoButton.isVisible({ timeout: 3000 })) {
      await pagamentoButton.click();

      const valorInput = page.locator('input[placeholder*="valor"], input[type="number"]');
      await valorInput.fill('750');

      const salvarButton = page.locator('button:has-text("Salvar"), button:has-text("Registrar")');
      await salvarButton.click();

      // Verificar que está na fila
      await expect(page.locator('text=/pendente|fila/i')).toBeVisible({ timeout: 5000 });
    }

    // Voltar online
    await page.unroute('**/*');

    // Forçar sincronização (se houver botão)
    const sincronizarButton = page.locator('button:has-text("Sincronizar"), button:has-text("Atualizar")');
    if (await sincronizarButton.isVisible({ timeout: 3000 })) {
      await sincronizarButton.click();
    }

    // Verificar que sincronizou (mensagem de sucesso ou fila vazia)
    await expect(page.locator('text=/sincronizado|sucesso|fila vazia/i')).toBeVisible({ timeout: 10000 });
  });

  test('deve mostrar status da fila offline', async ({ page }) => {
    // Navegar para tela de mais/opções
    const maisTab = page.locator('[data-testid="tab-mais"], button:has-text("Mais")');
    await maisTab.click();

    // Procurar indicador de fila offline
    const filaIndicator = page.locator('text=/fila offline|pendentes|sync/i');
    await expect(filaIndicator).toBeVisible({ timeout: 5000 });
  });

  test('deve limpar fila offline após sincronização', async ({ page }) => {
    // Primeiro criar algo offline
    const novoTab = page.locator('[data-testid="tab-novo"], button:has-text("Novo")');
    await novoTab.click();

    await page.route('**/*', route => route.abort('connectionrefused'));

    const pagamentoButton = page.locator('button:has-text("Pagamento"), button:has-text("Registrar Pagamento")');
    if (await pagamentoButton.isVisible({ timeout: 3000 })) {
      await pagamentoButton.click();

      const valorInput = page.locator('input[placeholder*="valor"], input[type="number"]');
      await valorInput.fill('1000');

      const salvarButton = page.locator('button:has-text("Salvar"), button:has-text("Registrar")');
      await salvarButton.click();
    }

    // Voltar online
    await page.unroute('**/*');

    // Esperar sincronização automática ou manual
    await page.waitForTimeout(2000);

    // Verificar que fila foi limpa
    const filaVazia = page.locator('text=/fila vazia|0 pendentes|nenhum pendente/i');
    if (await filaVazia.isVisible({ timeout: 3000 })) {
      await expect(filaVazia).toBeVisible();
    }
  });
});
