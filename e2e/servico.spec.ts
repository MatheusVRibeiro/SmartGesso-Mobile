import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8081';
const CREDENTIALS = {
  email: 'a.mult@example.com',
  password: 'Senha@123456',
};

test.describe('Serviços', () => {
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

  test('deve listar serviços existentes', async ({ page }) => {
    // Navegar para aba de serviços
    const servicosTab = page.locator('[data-testid="tab-servicos"], button:has-text("Serviços")');
    await servicosTab.click();

    // Verificar que a lista de serviços aparece (pode estar vazia)
    await expect(page.locator('.servico-item, [data-testid="servico-item"], text=/Nenhum serviço|Lista vazia/i')).toBeVisible({ timeout: 5000 });
  });

  test('deve aprovar orçamento e criar serviço', async ({ page }) => {
    // Navegar para orçamentos
    const orcamentosTab = page.locator('[data-testid="tab-orcamentos"], button:has-text("Orçamentos")');
    await orcamentosTab.click();

    // Selecionar primeiro orçamento pendente
    const orcamentoItem = page.locator('.orcamento-item:has-text("Pendente"), [data-testid="orcamento-item"]:has-text("Pendente")').first();
    
    // Se não houver orçamentos pendentes, criar um novo primeiro
    if (!(await orcamentoItem.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    await orcamentoItem.click();

    // Verificar detalhes do orçamento
    await expect(page.locator('text=/Detalhes|Orçamento/i')).toBeVisible();

    // Aprovar orçamento
    const aprovarButton = page.locator('button:has-text("Aprovar"), button:has-text("Aprovar Orçamento")');
    await aprovarButton.click();

    // Confirmar aprovação
    const confirmarButton = page.locator('button:has-text("Confirmar"), button:has-text("Sim")');
    if (await confirmarButton.isVisible({ timeout: 2000 })) {
      await confirmarButton.click();
    }

    // Verificar mensagem de sucesso
    await expect(page.locator('text=/sucesso|aprovado|serviço criado/i')).toBeVisible({ timeout: 5000 });
  });

  test('deve atualizar status do serviço', async ({ page }) => {
    // Navegar para serviços
    const servicosTab = page.locator('[data-testid="tab-servicos"], button:has-text("Serviços")');
    await servicosTab.click();

    // Selecionar primeiro serviço
    const servicoItem = page.locator('.servico-item, [data-testid="servico-item"]').first();
    
    if (!(await servicoItem.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }

    await servicoItem.click();

    // Verificar detalhes do serviço
    await expect(page.locator('text=/Detalhes|Serviço/i')).toBeVisible();

    // Atualizar status para "Em Andamento"
    const statusButton = page.locator('button:has-text("Iniciar"), button:has-text("Em Andamento")');
    if (await statusButton.isVisible({ timeout: 3000 })) {
      await statusButton.click();

      // Confirmar mudança de status
      const confirmarButton = page.locator('button:has-text("Confirmar")');
      if (await confirmarButton.isVisible({ timeout: 2000 })) {
        await confirmarButton.click();
      }

      // Verificar que status foi atualizado
      await expect(page.locator('text=/Em Andamento|Concluído|Iniciado/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('deve listar histórico de serviços', async ({ page }) => {
    // Navegar para serviços
    const servicosTab = page.locator('[data-testid="tab-servicos"], button:has-text("Serviços")');
    await servicosTab.click();

    // Verificar que há filtros ou aba de histórico
    const historicoTab = page.locator('button:has-text("Histórico"), [role="tab"]:has-text("Histórico")');
    if (await historicoTab.isVisible({ timeout: 3000 })) {
      await historicoTab.click();

      // Verificar que lista de histórico aparece
      await expect(page.locator('.servico-item, [data-testid="servico-item"]')).toBeVisible({ timeout: 5000 });
    }
  });
});
