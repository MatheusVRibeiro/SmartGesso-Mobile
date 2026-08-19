# SmartGesso Mobile

## Register

product

## Platform

adaptive

## Users

Gesseiros e pequenas empresas de gesso/drywall (1–10 funcionários). Usam o app no celular, dentro da obra, com luz variável e mãos sujas de pó. Precisam de leitura rápida, botões grandes, contraste forte e fluxos curtos. Não são "power users" de tecnologia — a interface precisa ser óbvia e funcionar em 2 segundos de olhada.

## Product Purpose

Centralizar e organizar toda a operação de pequenas empresas de gesso e drywall em um único sistema. Controla desde o primeiro contato com o cliente até o recebimento final do serviço, reduzindo cadernos, planilhas separadas, cálculos manuais e informações espalhadas no WhatsApp.

Fluxo principal: **Cliente → Obra → Medição → Cálculo de materiais → Orçamento → Aprovação → Produção → Instalação → Pagamento → Resultado do serviço**.

Sucesso = o gesseiro controla custo, venda e lucro de cada serviço, sem papelada e sem perda de informação na obra.

## Positioning

Plataforma de gestão para empresas de gesso e drywall que integra clientes, medições, cálculo de materiais, orçamentos, produção, serviços, financeiro e estoque — permitindo organização, controle de custos e acompanhamento da rentabilidade de cada serviço.

## Brand Personality

Confiável, direto, trabalhador. Três palavras: **prático, sólido, profissional**. O app fala a língua do canteiro — sem jargão, sem firula, sem "empresa de tecnologia" fingindo.

## Anti-references

- Não parece um app bancário genérico (azul corporate frio, denso, intimidante)
- Não parece um SaaS de marketing (landing page brilhante, features falsas)
- Não parece um brinquedo (cores pastel fofas, cantos exageradamente arredondados)
- Não usa gradientes decorativos, glassmorphism ou emojis como ícones

## Design Principles

1. **Contraste de obra**: texto ≥4.5:1, nada de cinza-claro "elegante" que desbota no sol
2. **Uma ação por tela**: botões grandes (≥44px), hierarquia óbvia, fluxos curtos
3. **Dados na frente**: o valor que importa (R$, status, prazo, estoque, lucro) aparece primeiro e em destaque
4. **Status sempre legíveis**: badge com cor + texto (nunca só cor) — OS, pagamentos, estoque
5. **Consistência de tokens**: zero cores hardcoded, tudo via theme tokens

## Accessibility & Inclusion

- Contraste WCAG AA+ (texto #312E81 sobre #F5F3FF/#FFFFFF)
- Touch targets ≥44px (dedos sujos, luvas grossas)
- Feedback de loading em toda ação (nunca estado instantâneo sem resposta)
- Formulários com labels visíveis e erros próximos ao campo