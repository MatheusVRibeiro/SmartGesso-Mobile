// ─── Standardized response types ────────────────────────────────────────────

/**
 * Generic list response envelope.
 * Some endpoints return a simple array, others wrap in { data, total }.
 * This type represents the wrapped format.
 */
export interface ListResponse<T> {
  data: T[];
  total: number;
}

/**
 * Paginated list response with pagination metadata.
 * Used by endpoints that support page/limit parameters.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Legacy success envelope (kept for backward compat).
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Normalizes API responses that may return either:
 * 1. A raw array (Prisma findMany style)
 * 2. A wrapped { data, total } envelope
 *
 * Returns a consistent array format.
 */
export function toArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'data' in result) {
    return (result as { data: T[] }).data;
  }
  return [];
}

/**
 * Normalizes paginated responses.
 * Handles both raw arrays and wrapped envelopes.
 */
export function toPaginated<T>(
  result: unknown,
  defaults?: Partial<PaginatedResponse<T>>,
): PaginatedResponse<T> {
  if (Array.isArray(result)) {
    return {
      data: result as T[],
      total: result.length,
      page: defaults?.page ?? 1,
      limit: defaults?.limit ?? result.length,
      totalPages: 1,
    };
  }

  if (result && typeof result === 'object' && 'data' in result) {
    const obj = result as Record<string, unknown>;
    return {
      data: (obj.data as T[]) ?? [],
      total: (obj.total as number) ?? 0,
      page: (obj.page as number) ?? defaults?.page ?? 1,
      limit: (obj.limit as number) ?? defaults?.limit ?? 20,
      totalPages:
        (obj.totalPages as number) ??
        Math.ceil(((obj.total as number) ?? 0) / ((obj.limit as number) ?? 20)),
    };
  }

  return {
    data: [],
    total: 0,
    page: defaults?.page ?? 1,
    limit: defaults?.limit ?? 20,
    totalPages: 0,
  };
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
