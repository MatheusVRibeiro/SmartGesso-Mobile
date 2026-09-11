/**
 * Mock compartilhado da API nova do expo-file-system (SDK 57) para os testes
 * do helper authenticatedImageUri. Vive em arquivo separado porque factories
 * de jest.mock não podem referenciar variáveis externas (hoisting).
 */

/** Instância de Directory retornada pelo construtor mockado. */
export const mockDirectoryInstance = {
  exists: true,
  create: jest.fn(),
};

/** Instância de File retornada pelo construtor mockado. */
export const mockFileInstance = {
  uri: 'file:///cache/smartgesso-uploads/foto.jpg',
};

export const MockFile: any = jest.fn(() => mockFileInstance);
MockFile.downloadFileAsync = jest.fn();

export const MockDirectory: any = jest.fn(() => mockDirectoryInstance);
