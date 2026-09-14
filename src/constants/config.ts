const DEV_API_URL = 'http://192.168.0.174:3000/api/v1';
const PROD_API_URL = 'https://api.smartgesso.com.br/api/v1';

const envApiUrl = process.env.EXPO_PUBLIC_API_URL;

export const config = {
  /** Base URL — reads EXPO_PUBLIC_API_URL from .env, falls back to machine IP in __DEV__ */
  apiUrl: envApiUrl?.trim() || (__DEV__ ? DEV_API_URL : PROD_API_URL),
  appName: 'SmartGesso',
  appVersion: '1.0.0',
  tokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  /** Legacy timeout (used by src/api/client.ts) */
  timeout: 30_000,
  /** Timeout for the new services/api client (15 s as per task spec) */
  apiTimeout: 15_000,
} as const;

export type Config = typeof config;
