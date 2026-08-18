# Design System — SmartGesso Mobile

Documentação completa do design system, tokens visuais e componentes UI.

---

## Índice

- [Visão Geral](#visão-geral)
- [Tokens de Tema](#tokens-de-tema)
- [Componentes UI](#componentes-ui)
- [Padrões de Uso](#padrões-de-uso)

---

## Visão Geral

O SmartGesso Mobile utiliza um design system próprio com tokens centralizados para garantir consistência visual em todo o aplicativo.

### Estrutura

```
src/theme/
├── index.ts          # Barrel exports
├── colors.ts         # Tokens de cor
├── typography.ts     # Tokens de tipografia
├── spacing.ts        # Tokens de espaçamento
├── sizes.ts          # Tokens de tamanho
├── borders.ts        # Tokens de borda
├── radius.ts         # Tokens de raio
└── shadows.ts        # Tokens de sombra
```

---

## Tokens de Tema

### Cores (`colors.ts`)

```typescript
export const colors = {
  // Marca
  primary: '#0B5ED7',
  primaryDark: '#084298',
  primaryLight: '#3D8BFD',

  // Secundária / destaque
  secondary: '#F59E0B',
  secondaryDark: '#B45309',
  secondaryLight: '#FBBF24',

  // Semânticos
  success: '#16A34A',
  danger: '#DC2626',
  error: '#DC2626',  // Alias de compatibilidade
  warning: '#D97706',
  info: '#0B5ED7',

  // Fundos e superfícies
  background: '#F7F9FC',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Texto
  text: '#172033',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Bordas e divisores
  border: '#E2E8F0',
  divider: '#EEF2F7',

  // Inputs
  inputBackground: '#F1F5F9',
  inputBorder: '#E2E8F0',
  inputFocus: '#0B5ED7',

  // Estados desabilitados
  disabled: '#CBD5E1',
  disabledBackground: '#E2E8F0',
  disabledText: '#94A3B8',

  // Utilitários
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(23, 32, 51, 0.55)',
} as const;
```

#### Paleta de Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `primary` | `#0B5ED7` | Cor principal da marca |
| `primaryDark` | `#084298` | Hover/pressed do primary |
| `primaryLight` | `#3D8BFD` | Backgrounds leves |
| `secondary` | `#F59E0B` | Destaques, badges |
| `success` | `#16A34A` | Sucesso, status positivo |
| `danger` | `#DC2626` | Erros, exclusões |
| `warning` | `#D97706` | Avisos, atenção |
| `background` | `#F7F9FC` | Fundo geral |
| `surface` | `#FFFFFF` | Cards, superfícies |
| `text` | `#172033` | Texto principal |

---

### Tipografia (`typography.ts`)

```typescript
import { Platform } from 'react-native';

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
} as const;
```

#### Escala de Tipografia

| Token | Tamanho | Uso |
|-------|---------|-----|
| `xs` | 12px | Legendas, notas |
| `sm` | 14px | Texto secundário |
| `md` | 16px | Texto corpo (padrão) |
| `lg` | 18px | Subtítulos |
| `xl` | 22px | Títulos de seção |
| `2xl` | 28px | Títulos principais |

#### Pesos

| Token | Valor | Uso |
|-------|-------|-----|
| `regular` | 400 | Texto corpo |
| `medium` | 500 | Labels, ênfase leve |
| `semibold` | 600 | Subtítulos |
| `bold` | 700 | Títulos, botões |

---

### Espaçamento (`spacing.ts`)

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;
```

#### Escala de Espaçamento (Base 4)

| Token | Valor | Uso |
|-------|-------|-----|
| `xs` | 4px | Espaçamento mínimo |
| `sm` | 8px | Entre elementos pequenos |
| `md` | 12px | Padding interno padrão |
| `lg` | 16px | Entre seções |
| `xl` | 20px | Margens externas |
| `2xl` | 24px | Padding de cards |
| `3xl` | 32px | Seções principais |
| `4xl` | 40px | Margens de tela |
| `5xl` | 48px | Espaçamento generoso |

---

### Tamanhos (`sizes.ts`)

> 📝 **PENDENTE:** Definir tokens de tamanho (ícones, botões, etc.)

```typescript
export const sizes = {
  // Ícones
  iconSm: 16,
  iconMd: 24,
  iconLg: 32,
  
  // Botões
  buttonHeight: 48,
  buttonHeightSm: 36,
  buttonHeightLg: 56,
  
  // Inputs
  inputHeight: 48,
  inputHeightSm: 36,
  
  // Avatar
  avatarSm: 32,
  avatarMd: 48,
  avatarLg: 64,
} as const;
```

---

### Bordas (`borders.ts`)

```typescript
export const borders = {
  width: {
    none: 0,
    thin: 1,
    medium: 2,
    thick: 3,
  },
  style: 'solid',
} as const;
```

#### Larguras de Borda

| Token | Valor | Uso |
|-------|-------|-----|
| `none` | 0 | Sem borda |
| `thin` | 1px | Bordas leves |
| `medium` | 2px | Bordas padrão |
| `thick` | 3px | Bordas destacadas |

---

### Raios (`radius.ts`)

```typescript
export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;
```

#### Raios de Borda

| Token | Valor | Uso |
|-------|-------|-----|
| `none` | 0 | Sem arredondamento |
| `sm` | 4px | Bordas leves |
| `md` | 8px | Cards, inputs |
| `lg` | 12px | Botões grandes |
| `xl` | 16px | Cards grandes |
| `2xl` | 24px | Modais |
| `full` | 9999px | Avatares, pills |

---

### Sombras (`shadows.ts`)

```typescript
import { Platform } from 'react-native';

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
  }),
} as const;
```

#### Níveis de Sombra

| Token | iOS | Android | Uso |
|-------|-----|---------|-----|
| `sm` | shadowRadius: 2 | elevation: 1 | Cards leves |
| `md` | shadowRadius: 4 | elevation: 3 | Cards padrão |
| `lg` | shadowRadius: 8 | elevation: 6 | Modais, dropdowns |

---

## Componentes UI

### AppButton

```typescript
interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}
```

**Uso:**
```tsx
<AppButton
  title="Salvar"
  onPress={handleSave}
  variant="primary"
  loading={isSaving}
/>
```

---

### AppInput

```typescript
interface AppInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  disabled?: boolean;
}
```

**Uso:**
```tsx
<AppInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  placeholder="seu@email.com"
  keyboardType="email-address"
  error={errors.email?.message}
/>
```

---

### AppCard

```typescript
interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}
```

**Uso:**
```tsx
<AppCard onPress={() => navigateToDetails(item.id)}>
  <Text>{item.name}</Text>
</AppCard>
```

---

### LoadingState

```typescript
interface LoadingStateProps {
  message?: string;
}
```

**Uso:**
```tsx
<LoadingState message="Carregando clientes..." />
```

---

### EmptyState

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}
```

**Uso:**
```tsx
<EmptyState
  title="Nenhum cliente encontrado"
  description="Adicione seu primeiro cliente para começar"
  action={{
    label: "Novo Cliente",
    onPress: () => navigateToNewClient(),
  }}
/>
```

---

### ErrorState

```typescript
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}
```

**Uso:**
```tsx
<ErrorState
  message="Erro ao carregar dados"
  onRetry={() => refetch()}
/>
```

---

### StatusBadge

```typescript
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  label?: string;
}
```

**Uso:**
```tsx
<StatusBadge status="active" />
```

---

### ConfirmDialog

```typescript
interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default';
}
```

**Uso:**
```tsx
<ConfirmDialog
  visible={showDeleteConfirm}
  title="Excluir cliente"
  message="Tem certeza que deseja excluir este cliente?"
  confirmLabel="Excluir"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={() => setShowDeleteConfirm(false)}
/>
```

---

### OfflineBanner

```typescript
// Exibe banner quando offline
// Sem props — detecta estado automaticamente
```

**Uso:**
```tsx
<OfflineBanner />
```

---

### PermissionGate

```typescript
interface PermissionGateProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**Uso:**
```tsx
<PermissionGate permission="clients.create">
  <AppButton title="Novo Cliente" onPress={handleNewClient} />
</PermissionGate>
```

---

### ScreenContainer

```typescript
interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: boolean;
}
```

**Uso:**
```tsx
<ScreenContainer scrollable padding>
  <Text>Conteúdo da tela</Text>
</ScreenContainer>
```

---

### AppSnackbar

```typescript
interface AppSnackbarProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onDismiss?: () => void;
}
```

**Uso:**
```tsx
<AppSnackbar
  visible={showSnackbar}
  message="Cliente salvo com sucesso!"
  type="success"
  onDismiss={() => setShowSnackbar(false)}
/>
```

---

### PasswordInput

```typescript
interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}
```

**Uso:**
```tsx
<PasswordInput
  label="Senha"
  value={password}
  onChangeText={setPassword}
  error={errors.password?.message}
/>
```

---

## Padrões de Uso

### 1. Importação de Tema

```typescript
import { colors, typography, spacing, radius, shadows } from '@/theme';

// Ou de uma vez
import { theme } from '@/theme';
```

### 2. Estilos com StyleSheet

```typescript
import { StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadows.md,
  },
});
```

### 3. Uso de Componentes

```tsx
import { AppButton, AppInput, AppCard } from '@/components/ui';

export function ClientForm() {
  return (
    <ScreenContainer scrollable padding>
      <AppInput
        label="Nome"
        value={name}
        onChangeText={setName}
      />
      
      <AppInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      
      <AppCard>
        <Text>Informações adicionais</Text>
      </AppCard>
      
      <AppButton
        title="Salvar"
        onPress={handleSave}
        loading={isSaving}
      />
    </ScreenContainer>
  );
}
```

### 4. Estados de UI

```tsx
// Loading
{isLoading && <LoadingState message="Carregando..." />}

// Erro
{error && <ErrorState message={error.message} onRetry={refetch} />}

// Vazio
{data.length === 0 && (
  <EmptyState
    title="Nenhum item encontrado"
    action={{ label: "Novo", onPress: handleNew }}
  />
)}

// Dados
{data.map(item => (
  <AppCard key={item.id}>
    <Text>{item.name}</Text>
  </AppCard>
))}
```

### 5. Acessibilidade

```tsx
// Labels em inputs
<AppInput label="Email" />

// Botões com acessibilidade
<AppButton
  title="Salvar"
  accessibilityLabel="Salvar formulário"
/>

// Contraste adequado
// cores.text = '#17233' sobre colors.background = '#F7F9FC'
// Ratio: 12.5:1 (WCAG AAA)
```

### 6. Responsividade

```typescript
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Usar porcentagens ou flexbox
const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400, // Limitar largura em tablets
  },
});
```

---

## Boas Práticas

### ✅ Fazer

- Usar tokens do tema (nunca valores hardcoded)
- Manter consistência visual
- Testar contraste (WCAG AA mínimo)
- Usar componentes reutilizáveis
- Documentar novos componentes

### ❌ Não Fazer

- Misturar fontes diferentes
- Usar cores hardcoded
- Criar componentes duplicados
- Ignorar estados (loading, error, empty)
- Comprometer acessibilidade

---

## Próximos Passos

1. ✅ Tokens de tema definidos
2. ✅ Componentes UI básicos criados
3. 🔄 Adicionar mais componentes (Table, DatePicker, etc.)
4. 🔄 Criar storybook para documentação visual
5. 🔄 Implementar temas escuro (futuro)
6. 🔄 Testes visuais automatizados
7. 🔄 Documentação interativa

---

**Documento:** DESIGN_SYSTEM.md  
**Última atualização:** Agosto 2026  
**Projeto:** SmartGesso Mobile