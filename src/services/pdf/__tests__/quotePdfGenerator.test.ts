import { generateQuoteHtml } from '../quotePdfGenerator';
import type { Quote } from '../../../types/quote';

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn().mockResolvedValue({
    uri: 'file:///mock/quote.pdf',
    numberOfPages: 1,
  }),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('Quote PDF Generator', () => {
  const mockQuote: Quote = {
    id: 'quote-123',
    companyId: 'company-1',
    clientId: 'client-1',
    quoteNumber: 101,
    version: 1,
    status: 'ENVIADO',
    subtotal: 3500,
    discount: 200,
    marginPct: 10,
    total: 3300,
    paymentMethod: 'AVISTA_DESCONTO',
    validUntil: '2026-09-10',
    endDate: '2026-08-30',
    observations: 'Instalação com materiais inclusos',
    items: [
      {
        id: 'item-1',
        itemType: 'SERVICO',
        name: 'Forro Drywall F530 com rebaixo',
        quantity: 20,
        unit: 'm²',
        unitPrice: 100,
        total: 2000,
      },
    ],
    history: [],
    createdAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-08-25T10:00:00.000Z',
    client: {
      id: 'client-1',
      name: 'João Silva',
      document: '123.456.789-00',
    },
  };

  const mockCompany = {
    name: 'Gesso Arte Decorações',
    document: '12.345.678/0001-90',
    phone: '(11) 98888-7777',
    email: 'contato@gessoearte.com',
  };

  const mockClientDetails = {
    name: 'João Silva',
    phone: '(11) 99999-8888',
    email: 'joao@email.com',
    document: '123.456.789-00',
  };

  it('deve gerar o HTML completo com dados da empresa, cliente e orçamento', () => {
    const html = generateQuoteHtml(mockQuote, mockCompany, mockClientDetails);

    expect(html).toContain('Gesso Arte Decorações');
    expect(html).toContain('João Silva');
    expect(html).toContain('Forro Drywall F530');
    expect(html).toContain('PROPOSTA COMERCIAL');
    expect(html).toContain('3.300,00');
  });

  it('deve incluir as condições de pagamento e prazos formatados', () => {
    const html = generateQuoteHtml(mockQuote, mockCompany, mockClientDetails);

    expect(html).toContain('À vista com desconto');
    expect(html).toContain('30/08/2026');
  });
});
