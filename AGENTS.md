# AGENTS.md — SmartGesso Mobile

## ⚠️ REGRA ABSOLUTA #1: CARREGAR SKILLS ANTES DE QUALQUER TAREFA

Antes de escrever qualquer código ou fazer qualquer alteração:
1. Rode `skills_list()` para ver skills disponíveis
2. Identifique skills relevantes para a tarefa
3. Carregue com `skill_view()` — NUNCA pule

Skills obrigatórias para este projeto:
- `react-native-expo-scaffold` — scaffolding e estrutura
- `spec-a23` — workflow de implementação
- `frontend-security-audit` — análise de segurança
- `codebase-health-check` — validação pré-finalização

## Stack
- React Native + Expo
- TypeScript strict
- React Navigation (auth flow + tabs)
- Axios + JWT refresh
- SecureStore para tokens

## Nunca fazer
- ❌ Colocar JWT em código ou AsyncStorage
- ❌ Expor secrets no código mobile
- ❌ Confiar companyId do body (usar contexto de autenticação)
- ❌ Escrever CSS puro (usar NativeWind/StyleSheet)
- ❌ Declarar sucesso sem testes
- ❌ Criar Docker

## Sempre fazer
- ✅ Carregar skills ANTES de implementar
- ✅ Validar dados com Zod
- ✅ Executar lint, typecheck e build
- ✅ Commitar em PT-BR ao final de cada fase

## API
- Backend: NestJS+Prisma+MySQL
- Auth: BFF via Admin Web (porta 3001)

---

## Codex + verboo-bridge

**Codex é APENAS planejador/orquestrador — NUNCA implementa código diretamente.**

### Fluxo

1. Codex **planeia** as etapas, estrutura o plano, define o que precisa ser feito
2. Codex chama `@verboo_agent` para **toda** execução — análise, código, refatoração
3. `verboo-bridge` classifica a tarefa e roteia para o melhor modelo Verboo
4. Codex **revisa** o retorno, roda bash/testes, **nunca implementa**

### Regras

- `@verboo_agent` modo `read_only` → análise, auditoria, revisão de código
- `@verboo_agent` modo `write` → implementação, edição, refatoração
- Codex **só faz**: planejar, revisar diff, rodar bash/testes, commitar em PT-BR
- Código zero do Codex — toda implementação passa pelo Verboo
