// Mock de __DEV__ global
global.__DEV__ = true;

// Mock de @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

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

// Mock de react-native-svg para testes
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockSvg = (props) => React.createElement(View, props);
  return {
    __esModule: true,
    default: MockSvg,
    Svg: MockSvg,
    Path: MockSvg,
    Rect: MockSvg,
    Circle: MockSvg,
    Line: MockSvg,
    Polygon: MockSvg,
    Polyline: MockSvg,
    G: MockSvg,
    Text: MockSvg,
    Defs: MockSvg,
    Use: MockSvg,
  };
});

// Mock de lucide-react-native para testes
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockLucideIcon = (props) => React.createElement(View, props);
  return new Proxy({}, {
    get: () => MockLucideIcon,
  });
});
