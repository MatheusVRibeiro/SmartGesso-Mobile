import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Linking, Platform } from 'react-native';
import type { Quote } from '../../types/quote';
import type { Company, CompanySummary } from '../../types/company';
import type { Client } from '../../types/client';
import { formatCurrency, formatNumber } from '../../utils/format';
import { formatDateBr } from '../../utils/date';

export type FlexibleCompany = Partial<Company> & Partial<CompanySummary> & {
  phone?: string;
  email?: string;
  address?: string | { street?: string; number?: string; city?: string; state?: string };
};

export type FlexibleClient = Partial<Client> & {
  name?: string;
  phone?: string | null;
  email?: string | null;
  document?: string | null;
  address?: string;
};

/**
 * Gera o template HTML profissional do orçamento para conversão em PDF.
 */
export function generateQuoteHtml(
  quote: Quote,
  company?: FlexibleCompany | null,
  client?: FlexibleClient | null
): string {
  const companyName = company?.tradeName || company?.name || 'SmartGesso Soluções em Gesso';
  const companyCnpj = company?.document || company?.cnpj ? `CNPJ: ${company.document || company.cnpj}` : '';
  const companyPhone = company?.phone ? `Tel: ${company.phone}` : '';
  const companyEmail = company?.email ? `Email: ${company.email}` : '';
  const companyAddress = typeof company?.address === 'string'
    ? company.address
    : company?.address
      ? `${company.address.street || ''}, ${company.address.number || ''} - ${company.address.city || ''}/${company.address.state || ''}`
      : '';

  const clientName = client?.name || quote.client?.name || 'Cliente';
  const clientPhone = client?.phone || client?.whatsapp || '';
  const clientEmail = client?.email || '';
  const clientDocument = client?.document || quote.client?.document || '';

  const quoteCode = quote.quoteNumber ? `#${quote.quoteNumber} v${quote.version}` : quote.id.slice(0, 8);
  const quoteDate = quote.createdAt ? formatDateBr(quote.createdAt) : formatDateBr(new Date());
  const expiryDate = quote.validUntil ? formatDateBr(quote.validUntil) : '15 dias a partir da emissão';

  const items = quote.items || [];
  const subtotal = quote.subtotal ?? quote.total;
  const discount = quote.discount ?? 0;
  const total = quote.total;

  const paymentMethodLabel: Record<string, string> = {
    AVISTA: 'À vista',
    AVISTA_DESCONTO: 'À vista com desconto',
    ENTRADA_SALDO: 'Entrada + Saldo na conclusão',
    QUINZENAL_2X: 'Quinzenal em 2x',
    MENSAL: 'Mensal',
    PARCELADO: 'Parcelado',
    PERSONALIZADO: 'Personalizado',
  };

  const paymentMethodStr = quote.paymentMethod
    ? paymentMethodLabel[quote.paymentMethod] || quote.paymentMethod
    : 'A combinar';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Orçamento ${quoteCode} - ${companyName}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #ffffff;
      color: #1e293b;
      padding: 32px;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .company-title {
      font-size: 22px;
      font-weight: 700;
      color: #4f46e5;
      margin-bottom: 4px;
    }
    .company-info {
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
    }
    .quote-badge {
      text-align: right;
    }
    .quote-badge h2 {
      font-size: 20px;
      color: #0f172a;
      font-weight: 700;
    }
    .quote-badge p {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .party-col {
      width: 48%;
    }
    .party-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .party-name {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }
    .party-detail {
      font-size: 11px;
      color: #475569;
      margin-top: 2px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 10px;
      border-left: 3px solid #4f46e5;
      padding-left: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background-color: #f1f5f9;
      color: #475569;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 12px;
      color: #1e293b;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .totals-box {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    .totals-table {
      width: 260px;
    }
    .totals-table td {
      padding: 6px 10px;
    }
    .totals-table .total-row td {
      font-size: 16px;
      font-weight: 700;
      color: #4f46e5;
      border-top: 2px solid #e2e8f0;
      border-bottom: none;
      padding-top: 10px;
    }
    .conditions-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 32px;
    }
    .conditions-row {
      display: flex;
      margin-bottom: 8px;
    }
    .conditions-label {
      width: 160px;
      font-weight: 600;
      color: #475569;
      font-size: 12px;
    }
    .conditions-value {
      flex: 1;
      color: #0f172a;
      font-size: 12px;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 48px;
      padding-top: 16px;
    }
    .signature-line {
      width: 45%;
      border-top: 1px solid #94a3b8;
      text-align: center;
      padding-top: 8px;
      font-size: 11px;
      color: #475569;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div>
      <div class="company-title">${companyName}</div>
      <div class="company-info">
        ${companyCnpj ? `<div>${companyCnpj}</div>` : ''}
        ${companyPhone ? `<div>${companyPhone}</div>` : ''}
        ${companyEmail ? `<div>${companyEmail}</div>` : ''}
        ${companyAddress ? `<div>${companyAddress}</div>` : ''}
      </div>
    </div>
    <div class="quote-badge">
      <h2>PROPOSTA COMERCIAL</h2>
      <p>Orçamento <strong>${quoteCode}</strong></p>
      <p>Data: ${quoteDate}</p>
      <p>Validade: ${expiryDate}</p>
    </div>
  </div>

  <!-- Partes -->
  <div class="parties">
    <div class="party-col">
      <div class="party-label">Cliente / Solicitante</div>
      <div class="party-name">${clientName}</div>
      ${clientDocument ? `<div class="party-detail">Documento: ${clientDocument}</div>` : ''}
      ${clientPhone ? `<div class="party-detail">Telefone: ${clientPhone}</div>` : ''}
      ${clientEmail ? `<div class="party-detail">Email: ${clientEmail}</div>` : ''}
    </div>
    <div class="party-col">
      <div class="party-label">Local de Execução da Obra</div>
      <div class="party-name">${quote.work?.name || 'Local do Cliente'}</div>
      <div class="party-detail">Conforme projeto e alinhamento</div>
    </div>
  </div>

  <!-- Tabela de Itens -->
  <div class="section-title">Discriminação dos Serviços e Materiais</div>
  <table>
    <thead>
      <tr>
        <th style="width: 50%;">Descrição</th>
        <th class="text-center" style="width: 15%;">Tipo</th>
        <th class="text-right" style="width: 15%;">Quantidade</th>
        <th class="text-right" style="width: 20%;">Total (R$)</th>
      </tr>
    </thead>
    <tbody>
      ${
        items.length > 0
          ? items
              .map((item) => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td class="text-center">${item.itemType}</td>
                  <td class="text-right">${formatNumber(item.quantity)} ${item.unit || 'un'}</td>
                  <td class="text-right" style="font-weight: 600;">${formatCurrency(item.total)}</td>
                </tr>`)
              .join('')
          : `
            <tr>
              <td colspan="4" class="text-center" style="color: #64748b; padding: 16px;">
                Serviços gerais de fornecimento e instalação de gesso / drywall
              </td>
            </tr>`
      }
    </tbody>
  </table>

  <!-- Totais -->
  <div class="totals-box">
    <table class="totals-table">
      ${
        discount > 0
          ? `
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">${formatCurrency(subtotal)}</td>
          </tr>
          <tr>
            <td style="color: #16a34a;">Desconto:</td>
            <td class="text-right" style="color: #16a34a;">- ${formatCurrency(discount)}</td>
          </tr>`
          : ''
      }
      <tr class="total-row">
        <td>Valor Total:</td>
        <td class="text-right">${formatCurrency(total)}</td>
      </tr>
    </table>
  </div>

  <!-- Condições Comerciais e Prazos -->
  <div class="section-title">Condições Comerciais e Prazos</div>
  <div class="conditions-card">
    <div class="conditions-row">
      <div class="conditions-label">Forma de Pagamento:</div>
      <div class="conditions-value"><strong>${paymentMethodStr}</strong></div>
    </div>
    ${
      quote.endDate
        ? `
        <div class="conditions-row">
          <div class="conditions-label">Previsão de Conclusão:</div>
          <div class="conditions-value">${formatDateBr(quote.endDate)}</div>
        </div>`
        : ''
    }
    ${
      quote.observations
        ? `
        <div class="conditions-row" style="margin-top: 8px;">
          <div class="conditions-label">Observações:</div>
          <div class="conditions-value">${quote.observations}</div>
        </div>`
        : ''
    }
  </div>

  <!-- Assinaturas -->
  <div class="signatures">
    <div class="signature-line">
      <strong>${companyName}</strong><br>
      Responsável Técnico / Comercial
    </div>
    <div class="signature-line">
      <strong>${clientName}</strong><br>
      De acordo e Aprovação
    </div>
  </div>

  <!-- Rodapé -->
  <div class="footer">
    Documento gerado eletronicamente por SmartGesso Mobile · ${new Date().getFullYear()}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Gera o arquivo PDF e retorna o URI local (ou imprime direto na web).
 */
export async function generateQuotePdfFile(
  quote: Quote,
  company?: FlexibleCompany | null,
  client?: FlexibleClient | null
): Promise<string> {
  const html = generateQuoteHtml(quote, company, client);

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    }
    return '';
  }

  const result = await Print.printToFileAsync({
    html,
    base64: false,
  });
  return result?.uri || '';
}

/**
 * Abre a folha de compartilhamento nativa (WhatsApp, Email, Drive, etc) ou imprime na Web.
 */
export async function shareQuotePdf(
  quote: Quote,
  company?: FlexibleCompany | null,
  client?: FlexibleClient | null
): Promise<void> {
  if (Platform.OS === 'web') {
    await generateQuotePdfFile(quote, company, client);
    return;
  }

  const uri = await generateQuotePdfFile(quote, company, client);
  if (uri) {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Orçamento #${quote.quoteNumber} v${quote.version} - SmartGesso`,
      });
    }
  }
}

/**
 * Abre o WhatsApp diretamente com a mensagem formatada de envio de orçamento.
 */
export async function openQuoteWhatsAppMessage(
  quote: Quote,
  company?: FlexibleCompany | null,
  client?: FlexibleClient | null
): Promise<void> {
  const clientName = client?.name || quote.client?.name || 'Cliente';
  const companyName = company?.tradeName || company?.name || 'SmartGesso';
  const quoteCode = `#${quote.quoteNumber} v${quote.version}`;
  const totalStr = formatCurrency(quote.total);

  const phone = (client?.phone || client?.whatsapp || '').replace(/\D/g, '');

  const text = encodeURIComponent(
    `Olá *${clientName}*, tudo bem?\n\n` +
      `Aqui é da *${companyName}*! Conforme conversamos, segue a proposta comercial do seu orçamento ${quoteCode}:\n\n` +
      `💰 *Valor Total:* ${totalStr}\n` +
      `📅 *Validade:* ${quote.validUntil ? formatDateBr(quote.validUntil) : '15 dias'}\n\n` +
      `Acabamos de gerar o documento formal da proposta. Caso tenha qualquer dúvida ou queira ajustar algum detalhe da obra, estamos à sua inteira disposição!\n\n` +
      `Podemos confirmar o início dos trabalhos?`
  );

  const url = phone
    ? `https://wa.me/55${phone}?text=${text}`
    : `https://wa.me/?text=${text}`;

  await Linking.openURL(url);
}
