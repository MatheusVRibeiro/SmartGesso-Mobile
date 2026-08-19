import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { config } from '../../constants/config';
import { SecureTokenStorage } from '../auth/SecureTokenStorage';
import type { ApiError, ApiErrorCode } from '../../types/api';

// ─── Types ──────────────────────────────────────────────────────────────────

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

interface RequestConfigWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ─── Module state ───────────────────────────────────────────────────────────

let client: AxiosInstance | null = null;
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];
let unauthorizedHandler: (() => void) | null = null;
let accessDeniedHandler: (() => void) | null = null;

// ─── Queue helpers ──────────────────────────────────────────────────────────

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
}

// ─── Raw instance (no interceptors — used only for refresh) ─────────────────

const rawClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Error mapper ───────────────────────────────────────────────────────────

function mapStatusToErrorCode(status: number, body?: Record<string, unknown>): ApiErrorCode {
  // If the backend returns a specific code, use it
  if (body && typeof body.code === 'string') {
    const known: string[] = [
      'COMPANY_ACCESS_DENIED',
      'COMPANY_ACCESS_SUSPENDED',
      'SUBSCRIPTION_GRACE_PERIOD',
    ];
    if (known.includes(body.code)) {
      return body.code as ApiErrorCode;
    }
  }

  switch (status) {
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 422:
      return 'VALIDATION_ERROR';
    case 429:
      return 'RATE_LIMITED';
    default:
      return status >= 500 ? 'SERVER_ERROR' : 'SERVER_ERROR';
  }
}

export function toApiError(error: unknown): ApiError {
  // Network / timeout — no response at all
  if (!axios.isAxiosError(error) || !error.response) {
    const axiosErr = error as AxiosError | undefined;
    const message =
      axiosErr?.code === 'ECONNABORTED'
        ? 'Tempo limite de conexão excedido'
        : 'Erro de rede — verifique sua conexão';
    return { message, code: 'NETWORK_ERROR' };
  }

  const { status, data } = error.response;
  const body = data as Record<string, unknown> | undefined;
  const code = mapStatusToErrorCode(status, body);

  return {
    message:
      (typeof body?.message === 'string' && body.message) ||
      error.message ||
      'Erro inesperado',
    code,
    status,
    errors: (body?.errors as Record<string, string[]>) ?? undefined,
    details: body,
  };
}

// ─── Token persistence helpers ──────────────────────────────────────────────

async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureTokenStorage.setAccessToken(accessToken);
  await SecureTokenStorage.setRefreshToken(refreshToken);
}

async function clearTokens(): Promise<void> {
  await SecureTokenStorage.clearTokens();
}

// ─── Refresh logic ──────────────────────────────────────────────────────────

async function refreshTokens(): Promise<string> {
  const refreshToken = await SecureTokenStorage.getRefreshToken();

  if (!refreshToken) {
    throw toApiError({ message: 'No refresh token available', code: 'NO_TOKEN' });
  }

  const response = await rawClient.post('/auth/refresh', { refreshToken });
  const { accessToken: newAccess, refreshToken: newRefresh } = response.data as {
    accessToken: string;
    refreshToken: string;
  };

  await saveTokens(newAccess, newRefresh);
  return newAccess;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function createApiClient(): AxiosInstance {
  if (client) return client;

  client = axios.create({
    baseURL: config.apiUrl,
    timeout: config.apiTimeout,
    headers: { 'Content-Type': 'application/json' },
  });

  // ── Request interceptor: inject Bearer token ────────────────────────────
  client.interceptors.request.use(
    async (requestConfig: InternalAxiosRequestConfig) => {
      const token = await SecureTokenStorage.getAccessToken();
      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      return requestConfig;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  // ── Response interceptor: 401 → refresh + retry queue ───────────────────
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RequestConfigWithRetry;

      if (error.response?.status === 401 && !originalRequest._retry) {
        // Another refresh is already in flight — queue this request
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return client!.request(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshTokens();
          processQueue(null, newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return client!.request(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          await clearTokens();
          // Notify the app layer (e.g. Zustand store) so it can clear session
          if (unauthorizedHandler) {
            unauthorizedHandler();
          }
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }
      // Handle 403 / access suspended
      if (error.response?.status === 403 && accessDeniedHandler) {
        accessDeniedHandler();
      }
      return Promise.reject(error);
    },
  );

  return client;
}

export function getApiClient(): AxiosInstance {
  if (!client) {
    return createApiClient();
  }
  return client;
}

/**
 * Register a callback invoked when a refresh fails and tokens are cleared.
 * Used by the session store to transition to 'unauthenticated'.
 */
export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

export function setAccessDeniedHandler(handler: () => void): void {
  accessDeniedHandler = handler;
}
