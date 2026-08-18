import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { SecureTokenStorage } from '../services/auth/SecureTokenStorage';
import { config } from '../constants/config';

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let client: AxiosInstance | null = null;
let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

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

async function getAccessToken(): Promise<string | null> {
  return await SecureTokenStorage.getAccessToken();
}

async function getRefreshTokenValue(): Promise<string | null> {
  return await SecureTokenStorage.getRefreshToken();
}

async function saveTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await SecureTokenStorage.setAccessToken(accessToken);
  await SecureTokenStorage.setRefreshToken(refreshToken);
}

async function clearTokens(): Promise<void> {
  await SecureTokenStorage.clearTokens();
}

async function refreshTokens(): Promise<string> {
  const refreshTokenValue = await getRefreshTokenValue();

  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  const response = await axios.post(
    `${config.apiUrl}/platform/auth/refresh`,
    { refreshToken: refreshTokenValue }
  );

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    response.data;

  await saveTokens(newAccessToken, newRefreshToken);

  return newAccessToken;
}

export function createApiClient(): AxiosInstance {
  if (client) return client;

  client = axios.create({
    baseURL: config.apiUrl,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(
    async (requestConfig: InternalAxiosRequestConfig) => {
      const token = await getAccessToken();

      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }

      return requestConfig;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status === 401 && !originalRequest._retry) {
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
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}

export function getApiClient(): AxiosInstance {
  if (!client) {
    return createApiClient();
  }
  return client;
}

export { clearTokens, saveTokens, getAccessToken, getRefreshTokenValue };
