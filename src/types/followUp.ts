export interface QuoteFollowUp {
  id: string;
  quoteId: string;
  type: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'OTHER';
  notes?: string;
  scheduledAt?: string;
  doneAt?: string;
  status: 'PENDING' | 'DONE' | 'CANCELLED';
}

export interface QuoteFollowUpCreateRequest {
  type: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'OTHER';
  notes?: string;
  scheduledAt?: string;
}

export interface QuoteFollowUpUpdateRequest {
  status?: 'DONE' | 'CANCELLED';
  notes?: string;
  doneAt?: string;
}

export interface QuoteFollowUpListResponse {
  data: QuoteFollowUp[];
  total: number;
}