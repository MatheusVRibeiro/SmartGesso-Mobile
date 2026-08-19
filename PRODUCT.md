# SmartGesso Mobile

## Product
Gestão completa para gesseiros e empreiteiros de drywall: clientes, obras, medições, composições de materiais, orçamentos com PDF, ordens de serviço, produção, pagamentos e despesas — tudo no celular, na obra.

## Users
Gesseiros e pequenos empreiteiros (1–10 funcionários). Usam o app no celular, dentro da obra, com luz variável e mãos sujas de pó. Precisam de leitura rápida, botões grandes, contraste forte e fluxos curtos. Não são "power users" de tecnologia — a interface precisa ser óbvia.

## Platform
adaptive (React Native / Expo — Android + iOS + web preview)

## Register
product — app UI, design SERVE o produto (gestão de dados, não vitrine)

## Mood
"Obra profissional — indigo de confiança sobre concreto claro, energia de trabalho, sem firula"

## Color strategy
Restrained: neutros azulados (chroma baixo) + um accent indigo ≤10% + verde para sucesso financeiro. Fundo off-white neutro (chroma 0), NUNCA cream/sand.

## Physical scene
Gesseiro às 7h da manhã, sol entrando na obra, celular na mão com luvas de trabalho. Precisa ver "quanto tenho a receber" em 2 segundos, sem apertar os olhos. Contraste alto, tipografia grande, cores que não desbotam no sol.

## Design principles
1. Contraste ≥4.5:1 em todo texto (nada de cinza-claro "elegante")
2. Hierarquia clara: 1 ação primária por tela, botões grandes (touch target ≥44px)
3. Cards com borda sutil + sombra leve (nunca gradiente)
4. Empty states instrutivos (ícone + o que fazer), nunca "em desenvolvimento"
5. Status sempre visíveis: badge de cor + texto (não só cor)
6. Formatação brasileira: R$, datas pt-BR