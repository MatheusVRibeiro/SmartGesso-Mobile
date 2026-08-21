import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8081';
const CREDENTIALS = {
  email: 'a.mult@example.com',
  password: 'Senha@123456',
};

test.describe('Orçamentos', () => {
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

  test('deve listar orçamentos existentes', async ({ page }) => {
    // Navegar para aba de orçamentos
    const orcamentosTab = page.locator('[data-testid="tab-orcamentos"], button:has-text("Orçamentos")');
    await orcamentosTab.click();

    // Verificar que a lista de orçamentos aparece
    await expect(page.locator('.orcamento-item, [data-testid="orcamento-item"]')).toBeVisible({ timeout: 5000 });
  });

  test('deve criar novo orçamento via wizard', async ({ page }) => {
    // Navegar para novo orçamento
    const novoTab = page.locator('[data-testid="tab-novo"], button:has-text("Novo")');
    await novoTab.click();

    // Passo 1: Selecionar cliente
    const clienteInput = page.locator('input[placeholder*="cliente"], input[name="cliente"]');
    await clienteInput.fill('Cliente Teste E2E');
    
    // Se houver autocomplete, selecionar primeira opção
    const autocompleteOption = page.locator('[role="option"], .autocomplete-item').first();
    if (await autocompleteOption.isVisible({ timeout: 2000 })) {
      await autocompleteOption.click();
    }

    // Avançar para próximo passo
    const proximoButton = page.locator('button:has-text("Próximo"), button:has-text("Avançar")');
    await proximoButton.click();

    // Passo 2: Adicionar itens
    const adicionarItemButton = page.locator('button:has-text("Adicionar Item"), button:has-text("+ Item")');
    await adicionarItemButton.click();

    // Preencher dados do item
    const descricaoItem = page.locator('input[placeholder*="descrição"], textarea');
    await descricaoItem.fill('Forro de gesso 4x4');

    const valorItem = page.locator('input[placeholder*="valor"], input[type="number"]');
    await valorItem.fill('150');

    const quantidadeItem = page.locator('input[placeholder*="quantidade"], input[name="quantidade"]');
    await quantidadeItem.fill('10');

    // Confirmar item
    const confirmarItemButton = page.locator('button:has-text("Confirmar"), button:has-text("Adicionar")');
    await confirmarItemButton.click();

    // Avançar para revisão
    await proximoButton.click();

    // Passo 3: Revisão - verificar valores
    await expect(page.locator('text=/Total|Valor Total/i')).toBeVisible();

    // Salvar orçamento
    const salvarButton = page.locator('button:has-text("Salvar"), button:has-text("Criar Orçamento")');
    await salvarButton.click();

    // Verificar mensagem de sucesso
    await expect(page.locator('text=/sucesso|criado|salvo/i')).toBeVisible({ timeout: 5000 });
  });

  test('deve editar orçamento existente', async ({ page }) => {
    // Navegar para lista de orçamentos
    const orcamentosTab = page.locator('[data-testid="tab-orcamentos"], button:has-text("Orçamentos")');
    await orcamentosTab.click();

    // Selecionar primeiro orçamento da lista
    const primeiroOrcamento = page.locator('.orcamento-item, [data-testid="orcamento-item"]').first();
    await primeiroOrcamento.click();

    // Verificar que abriu detalhes do orçamento
    await expect(page.locator('text=/Detalhes|Orçamento/i')).toBeVisible();

    // Clicar em editar
    const editarButton = page.locator('button:has-text("Editar")');
    await editarButton.click();

    // Modificar valor do orçamento
    const valorInput = page.locator('input[placeholder*="valor"], input[name="valor"]');
    if (await valorInput.isVisible({ timeout: 3000 })) {
      await valorInput.clear();
      await valorInput.fill('250');
    }

    // Salvar alterações
    const salvarButton = page.locator('button:has-text("Salvar"), button:has-text("Atualizar")');
    await salvarButton.click();

    // Verificar mensagem de sucesso
    await expect(page.locator('text=/sucesso|atualizado/i')).toBeVisible({ timeout: 5000 });
  });
});
