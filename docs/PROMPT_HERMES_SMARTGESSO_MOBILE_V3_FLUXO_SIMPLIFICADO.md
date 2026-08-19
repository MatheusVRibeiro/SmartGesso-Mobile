# PROMPT MESTRE V3 — SMARTGESSO MOBILE
## Implementação completa com fluxo simplificado: Orçamento → Aprovação → Serviço

---

# 1. IDENTIFICAÇÃO DO PROJETO

**Nome do produto:** SmartGesso  
**Projeto:** `smartgesso-mobile`  
**Tipo:** aplicativo mobile SaaS multiempresa  
**Plataforma inicial:** Android  
**Plataforma futura:** iOS  
**Idioma:** Português do Brasil  
**Moeda:** BRL — Real Brasileiro  
**Fuso horário padrão:** `America/Sao_Paulo`  
**Backend:** `smartgesso-api`  
**Banco de dados:** MySQL acessado exclusivamente pela API  
**Público-alvo:** gesseiros, instaladores de drywall, pequenas empresas de gesso, fábricas de molduras, empresas de forro, sanca, divisórias e acabamento.

---

# 2. DIRETRIZ CENTRAL DE UX

O SmartGesso NÃO deve obrigar o usuário a pensar como um ERP.

A estrutura técnica pode possuir entidades independentes no backend, mas a experiência do usuário deve ser simples.

O usuário deve pensar em apenas três momentos:

```text
1. ANTES DA VENDA
   Cliente → Medição → Orçamento

2. DEPOIS DA APROVAÇÃO
   Serviço → Agenda → Execução → Pagamentos/Despesas → Conclusão

3. GESTÃO
   Financeiro → Estoque → Relatórios
```

A interface NÃO deve usar “Obra” como conceito principal.

Usar:

```text
Orçamento
Serviço
```

Regra conceitual:

```text
Ainda não foi aprovado?
→ é ORÇAMENTO

Foi aprovado e contratado?
→ vira SERVIÇO
```

O orçamento representa a oportunidade comercial.

O serviço representa o trabalho contratado e sua execução.

---

# 3. OBJETIVO DO SMARTGESSO

O SmartGesso deve centralizar o fluxo operacional e comercial de empresas de gesso e drywall.

Fluxo principal:

```text
Cliente
   ↓
Visita / Medição
   ↓
Orçamento
   ↓
Envio
   ↓
Aguardando decisão do cliente
   ↓
   ├── Não aprovado
   │      ↓
   │   Histórico
   │
   └── Aprovado
          ↓
       Serviço
          ↓
       Programação
          ↓
       Execução
          ↓
       Pagamentos
          ↓
       Despesas
          ↓
       Conclusão
          ↓
       Resultado
```

---

# 4. CONTEXTO REAL DO NEGÓCIO

O SmartGesso atende empresas que podem:

- comprar sacos de gesso;
- comprar placas de drywall;
- comprar perfis;
- comprar guias;
- comprar montantes;
- comprar parafusos;
- comprar fitas;
- comprar massas;
- comprar insumos;
- fabricar molduras;
- fabricar peças;
- armazenar materiais;
- realizar visitas;
- fazer medições;
- elaborar orçamentos;
- enviar orçamento pelo WhatsApp;
- produzir sob demanda;
- transportar materiais;
- instalar no cliente;
- registrar despesas;
- receber à vista ou parcelado;
- cobrar clientes;
- acompanhar o resultado financeiro do serviço.

O aplicativo deve substituir processos espalhados em:

- cadernos;
- papel;
- WhatsApp;
- planilhas;
- fotos soltas;
- comprovantes soltos;
- cálculos manuais.

---

# 5. PAPEL DO AGENTE PRINCIPAL

Atue como:

- Arquiteto Mobile Sênior;
- Desenvolvedor React Native Sênior;
- Especialista em Expo;
- Especialista em TypeScript;
- Especialista em UX/UI para aplicativos operacionais;
- Especialista em segurança mobile;
- Especialista em integração REST;
- Especialista em sistemas SaaS multiempresa;
- Especialista em testes automatizados.

Não implemente apenas telas estáticas.

Implemente:

- navegação;
- componentes;
- fluxos reais;
- estados;
- integração;
- autenticação;
- multiempresa;
- permissões;
- validação;
- tratamento de erros;
- feedback visual;
- acessibilidade;
- testes;
- documentação.

---

# 6. USO DE SKILLS E AGENTES

Antes de alterar arquivos:

1. Inventariar skills disponíveis.
2. Ler skills relevantes.
3. Identificar agentes especializados.
4. Inspecionar o repositório.
5. Criar plano técnico.
6. Delegar tarefas independentes.
7. Revisar qualquer trabalho delegado antes de integrar.

Buscar competências relacionadas a:

- React Native;
- Expo;
- Expo Router;
- TypeScript;
- design system;
- UX mobile;
- segurança mobile;
- OpenAPI;
- TanStack Query;
- React Hook Form;
- Zod;
- testes;
- Android;
- EAS;
- acessibilidade;
- performance.

Delegar quando possível:

### Arquitetura
- rotas;
- features;
- estado;
- cache;
- multiempresa;
- integração API.

### Design system
- tokens;
- componentes;
- acessibilidade;
- responsividade;
- consistência visual.

### Segurança
- tokens;
- SecureStore;
- sessão;
- refresh;
- arquivos;
- cache;
- troca de empresa.

### Testes
- unitários;
- componentes;
- integração;
- navegação;
- fluxos críticos.

### Revisão final
- vazamento entre empresas;
- estados ausentes;
- duplicação;
- acessibilidade;
- credenciais;
- mocks indevidos;
- erros de regra de negócio.

---

# 7. STACK TECNOLÓGICA

Utilizar:

```text
TypeScript
React Native
Expo
Expo Router
TanStack Query
React Hook Form
Zod
Zustand
Axios
Expo SecureStore
Expo Image
Expo FileSystem
Expo Sharing
Expo Linking
Jest
React Native Testing Library
ESLint
Prettier
```

Requisitos:

- TypeScript strict;
- evitar `any`;
- contratos tipados;
- tipos derivados da OpenAPI quando disponível;
- um único gerenciador de pacotes;
- preferencialmente npm.

---

# 8. ARQUITETURA

Fluxo obrigatório:

```text
SmartGesso Mobile
        ↓ HTTPS
SmartGesso API
        ↓
MySQL
```

O mobile nunca acessa o banco diretamente.

É proibido no mobile:

- SQL;
- Prisma;
- MySQL client;
- `DATABASE_URL`;
- senha de banco;
- segredo JWT;
- credenciais da Hostinger;
- regra definitiva de autorização;
- lógica oficial de cálculo de materiais dependente apenas do frontend.

---

# 9. AMBIENTES DA API

Preparar suporte a:

```text
development
preview/homologation
production
```

Exemplo conceitual:

```text
EXPO_PUBLIC_API_URL=https://api.smartgesso.com.br/api/v1
```

Não colocar segredos em variáveis públicas.

---

# 10. NAVEGAÇÃO PRINCIPAL

Barra inferior:

```text
Início
Orçamentos
Novo
Serviços
Mais
```

O botão `Novo` deve ser central e destacado.

## Menu Novo

Priorizar ações realmente frequentes:

```text
Novo orçamento
Novo cliente
Agendar visita
Registrar pagamento
Nova despesa
```

Não colocar “Nova obra”.

Não exigir “Novo serviço” no fluxo normal.

O serviço nasce preferencialmente a partir de um orçamento aprovado.

---

# 11. PRINCÍPIO DE FLUXO CURTO

Evitar obrigar o usuário a executar:

```text
Criar cliente
→ sair
→ criar local
→ sair
→ criar medição
→ sair
→ criar orçamento
→ sair
→ criar serviço
```

O fluxo deve permitir criação contextual.

Exemplo:

```text
Novo orçamento
  ↓
Selecionar cliente existente
OU
Cadastrar cliente rapidamente
  ↓
Informar local
  ↓
Medição
  ↓
Serviços
  ↓
Valores
  ↓
Prazo
  ↓
Pagamento
  ↓
Gerar
```

O que puder ser inferido ou reaproveitado deve ser preenchido automaticamente.

---

# 12. CADASTRO RÁPIDO DE CLIENTE

Durante um novo orçamento, permitir criar cliente sem abandonar o fluxo.

Cadastro mínimo:

```text
Nome
Telefone
WhatsApp
```

Campos adicionais podem ser preenchidos depois:

```text
CPF/CNPJ
E-mail
Endereço principal
Observações
```

Não tornar informações não essenciais obrigatórias para uma primeira visita.

---

# 13. ENTIDADE CONCEITUAL ORÇAMENTO

Antes da aprovação, o orçamento deve conter tudo necessário para preservar a visita realizada.

Um orçamento pode conter:

- cliente;
- endereço/local onde o serviço poderá ser executado;
- data da visita;
- data da medição;
- responsável pela medição;
- ambientes;
- medidas;
- fotos;
- croquis/desenhos quando suportado;
- tipo de serviço;
- composição técnica;
- materiais calculados;
- serviços;
- mão de obra;
- transporte;
- desconto;
- preço;
- forma de pagamento;
- validade comercial;
- previsão de início;
- previsão de conclusão;
- data-limite de entrega;
- prazo em dias;
- observações;
- garantia;
- histórico;
- versões;
- PDF.

Não criar Serviço apenas porque existe um orçamento.

---

# 14. STATUS DO ORÇAMENTO

Suportar:

```text
DRAFT
READY_TO_SEND
SENT
WAITING_APPROVAL
APPROVED
REJECTED
EXPIRED
CANCELLED
```

Exibir linguagem amigável:

```text
Rascunho
Pronto para enviar
Enviado
Aguardando aprovação
Aprovado
Não aprovado
Vencido
Cancelado
```

Nunca perder histórico de mudança de status.

---

# 15. NOVO ORÇAMENTO — WIZARD SIMPLIFICADO

Estruturar em etapas:

```text
1. Cliente
2. Local
3. Medição
4. Serviço e materiais
5. Valores
6. Prazo
7. Pagamento
8. Revisão
```

Mostrar:

```text
Etapa 3 de 8
```

Ações:

```text
Voltar
Continuar
Salvar rascunho
```

Preservar dados quando houver erro ou interrupção.

---

# 16. ETAPA CLIENTE

Permitir:

```text
Buscar cliente
Selecionar cliente
Criar cliente rápido
```

Exibir recentes e busca.

---

# 17. ETAPA LOCAL

Pergunta:

```text
Onde o serviço será realizado?
```

Campos:

```text
CEP
Rua
Número
Complemento
Bairro
Cidade
Estado
Referência
```

Esse local pertence ao contexto do orçamento.

Não obrigar criação prévia de “Obra”.

---

# 18. ETAPA MEDIÇÃO

Permitir múltiplos ambientes.

Exemplo:

```text
Sala
5,00 x 4,00
20,00 m²

Quarto
4,00 x 3,00
12,00 m²
```

Campos possíveis:

- nome do ambiente;
- comprimento;
- largura;
- pé-direito;
- perímetro;
- área;
- portas;
- janelas;
- recortes;
- aberturas;
- luminárias;
- sancas;
- rebaixos;
- observações;
- fotos.

O mobile pode calcular área/perímetro para feedback.

O cálculo definitivo de composição/material deve vir da API.

---

# 19. ETAPA TIPO DE SERVIÇO

Opções iniciais:

```text
Forro de drywall
Parede de drywall
Divisória
Forro de gesso
Sanca
Moldura
Reparo
Acabamento
Outro
```

Permitir mais de um serviço no mesmo orçamento.

---

# 20. CÁLCULO DE MATERIAIS

Após medidas e serviço:

```text
Ambiente: Sala
Área: 20,00 m²
Serviço: Forro de drywall
```

Mostrar retorno da API:

```text
Placas
Perfis
Guias
Montantes
Parafusos
Fitas
Massa
Suportes
Outros
Perda considerada
Custo estimado
```

Não tratar uma fórmula única como universal.

Composições devem ser configuráveis e versionadas no backend.

---

# 21. ETAPA VALORES

Mostrar conforme permissão:

```text
Materiais
Mão de obra
Transporte
Outros custos
Desconto
Preço de venda
Margem estimada
```

Custos e margem só para permissões adequadas.

O cliente não deve receber custos internos automaticamente no PDF.

---

# 22. PRAZO DO ORÇAMENTO — NOVO REQUISITO CENTRAL

Adicionar uma etapa específica de prazo.

Permitir três modos:

### Modo A — início + duração

```text
Previsão de início
25/08/2026

Prazo estimado
3 dias úteis

Previsão calculada de conclusão
28/08/2026
```

### Modo B — início + conclusão

```text
Previsão de início
25/08/2026

Previsão de conclusão
28/08/2026
```

### Modo C — data limite

```text
Entregar até
30/08/2026
```

Permitir:

```text
Dias úteis
Dias corridos
```

Também permitir observação:

```text
Cliente precisa do serviço concluído antes de um evento.
```

---

# 23. DIFERENCIAR DATAS

Não misturar:

### Data da visita
Quando o profissional foi ao cliente.

### Data da medição
Quando as medidas foram registradas.

### Validade do orçamento
Até quando o preço/condições são válidos.

### Previsão de início
Quando se pretende começar.

### Previsão de conclusão
Quando se pretende terminar.

### Entregar até
Data-limite comercial combinada.

### Início real
Quando o serviço de fato começou.

### Conclusão real
Quando de fato terminou.

---

# 24. FORMA DE PAGAMENTO

Suportar:

```text
À vista
À vista com desconto
Entrada + saldo
Parcelado
Quinzenal
Mensal
Personalizado
```

Campos conforme modalidade.

Não criar recebimentos reais antes da confirmação adequada.

---

# 25. REVISÃO DO ORÇAMENTO

Mostrar resumo:

```text
Cliente
Local
Medições
Serviços
Materiais
Valores
Prazo
Forma de pagamento
Validade
Observações
```

Ações:

```text
Salvar rascunho
Gerar orçamento
Gerar PDF
Compartilhar
```

---

# 26. DETALHE DO ORÇAMENTO

Tela central de pré-venda.

Mostrar:

```text
ORC-00125
João Silva
R$ 4.800
Aguardando aprovação
```

Seções:

- Cliente;
- Local;
- Medições;
- Fotos;
- Serviços;
- Materiais;
- Valores;
- Prazo;
- Pagamento;
- Validade;
- Histórico.

Ações:

```text
Editar
Gerar/abrir PDF
Compartilhar
Duplicar
Aprovar orçamento
Marcar como não aprovado
Cancelar
```

---

# 27. APROVAÇÃO DO ORÇAMENTO

Ao tocar:

```text
Aprovar orçamento
```

Exibir confirmação:

```text
O cliente aprovou este orçamento?

ORC-00125
João Silva
R$ 4.800
```

Botões:

```text
Cancelar
Confirmar aprovação
```

Após confirmar:

1. alterar status para `APPROVED`;
2. registrar histórico;
3. preservar snapshot do orçamento;
4. oferecer criação do serviço;
5. reaproveitar automaticamente todos os dados.

---

# 28. ORÇAMENTO APROVADO → CRIAR SERVIÇO

Após aprovação:

```text
Orçamento aprovado com sucesso.

Deseja iniciar o planejamento deste serviço?
```

Ações:

```text
Criar serviço
Agora não
```

Ao criar Serviço, NÃO pedir novamente:

- cliente;
- local;
- medidas;
- fotos;
- itens;
- valores;
- prazo informado;
- pagamento planejado.

Reaproveitar tudo do orçamento.

---

# 29. TRATAMENTO DE PRAZO NA APROVAÇÃO

Se o orçamento foi aprovado dias depois, validar a previsão antiga.

Exemplo:

```text
Previsão original de início:
25/08/2026

Data atual:
28/08/2026
```

Mostrar:

```text
A previsão original de início já passou.
Defina uma nova programação para o serviço.
```

Permitir:

```text
Alterar datas
Confirmar datas válidas
```

Nunca iniciar silenciosamente com datas incoerentes.

---

# 30. ENTIDADE CONCEITUAL SERVIÇO

Após aprovação, o Serviço concentra toda a execução.

O Serviço deve possuir:

- orçamento de origem;
- cliente;
- local;
- medições;
- fotos;
- escopo contratado;
- valor contratado;
- condições de pagamento;
- previsão de início;
- previsão de conclusão;
- data-limite;
- data real de início;
- data real de conclusão;
- responsável;
- equipe;
- etapas;
- agenda;
- checklist;
- produção quando aplicável;
- materiais previstos;
- materiais realizados;
- despesas;
- pagamentos;
- fotos de execução;
- pendências;
- resultado financeiro.

---

# 31. STATUS DO SERVIÇO

Suportar estados como:

```text
WAITING_SCHEDULE
SCHEDULED
WAITING_CUSTOMER
WAITING_MATERIAL
IN_PRODUCTION
READY_FOR_INSTALLATION
IN_PROGRESS
PAUSED
COMPLETED
CANCELLED
```

Exibir:

```text
Aguardando agendamento
Agendado
Aguardando cliente
Aguardando material
Em produção
Pronto para instalação
Em execução
Pausado
Concluído
Cancelado
```

---

# 32. TELA SERVIÇO — CENTRAL OPERACIONAL

Exemplo:

```text
SERVIÇO #00148

João Silva
Forro de drywall

EM EXECUÇÃO
```

Mostrar no topo:

### Prazo

```text
Início previsto
25/08

Entrega prevista
28/08

Início real
25/08

Faltam
3 dias
```

### Financeiro

```text
Contratado
R$ 4.800

Recebido
R$ 2.000

A receber
R$ 2.800
```

### Custos

```text
Despesas vinculadas
R$ 1.580
```

### Atalhos

```text
Registrar pagamento
Adicionar despesa
Adicionar foto
Atualizar status
Ver agenda
Ver checklist
```

O usuário deve conseguir administrar quase tudo do serviço nessa tela.

---

# 33. ETAPAS DO SERVIÇO

Permitir múltiplas etapas:

```text
Medição
Produção
Separação de material
Transporte
Instalação
Acabamento
Retorno
Entrega
```

Exemplo:

```text
✓ Medição
✓ Produção das molduras
→ Instalação
○ Acabamento
○ Conclusão
```

Nem todo serviço precisa utilizar todas.

---

# 34. PRÉ-REQUISITOS PARA INÍCIO

Permitir checklist de condições:

```text
Ambiente liberado
Material disponível
Elétrica finalizada
Local seco
Acesso liberado
Outro
```

Isso ajuda a distinguir atraso da empresa de impedimento externo.

---

# 35. MOTIVOS DE PAUSA OU ATRASO

Ao alterar para `PAUSED` ou quando prazo for ultrapassado, permitir registrar motivo:

```text
Aguardando cliente
Aguardando material
Chuva
Ambiente não liberado
Outro fornecedor
Problema técnico
Reagendamento
Outro
```

Salvar observação e data.

---

# 36. AGENDA — NOVO MÓDULO INTEGRADO

Criar Agenda para:

- visita;
- medição;
- início;
- instalação;
- produção;
- retorno;
- acabamento;
- entrega;
- cobrança;
- outro compromisso.

Visualizações:

```text
Hoje
Amanhã
Semana
Calendário
```

Card:

```text
08:00
Medição
João Silva

13:30
Instalação
Maria Souza
```

---

# 37. DIFERENÇA ENTRE PREVISÃO E AGENDAMENTO

Previsão:

```text
Pretendemos iniciar entre 25 e 27/08.
```

Agendamento:

```text
Instalação confirmada:
26/08 às 08:00.
```

Não tratar os dois como a mesma coisa.

---

# 38. DASHBOARD REVISADO

Mostrar informações úteis para a rotina.

Cards:

```text
A receber
Orçamentos aguardando resposta
Serviços em andamento
Serviços hoje
```

Blocos:

### Hoje
- visitas;
- medições;
- instalações;
- entregas;
- cobranças.

### Orçamentos recentes
- valor;
- status;
- validade.

### Próximas entregas
- cliente;
- serviço;
- data-limite.

### Atenção
- orçamento vencendo;
- serviço próximo do prazo;
- serviço atrasado;
- pagamento vencido;
- estoque baixo.

Evitar dashboard poluído.

---

# 39. ORÇAMENTOS VENCIDOS

Se orçamento ultrapassar validade:

```text
Orçamento vencido
```

Permitir:

```text
Duplicar e atualizar
```

Reaproveitar:

- cliente;
- local;
- medições;
- fotos;
- escopo.

Recalcular preços e materiais quando necessário, preservando versão antiga.

---

# 40. HISTÓRICO / LINHA DO TEMPO

Orçamento e Serviço devem possuir histórico.

Exemplo:

```text
19/08
Medição registrada

19/08
Orçamento criado

19/08
Orçamento enviado

20/08
Orçamento aprovado

21/08
Entrada recebida - R$ 2.000

23/08
Serviço iniciado

23/08
Despesa - R$ 180

24/08
Serviço concluído

25/08
Pagamento final recebido
```

---

# 41. DESPESA CONTEXTUAL

Dentro de um Serviço:

```text
Adicionar despesa
```

O serviço já deve vir selecionado.

Campos:

```text
Categoria
Valor
Data
Fornecedor
Descrição
Comprovante
Observação
```

Categorias:

```text
Material
Combustível
Frete
Mão de obra
Alimentação
Ferramenta
Terceiro
Outro
```

Não obrigar o usuário a ir para o módulo financeiro e localizar novamente o serviço.

---

# 42. PAGAMENTO CONTEXTUAL

Dentro do Serviço:

```text
Registrar pagamento
```

Mostrar:

```text
Valor contratado
Pago
Saldo
```

Campos:

```text
Valor recebido
Data
Forma
Parcela
Comprovante
Observação
```

Atualizar saldo após confirmação da API.

---

# 43. FINANCEIRO CONSOLIDADO

Além do registro contextual, ter visão consolidada.

Exibir:

```text
A receber
Recebido
Vencido
Próximos vencimentos
Despesas
```

Filtros:

- período;
- cliente;
- serviço;
- status.

---

# 44. PRODUÇÃO

Produção deve ser opcional e vinculada ao Serviço.

Usar quando a empresa fabrica:

- molduras;
- sancas;
- peças;
- elementos de gesso.

Não obrigar empresas que só instalam drywall a utilizar Produção.

Dentro do Serviço:

```text
Produção necessária?
Sim / Não
```

Se sim, criar fluxo de produção.

---

# 45. CHECKLIST E FOTOS

Dentro do Serviço:

```text
Material carregado
Local protegido
Estrutura instalada
Placas instaladas
Acabamento concluído
Limpeza concluída
```

Fotos:

```text
Antes
Durante
Depois
```

Permitir configurações por tipo de serviço.

---

# 46. CONCLUSÃO DO SERVIÇO

Ao concluir:

```text
Concluir serviço
```

Validar:

- checklist obrigatório;
- pendências;
- fotos obrigatórias se configuradas;
- data real de conclusão.

Perguntar:

```text
O serviço foi concluído?
```

Registrar:

```text
Conclusão real
Observações
Pendências
```

---

# 47. RESULTADO DO SERVIÇO

Após concluir, mostrar:

```text
Valor contratado
R$ 4.800

Materiais
R$ 1.500

Mão de obra
R$ 700

Transporte
R$ 150

Outras despesas
R$ 200

Custo total
R$ 2.550

Resultado estimado
R$ 2.250

Margem
46,88%
```

Respeitar permissões.

---

# 48. PLANEJADO X REALIZADO

Preparar arquitetura para comparar:

```text
Material previsto
Material utilizado
Desvio

Prazo previsto
Prazo realizado
Desvio

Custo previsto
Custo realizado
Desvio
```

Esse recurso pode evoluir sem alterar o fluxo principal.

---

# 49. CLIENTES

Tela de clientes permanece.

Lista:

```text
João Silva
(14) 99999-9999
```

Perfil:

- telefone;
- WhatsApp;
- dados cadastrais;
- orçamentos;
- serviços;
- financeiro;
- histórico.

Remover atalhos “Obras”.

---

# 50. PERFIL DO CLIENTE REVISADO

Atalhos:

```text
Orçamentos
Serviços
Financeiro
Histórico
```

Botões:

```text
Ligar
WhatsApp
Editar
Novo orçamento
```

---

# 51. LISTA DE ORÇAMENTOS

Filtros:

```text
Todos
Rascunhos
Aguardando
Aprovados
Não aprovados
Vencidos
```

Busca por:

- cliente;
- número;
- telefone;
- status.

Cards devem mostrar:

```text
ORC-00125
João Silva
Forro drywall
R$ 4.800
Aguardando aprovação
```

---

# 52. LISTA DE SERVIÇOS

Filtros:

```text
Hoje
Agendados
Em andamento
Aguardando
Concluídos
```

Card:

```text
SERV-00148
João Silva
Forro drywall
Entrega: 28/08
Em andamento
```

Mostrar alerta se próximo do prazo.

---

# 53. PDF DO ORÇAMENTO

Gerado pela API.

Deve preservar snapshot imutável de:

- empresa;
- logo;
- dados comerciais;
- cliente;
- local;
- itens;
- preços;
- desconto;
- pagamento;
- validade;
- previsão de prazo;
- garantias;
- observações;
- versão de composição quando aplicável.

O PDF antigo nunca deve mudar quando dados futuros forem alterados.

---

# 54. PDF — PRAZO

Quando configurado, permitir mostrar:

```text
Previsão de início: 25/08/2026
Prazo estimado: 3 dias úteis
Previsão de conclusão: 28/08/2026
Entrega até: 30/08/2026
```

Não confundir com validade do orçamento.

---

# 55. IDENTIDADE DA EMPRESA

Documentos devem usar dados da empresa assinante:

- logo;
- nome fantasia;
- razão social;
- CPF/CNPJ;
- telefone;
- WhatsApp;
- e-mail;
- endereço;
- website/Instagram;
- Pix;
- dados bancários quando autorizado;
- rodapé;
- garantia;
- cores.

---

# 56. PERFIL DA EMPRESA

Exibir:

```text
Logo
Nome fantasia
Razão social
CNPJ
Telefone
WhatsApp
E-mail
Endereço
```

Configurações comerciais conforme permissão.

---

# 57. USUÁRIOS E PERMISSÕES

Perfis possíveis:

```text
COMPANY_OWNER
MANAGER
SALES
FINANCE
INSTALLER
PRODUCTION
```

### SALES
- clientes;
- medições;
- orçamentos.

### INSTALLER
- serviços;
- agenda;
- checklist;
- fotos.

### FINANCE
- recebimentos;
- cobranças;
- despesas.

Custos e margens devem respeitar permissões.

Criar `PermissionGate`.

---

# 58. AUTENTICAÇÃO

Usar SecureStore para tokens.

Nunca armazenar tokens sensíveis em AsyncStorage.

Implementar:

```text
Access Token
Refresh Token
Refresh Mutex
Revogação de sessão
Logout
Logout All
```

---

# 59. MULTIEMPRESA

Usuário pode participar de mais de uma empresa.

Ao trocar empresa:

1. cancelar requisições;
2. limpar dados/cache do tenant anterior;
3. atualizar contexto;
4. carregar empresa;
5. carregar branding;
6. carregar permissões;
7. carregar dados do novo tenant.

Nunca permitir vazamento entre empresas.

---

# 60. ASSINATURA SMARTGESSO NÃO PERTENCE AO MOBILE

O aplicativo operacional não deve permitir:

- cadastrar empresa assinante;
- alterar plano;
- cobrar mensalidade SmartGesso;
- registrar pagamento de assinatura;
- renovar contrato SmartGesso;
- suspender/reactivar assinatura.

Esses controles pertencem ao `smartgesso-admin-web`.

No mobile, mostrar apenas estado resumido quando necessário.

---

# 61. ACESSO SUSPENSO

Tela:

```text
Acesso suspenso

O acesso desta empresa está temporariamente suspenso.
```

Ações:

```text
Falar com suporte
Trocar empresa
Sair
```

Não mostrar cobrança detalhada da plataforma.

---

# 62. ESTOQUE

Itens:

```text
Placa ST
Perfil F530
Parafuso GN25
Massa
Fita
Gesso
Molduras
```

Movimentos:

```text
Entrada
Saída
Reserva
Consumo
Perda
Ajuste
Retorno
```

Vincular consumo ao Serviço quando aplicável.

---

# 63. RESERVA E CONSUMO

Ao aprovar um orçamento e criar Serviço, preparar suporte para:

```text
Reservar materiais necessários
```

Na execução:

```text
Registrar consumo real
```

Permitir planejado x realizado.

---

# 64. RELATÓRIOS

Mobile deve manter relatórios simples.

Possíveis:

- faturamento;
- recebimentos;
- despesas;
- resultado;
- orçamentos;
- taxa de aprovação;
- serviços;
- estoque.

Não transformar a experiência mobile em BI complexo.

---

# 65. ESTADOS DE TELA

Toda tela deve considerar:

```text
Loading
Error
Empty
Success
Offline
PermissionDenied
Refreshing
```

Nunca deixar tela branca.

---

# 66. OFFLINE — PRIMEIRA FASE

Implementar:

- detectar conexão;
- informar offline;
- preservar formulários;
- retry;
- não perder dados digitados.

Não confirmar ações financeiras sem API.

Futuro:

```text
SQLite
Fila de sincronização
Rascunhos offline
Uploads pendentes
Conflitos
Idempotência
```

---

# 67. FOTOS

Permitir:

- câmera;
- galeria;
- preview;
- compressão;
- upload;
- progresso;
- retry.

Relacionar ao contexto correto:

```text
cliente
orçamento
medição
serviço
etapa
```

A API valida tenant.

---

# 68. COMPONENTES REUTILIZÁVEIS

Criar:

```text
AppButton
AppInput
PasswordInput
CurrencyInput
DateInput
DateRangeInput
QuantityInput
AppCard
StatCard
StatusBadge
ScreenContainer
KeyboardScreen
LoadingState
EmptyState
ErrorState
OfflineBanner
CompanyLogo
CompanySelector
PermissionGate
ConfirmDialog
AppSnackbar
PhotoPicker
FilePreview
PaymentSummary
MaterialResultCard
QuoteSummaryCard
ServiceSummaryCard
DeadlineCard
Timeline
ScheduleCard
QuickActionButton
SectionCard
```

---

# 69. DESIGN SYSTEM

Padrão visual:

```text
Azul principal: #2563EB
Azul escuro: #1E40AF
Cinza fundo: #F3F4F6
Cinza texto: #6B7280
Texto: #111827
Verde sucesso: #10B981
Amarelo atenção: #F59E0B
Vermelho: #EF4444
Branco: #FFFFFF
```

Tipografia:

```text
Inter
```

ou equivalente adequada.

Princípios:

- simples;
- moderno;
- profissional;
- poucos elementos por tela;
- cards;
- espaçamento amplo;
- grandes áreas de toque;
- linguagem cotidiana;
- evitar jargão técnico desnecessário.

---

# 70. RESPONSIVIDADE

Testar pelo menos:

```text
320px
360px
390px
412px
430px
```

Usar Safe Area.

Evitar largura fixa.

---

# 71. ACESSIBILIDADE

Obrigatório:

- contraste;
- labels;
- tamanho de toque;
- leitor de tela;
- foco;
- mensagens claras;
- não depender apenas de cor.

---

# 72. FORMULÁRIOS

Usar:

```text
React Hook Form + Zod
```

Todos devem:

- validar;
- mostrar erros próximos ao campo;
- impedir envio duplicado;
- preservar valores;
- mostrar loading;
- mostrar sucesso/erro.

---

# 73. TANSTACK QUERY

Chaves devem incluir tenant:

```text
['company', companyId, 'dashboard']
['company', companyId, 'clients']
['company', companyId, 'quotes']
['company', companyId, 'services']
['company', companyId, 'schedule']
['company', companyId, 'payments']
['company', companyId, 'expenses']
['company', companyId, 'inventory']
```

---

# 74. ERROS DA API

Tratar:

```text
401
402
403
409
422
429
500
```

Exemplo:

```text
401 → refresh/login
402 → acesso suspenso
403 → sem permissão
409 → conflito
422 → validação
429 → limite
500 → erro inesperado
```

---

# 75. ESTRUTURA DO PROJETO

```text
smartgesso-mobile/
├── app/
│   ├── (auth)/
│   ├── (company)/
│   └── (app)/
├── src/
│   ├── components/
│   ├── features/
│   ├── services/
│   ├── hooks/
│   ├── store/
│   ├── theme/
│   ├── validation/
│   ├── types/
│   └── utils/
├── assets/
├── docs/
├── .env.example
├── AGENTS.md
├── app.config.ts
├── eas.json
├── package.json
└── README.md
```

---

# 76. FEATURES REVISADAS

Remover `projects/` como feature principal exposta ao usuário.

Usar:

```text
features/
├── auth/
├── companies/
├── clients/
├── quotes/
├── measurements/
├── material-calculation/
├── services/
├── schedule/
├── production/
├── payments/
├── expenses/
├── inventory/
├── reports/
└── users/
```

---

# 77. TELAS PRINCIPAIS REVISADAS

Implementar:

1. Splash
2. Login
3. Recuperação de senha
4. Seleção de empresa
5. Acesso suspenso
6. Dashboard
7. Menu Novo
8. Clientes
9. Novo cliente
10. Perfil do cliente
11. Lista de orçamentos
12. Novo orçamento — cliente
13. Novo orçamento — local
14. Novo orçamento — medição
15. Novo orçamento — serviço/material
16. Novo orçamento — valores
17. Novo orçamento — prazo
18. Novo orçamento — pagamento
19. Novo orçamento — revisão
20. Detalhe do orçamento
21. PDF do orçamento
22. Aprovação do orçamento
23. Criar/planejar serviço aprovado
24. Lista de serviços
25. Detalhe do serviço
26. Agenda
27. Checklist
28. Fotos
29. Produção
30. Registrar pagamento
31. Financeiro
32. Nova despesa
33. Despesas
34. Estoque
35. Detalhe do material
36. Relatórios
37. Usuários
38. Perfil da empresa
39. Perfil do usuário
40. Configurações
41. Notificações
42. Ajuda e suporte

---

# 78. DASHBOARD — AÇÕES RÁPIDAS

Ações recomendadas:

```text
Novo orçamento
Agendar visita
Registrar pagamento
Nova despesa
```

Evitar excesso de atalhos.

---

# 79. NOTIFICAÇÕES

Preparar para:

- orçamento vencendo;
- orçamento aguardando resposta;
- visita hoje;
- serviço amanhã;
- entrega próxima;
- serviço atrasado;
- pagamento vencendo;
- pagamento vencido;
- estoque baixo.

---

# 80. TESTES OBRIGATÓRIOS

### Autenticação
- login;
- logout;
- refresh;
- sessão inválida.

### Multiempresa
- seleção;
- troca;
- limpeza de cache;
- ausência de vazamento.

### Cliente
- cadastro rápido;
- cadastro completo;
- busca.

### Orçamento
- wizard;
- medição;
- cálculo;
- valores;
- prazo;
- pagamento;
- PDF;
- aprovação;
- rejeição;
- vencimento.

### Conversão
- orçamento aprovado cria Serviço;
- dados são reaproveitados;
- orçamento histórico permanece.

### Serviço
- agenda;
- status;
- prazo;
- checklist;
- fotos;
- conclusão.

### Financeiro
- pagamento parcial;
- pagamento total;
- saldo;
- despesa vinculada.

### Permissões
- visibilidade;
- ações negadas;
- custos/margens.

---

# 81. PROIBIÇÃO DE MOCKS EM PRODUÇÃO

Mocks somente em:

```text
tests
fixtures explícitas de desenvolvimento
storybook quando aplicável
```

Nunca apresentar dados fictícios como reais.

---

# 82. README

Documentar:

- arquitetura;
- stack;
- instalação;
- API;
- variáveis;
- ambientes;
- Expo;
- Android;
- testes;
- OpenAPI;
- SecureStore;
- EAS;
- fluxo Orçamento → Serviço.

---

# 83. AGENTS.MD

Registrar:

- ler skills;
- delegar tarefas;
- não acessar MySQL;
- não colocar segredos no app;
- não armazenar token inseguramente;
- não confiar em companyId do cliente;
- limpar cache ao trocar empresa;
- respeitar Orçamento → Serviço;
- não reintroduzir “Obra” como fluxo principal;
- executar testes;
- revisar segurança;
- não declarar sucesso sem evidência.

---

# 84. DEFINITION OF DONE

Uma feature só está concluída quando:

- tela existe;
- navegação funciona;
- loading funciona;
- error funciona;
- empty funciona;
- offline funciona quando pertinente;
- API integrada;
- permissões aplicadas;
- testes passam;
- TypeScript passa;
- lint passa;
- fluxo foi validado.

---

# 85. VALIDAÇÃO FINAL

Executar:

```bash
npm run lint
npm run typecheck
npm run test
npx expo-doctor
```

Validar build/execução Android conforme configuração do projeto.

Não afirmar funcionamento sem evidência.

---

# 86. RELATÓRIO FINAL

Entregar:

1. skills utilizadas;
2. agentes utilizados;
3. tarefas delegadas;
4. arquitetura;
5. dependências;
6. telas implementadas;
7. fluxos;
8. endpoints;
9. testes;
10. resultados;
11. problemas encontrados;
12. correções;
13. pendências;
14. próximos passos.

---

# 87. REGRAS ABSOLUTAS

Nunca:

- conectar o app diretamente ao MySQL;
- incluir `DATABASE_URL`;
- expor segredos;
- guardar token sensível em AsyncStorage;
- confiar em companyId enviado pelo cliente;
- mostrar dados de outra empresa;
- misturar assinatura SmartGesso com recebimento de cliente;
- reintroduzir “Obra” como conceito obrigatório da interface;
- obrigar criação manual de Serviço após orçamento aprovado sem reaproveitamento;
- pedir novamente dados já coletados;
- calcular materiais oficiais somente no frontend;
- gerar documento oficial apenas no mobile;
- ignorar permissões;
- inventar dados;
- remover testes para fazê-los passar;
- declarar sucesso sem validação.

---

# 88. ORDEM DE EXECUÇÃO

```text
1. Ler este documento integralmente
2. Inventariar skills
3. Inventariar agentes
4. Inspecionar projeto atual
5. Comparar implementação atual com este V3
6. Mapear telas antigas que usam “Obra”
7. Planejar migração UX para Orçamento → Serviço
8. Verificar ambiente
9. Criar plano
10. Delegar tarefas
11. Ajustar design system
12. Ajustar navegação principal
13. Ajustar menu Novo
14. Implementar autenticação
15. Implementar empresa ativa
16. Implementar dashboard revisado
17. Implementar clientes
18. Implementar cadastro rápido contextual
19. Implementar orçamento
20. Implementar local dentro do orçamento
21. Implementar medição dentro do orçamento
22. Implementar cálculo de materiais
23. Implementar valores
24. Implementar prazos
25. Implementar pagamento planejado
26. Implementar revisão/PDF
27. Implementar aprovação
28. Implementar conversão Orçamento → Serviço
29. Implementar Serviço central
30. Implementar agenda
31. Implementar etapas/checklist/fotos
32. Implementar produção opcional
33. Implementar pagamentos contextuais
34. Implementar despesas contextuais
35. Implementar financeiro consolidado
36. Implementar estoque
37. Implementar relatórios
38. Implementar notificações
39. Implementar permissões
40. Implementar testes
41. Revisar multiempresa
42. Revisar segurança
43. Revisar UX
44. Executar lint
45. Executar typecheck
46. Executar testes
47. Executar Expo Doctor
48. Validar Android
49. Documentar
50. Entregar relatório final
```

---

# 89. RESULTADO ESPERADO

O aplicativo final deve ser percebido pelo usuário assim:

```text
PRECISO PASSAR UM PREÇO
        ↓
NOVO ORÇAMENTO
        ↓
CLIENTE + MEDIÇÃO + VALOR + PRAZO
        ↓
ENVIAR
        ↓
CLIENTE APROVOU?
        ↓
SIM
        ↓
CRIAR SERVIÇO
        ↓
AGENDAR / EXECUTAR
        ↓
REGISTRAR PAGAMENTOS E DESPESAS
        ↓
CONCLUIR
        ↓
VER RESULTADO
```

O usuário não deve sentir que está alimentando vários módulos independentes.

A complexidade deve existir no backend quando necessária, não na jornada principal do gesseiro.

---

# 90. PRINCÍPIO FINAL DE PRODUTO

O SmartGesso deve permitir que uma pessoa com baixa familiaridade tecnológica consiga:

```text
1. cadastrar ou selecionar um cliente;
2. medir;
3. gerar um orçamento;
4. informar quando consegue executar;
5. enviar o orçamento;
6. aprovar;
7. transformar em serviço sem digitar tudo novamente;
8. acompanhar o prazo;
9. registrar o que recebeu e gastou;
10. concluir;
11. saber quanto ganhou.
```

Essa simplicidade é requisito de produto, não apenas preferência visual.
