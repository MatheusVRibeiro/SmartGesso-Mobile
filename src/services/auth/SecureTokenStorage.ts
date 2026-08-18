import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { config } from '../../constants/config';

/**
 * Secure abstraction over expo-secure-store for JWT token management.
 * On native platforms (iOS/Android), uses SecureStore (Keychain / KeyStore).
 * On web platform, falls back to localStorage.
 */
export const SecureTokenStorage = {
  async getAccessToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(config.tokenKey);
        }
        return null;
      }
      return await SecureStore.getItemAsync(config.tokenKey);
    } catch {
      return null;
    }
  },

  async setAccessToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(config.tokenKey, token);
      }
      return;
    }
    await SecureStore.setItemAsync(config.tokenKey, token);
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(config.refreshTokenKey);
        }
        return null;
      }
      return await SecureStore.getItemAsync(config.refreshTokenKey);
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(config.refreshTokenKey, token);
      }
      return;
    }
    await SecureStore.setItemAsync(config.refreshTokenKey, token);
  },

  async clearTokens(): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(config.tokenKey);
        window.localStorage.removeItem(config.refreshTokenKey);
      }
      return;
    }
    await SecureStore.deleteItemAsync(config.tokenKey);
    await SecureStore.deleteItemAsync(config.refreshTokenKey);
  },
} as const;

export type SecureTokenStorageType = typeof SecureTokenStorage;
