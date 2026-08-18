import {
  createMeasurementSchema,
  createQuoteSchema,
  quoteItemSchema,
  createServiceOrderSchema,
  createProductionOrderSchema,
  createPaymentSchema,
  createExpenseSchema,
} from '../schemas';

describe('schemas fase 2-6', () => {
  describe('createMeasurementSchema', () => {
    it('aceita environmentName válido com dimensões', () => {
      const result = createMeasurementSchema.safeParse({
        environmentName: 'Sala de estar',
        length: 4.5,
        width: 3,
        ceilingHeight: 2.8,
        doors: 1,
        windows: 2,
      });
      expect(result.success).toBe(true);
    });

    it('rejeita environmentName vazio', () => {
      const result = createMeasurementSchema.safeParse({
        environmentName: '   ',
      });
      expect(result.success).toBe(false);
    });

    it('rejeita dimensões negativas', () => {
      const result = createMeasurementSchema.safeParse({
        environmentName: 'Quarto',
        length: -1,
      });
      expect(result.success).toBe(false);
    });

    it('rejeita contagem de aberturas negativa', () => {
      const result = createMeasurementSchema.safeParse({
        environmentName: 'Banheiro',
        doors: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createQuoteSchema', () => {
    it('aceita clientId e items com desconto/margem válidos', () => {
      const result = createQuoteSchema.safeParse({
        clientId: 'client-1',
        discount: 50,
        marginPct: 10,
        items: [
          {
            itemType: 'PRODUTO',
            name: 'Placa de gesso',
            quantity: 10,
            unitPrice: 25.5,
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('rejeita sem clientId', () => {
      const result = createQuoteSchema.safeParse({
        items: [
          { itemType: 'SERVICO', name: 'Instalação', quantity: 1, unitPrice: 100 },
        ],
      });
      expect(result.success).toBe(false);
    });

    it('rejeita items vazio', () => {
      const result = createQuoteSchema.safeParse({
        clientId: 'client-1',
        items: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejeita margem acima de 100%', () => {
      const result = createQuoteSchema.safeParse({
        clientId: 'client-1',
        marginPct: 150,
        items: [
          { itemType: 'PRODUTO', name: 'Placa', quantity: 1, unitPrice: 10 },
        ],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('quoteItemSchema', () => {
    it('aceita item válido', () => {
      const result = quoteItemSchema.safeParse({
        itemType: 'MAO_DE_OBRA',
        name: 'Mão de obra',
        quantity: 2,
        unitPrice: 80,
      });
      expect(result.success).toBe(true);
    });

    it('rejeita quantidade zero', () => {
      const result = quoteItemSchema.safeParse({
        itemType: 'PRODUTO',
        name: 'Placa',
        quantity: 0,
        unitPrice: 10,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createServiceOrderSchema', () => {
    it('aceita clientId/workId com materiais', () => {
      const result = createServiceOrderSchema.safeParse({
        clientId: 'client-1',
        workId: 'work-1',
        materials: [{ materialName: 'Massa corrida', quantity: 5, unit: 'kg' }],
      });
      expect(result.success).toBe(true);
    });

    it('rejeita sem workId', () => {
      const result = createServiceOrderSchema.safeParse({
        clientId: 'client-1',
      });
      expect(result.success).toBe(false);
    });

    it('rejeita sem clientId', () => {
      const result = createServiceOrderSchema.safeParse({
        workId: 'work-1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createProductionOrderSchema', () => {
    it('aceita items com responsável', () => {
      const result = createProductionOrderSchema.safeParse({
        responsiblePerson: 'João',
        items: [{ productName: 'Chapas 12mm', quantity: 20, unit: 'un' }],
      });
      expect(result.success).toBe(true);
    });

    it('rejeita items vazio', () => {
      const result = createProductionOrderSchema.safeParse({
        items: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejeita item sem nome do produto', () => {
      const result = createProductionOrderSchema.safeParse({
        items: [{ quantity: 5 }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createPaymentSchema', () => {
    it('aceita amount maior que 0 com PIX', () => {
      const result = createPaymentSchema.safeParse({
        clientId: 'client-1',
        amount: 1500.5,
        paymentMethod: 'PIX',
      });
      expect(result.success).toBe(true);
    });

    it('rejeita amount zero', () => {
      const result = createPaymentSchema.safeParse({
        clientId: 'client-1',
        amount: 0,
      });
      expect(result.success).toBe(false);
    });

    it('rejeita sem clientId', () => {
      const result = createPaymentSchema.safeParse({
        amount: 100,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createExpenseSchema', () => {
    it('aceita description e amount válidos', () => {
      const result = createExpenseSchema.safeParse({
        description: 'Compra de massa corrida',
        amount: 89.9,
        category: 'MATERIAL',
      });
      expect(result.success).toBe(true);
    });

    it('rejeita description vazia', () => {
      const result = createExpenseSchema.safeParse({
        description: '',
        amount: 50,
      });
      expect(result.success).toBe(false);
    });

    it('rejeita amount zero', () => {
      const result = createExpenseSchema.safeParse({
        description: 'Aluguel de andaime',
        amount: 0,
      });
      expect(result.success).toBe(false);
    });
  });
});