import * as SecureStore from 'expo-secure-store';
import { SecureTokenStorage } from '../SecureTokenStorage';

jest.mock('expo-secure-store');

describe('SecureTokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('setAccessToken armazena o token', async () => {
    await SecureTokenStorage.setAccessToken('test-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      expect.any(String),
      'test-token'
    );
  });

  it('getAccessToken retorna o token armazenado', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('stored-token');
    const token = await SecureTokenStorage.getAccessToken();
    expect(token).toBe('stored-token');
  });

  it('clearTokens remove todos os tokens', async () => {
    await SecureTokenStorage.clearTokens();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
  });
});
