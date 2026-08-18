// ─── Legacy types (kept for backward compat) ────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── New types (services layer) ─────────────────────────────────────────────

/** Discriminated error codes emitted by the HTTP client */
export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'COMPANY_ACCESS_DENIED'
  | 'COMPANY_ACCESS_SUSPENDED'
  | 'SUBSCRIPTION_GRACE_PERIOD'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'RATE_LIMITED';

/** Typed error thrown by every service call via the centralised client */
export interface ApiError {
  message: string;
  code: ApiErrorCode;
  status?: number;
  errors?: Record<string, string[]>;
  details?: unknown;
}
