// Mock de __DEV__ global
global.__DEV__ = true;

// Mock de expo-secure-store para testes
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock de @expo/vector-icons — componente simples que renderiza null
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockIcon = (props) => React.createElement(View, props);
  return {
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
    Feather: MockIcon,
  };
});