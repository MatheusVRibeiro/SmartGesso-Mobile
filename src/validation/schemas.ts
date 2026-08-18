import { z } from 'zod';

// ─── Shared primitives ──────────────────────────────────────────────────────

const emailField = z
  .string()
  .trim()
  .min(1, 'E-mail é obrigatório')
  .email('E-mail inválido');

const passwordField = z
  .string()
  .min(6, 'A senha deve ter no mínimo 6 caracteres');

const confirmPasswordField = z.string().min(1, 'Confirmação de senha é obrigatória');

// ─── Login ──────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ─── Forgot password ────────────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ─── Reset password ─────────────────────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: passwordField,
    confirmPassword: confirmPasswordField,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ─── Accept invitation ──────────────────────────────────────────────────────

export const acceptInvitationSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: passwordField,
    confirmPassword: confirmPasswordField,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

export type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;

// ─── Clientes (Fase 2) ─────────────────────────────────────────────────────

export const createClientSchema = z.object({
  type: z.enum(['FISICA', 'JURIDICA']).default('FISICA'),
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  document: z.string().trim().optional(),
  email: z.string().trim().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  observations: z.string().trim().optional(),
});

export type CreateClientFormData = z.infer<typeof createClientSchema>;

// ─── Obras (Fase 2) ────────────────────────────────────────────────────────

export const createWorkSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  name: z.string().trim().min(1, 'Nome da obra é obrigatório'),
  reference: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  street: z.string().trim().optional(),
  number: z.string().trim().optional(),
  complement: z.string().trim().optional(),
  district: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  status: z.enum(['PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA']).default('PLANEJADA'),
  observations: z.string().trim().optional(),
});

export type CreateWorkFormData = z.infer<typeof createWorkSchema>;

// ─── Catálogo (Fase 2) ─────────────────────────────────────────────────────

export const createCatalogItemSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  description: z.string().trim().optional(),
  unit: z.string().trim().min(1, 'Unidade é obrigatória').default('un'),
  price: z.coerce.number().min(0).optional(),
  cost: z.coerce.number().min(0).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export type CreateCatalogItemFormData = z.infer<typeof createCatalogItemSchema>;

export const createMaterialSchema = createCatalogItemSchema.extend({
  stockQty: z.coerce.number().min(0).default(0),
  minStockQty: z.coerce.number().min(0).default(0),
});

export type CreateMaterialFormData = z.infer<typeof createMaterialSchema>;

// ─── Medições (Fase 3) ─────────────────────────────────────────────────────

export const createMeasurementSchema = z.object({
  environmentName: z.string().trim().min(1, 'Nome do ambiente é obrigatório'),
  applicationType: z
    .enum(['DRYWALL', 'FORRO', 'PAREDE', 'SANCA', 'REBAIXAMENTO', 'OUTRO'])
    .default('DRYWALL'),
  length: z.coerce.number().min(0).optional(),
  width: z.coerce.number().min(0).optional(),
  ceilingHeight: z.coerce.number().min(0).optional(),
  doors: z.coerce.number().int().min(0).default(0),
  windows: z.coerce.number().int().min(0).default(0),
  cutouts: z.coerce.number().int().min(0).default(0),
  fixtures: z.coerce.number().int().min(0).default(0),
  hasCove: z.boolean().default(false),
  hasDropCeiling: z.boolean().default(false),
  observations: z.string().trim().optional(),
});

export type CreateMeasurementFormData = z.infer<typeof createMeasurementSchema>;

// ─── Orçamentos (Fase 4) ───────────────────────────────────────────────────

export const quoteItemSchema = z.object({
  itemType: z.enum(['PRODUTO', 'SERVICO', 'MATERIAL', 'MAO_DE_OBRA', 'TRANSPORTE']),
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  description: z.string().trim().optional(),
  quantity: z.coerce.number().min(0.01, 'Quantidade deve ser maior que 0'),
  unit: z.string().trim().default('un'),
  unitPrice: z.coerce.number().min(0, 'Preço deve ser maior ou igual a 0'),
});

export const createQuoteSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  workId: z.string().optional(),
  discount: z.coerce.number().min(0).default(0),
  marginPct: z.coerce.number().min(0).max(100).default(0),
  paymentMethod: z.enum([
    'AVISTA',
    'AVISTA_DESCONTO',
    'ENTRADA_SALDO',
    'QUINZENAL_2X',
    'MENSAL',
    'PARCELADO',
    'PERSONALIZADO',
  ]).default('AVISTA'),
  observations: z.string().trim().optional(),
  items: z.array(quoteItemSchema).min(1, 'Adicione pelo menos 1 item'),
});

export type CreateQuoteFormData = z.infer<typeof createQuoteSchema>;
