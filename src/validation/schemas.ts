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

const clientAddressSchema = z.object({
  zipCode: z.string().trim().optional(),
  street: z.string().trim().optional(),
  number: z.string().trim().optional(),
  complement: z.string().trim().optional(),
  neighborhood: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
});

export const createClientSchema = z.object({
  type: z.enum(['FISICA', 'JURIDICA']).default('FISICA'),
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  document: z.string().trim().optional(),
  email: z.string().trim().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  address: clientAddressSchema.optional(),
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

/** Endereço livre do local do serviço (V3 — não exige obra vinculada). */
const quoteLocalAddressSchema = z.object({
  cep: z.string().trim().optional(),
  rua: z.string().trim().optional(),
  numero: z.string().trim().optional(),
  complemento: z.string().trim().optional(),
  bairro: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  estado: z.string().trim().optional(),
  referencia: z.string().trim().optional(),
});

/** Data no formato AAAA-MM-DD (padrão usado nas telas do app). */
const isoDateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use AAAA-MM-DD)');

export const createQuoteSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  workId: z.string().optional(),
  localAddress: quoteLocalAddressSchema.optional(),
  startDate: isoDateField.optional(),
  durationDays: z.coerce.number().int('Prazo deve ser em dias inteiros').min(1, 'Prazo deve ser maior que 0').optional(),
  endDate: isoDateField.optional(),
  deadlineDate: isoDateField.optional(),
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

// ─── Ordens de Serviço (Fase 5) ────────────────────────────────────────────

export const createServiceOrderSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  workId: z.string().min(1, 'Obra é obrigatória'),
  scheduledDate: z.string().optional(),
  observations: z.string().trim().optional(),
  materials: z
    .array(
      z.object({
        materialName: z.string().trim().min(1),
        quantity: z.coerce.number().min(0),
        unit: z.string().trim().default('un'),
      }),
    )
    .optional(),
});

export type CreateServiceOrderFormData = z.infer<typeof createServiceOrderSchema>;

// ─── Ordens de Produção (Fase 5) ──────────────────────────────────────────

export const createProductionOrderSchema = z.object({
  clientId: z.string().optional(),
  workId: z.string().optional(),
  dueDate: z.string().optional(),
  responsiblePerson: z.string().trim().optional(),
  observations: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productName: z.string().trim().min(1, 'Nome do produto é obrigatório'),
        quantity: z.coerce.number().min(0.01),
        unit: z.string().trim().default('un'),
      }),
    )
    .min(1, 'Adicione pelo menos 1 item'),
});

export type CreateProductionOrderFormData = z.infer<typeof createProductionOrderSchema>;

// ─── Financeiro (Fase 6) ───────────────────────────────────────────────────

export const createPaymentSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  quoteId: z.string().optional(),
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que 0'),
  paymentMethod: z.enum([
    'DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO',
    'BOLETO', 'TRANSFERENCIA', 'CHEQUE', 'OUTRO',
  ]).default('PIX'),
  paymentDate: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().trim().optional(),
});

export type CreatePaymentFormData = z.infer<typeof createPaymentSchema>;

export const createExpenseSchema = z.object({
  category: z.enum([
    'MATERIAL', 'MAO_DE_OBRA', 'TRANSPORTE', 'ALUGUEL', 'ENERGIA',
    'AGUA', 'INTERNET', 'TELEFONE', 'MARKETING', 'IMPOSTOS', 'OUTROS',
  ]).default('OUTROS'),
  description: z.string().trim().min(1, 'Descrição é obrigatória'),
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que 0'),
  expenseDate: z.string().optional(),
  observations: z.string().trim().optional(),
  /** Ordem de serviço vinculada (V3 — despesa contextual dentro do serviço). */
  serviceOrderId: z.string().optional(),
});

export type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;

// ─── Configurações (Fase 7) ─────────────────────────────────────────────────

export const companySettingsSchema = z.object({
  tradeName: z.string().trim().min(1, 'Nome fantasia é obrigatório'),
  document: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email('E-mail inválido').optional().or(z.literal('')),
  address: z.object({
    zipCode: z.string().trim().optional(),
    street: z.string().trim().optional(),
    number: z.string().trim().optional(),
    complement: z.string().trim().optional(),
    neighborhood: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
  }),
});

export type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;

export const quoteSettingsSchema = z.object({
  numberingPrefix: z
    .string()
    .trim()
    .min(1, 'Prefixo é obrigatório')
    .max(10, 'Máximo de 10 caracteres'),
  defaultLossPct: z.coerce
    .number()
    .min(0, 'Perda não pode ser negativa')
    .max(100, 'Perda máxima de 100%'),
  warrantyDays: z.coerce
    .number()
    .int('Use números inteiros')
    .min(0, 'Garantia não pode ser negativa'),
  paymentMethods: z
    .array(
      z.enum([
        'AVISTA',
        'AVISTA_DESCONTO',
        'ENTRADA_SALDO',
        'QUINZENAL_2X',
        'MENSAL',
        'PARCELADO',
        'PERSONALIZADO',
      ])
    )
    .min(1, 'Selecione pelo menos uma forma de pagamento'),
});

export type QuoteSettingsFormData = z.infer<typeof quoteSettingsSchema>;

// ─── Estoque / Movimentos (V3) ──────────────────────────────────────────────

export const createInventoryMovementSchema = z
  .object({
    materialId: z.string().min(1, 'Material é obrigatório'),
    type: z.enum([
      'ENTRADA',
      'SAIDA',
      'RESERVA',
      'CONSUMO',
      'PERDA',
      'AJUSTE',
      'RETORNO',
    ]),
    /** Para AJUSTE, a quantidade é o valor FINAL do estoque (pode ser 0). */
    quantity: z.coerce.number().min(0, 'Quantidade não pode ser negativa'),
    serviceOrderId: z.string().optional(),
    notes: z.string().trim().optional(),
  })
  .refine(
    (data) => data.type === 'AJUSTE' || data.quantity > 0,
    { path: ['quantity'], message: 'Quantidade deve ser maior que zero' },
  );

export type CreateInventoryMovementFormData = z.infer<
  typeof createInventoryMovementSchema
>;

// ─── Convite de membro da empresa (V3 §57) ──────────────────────────────────

export const inviteMemberSchema = z.object({
  email: emailField,
  role: z.enum([
    'COMPANY_OWNER',
    'MANAGER',
    'SALES',
    'FINANCE',
    'INSTALLER',
    'PRODUCTION',
  ]),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
