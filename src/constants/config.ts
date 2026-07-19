const DEV_API_URL = 'http://localhost:3000/api/v1';
const PROD_API_URL = 'https://api.smartgesso.com.br/api/v1';

export const config = {
  apiUrl: __DEV__ ? DEV_API_URL : PROD_API_URL,
  appName: 'SmartGesso',
  appVersion: '1.0.0',
  tokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  timeout: 30000,
} as const;

export type Config = typeof config;
