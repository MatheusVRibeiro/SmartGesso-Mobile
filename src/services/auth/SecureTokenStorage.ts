import * as SecureStore from 'expo-secure-store';
import { config } from '../../constants/config';

/**
 * Secure abstraction over expo-secure-store for JWT token management.
 * Never uses AsyncStorage — only SecureStore.
 */
export const SecureTokenStorage = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(config.tokenKey);
    } catch {
      return null;
    }
  },

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(config.tokenKey, token);
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(config.refreshTokenKey);
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(config.refreshTokenKey, token);
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(config.tokenKey);
    await SecureStore.deleteItemAsync(config.refreshTokenKey);
  },
} as const;

export type SecureTokenStorageType = typeof SecureTokenStorage;
