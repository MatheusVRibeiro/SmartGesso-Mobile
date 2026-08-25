// RNTL v14 usa React.act (React 19), que só existe no build de desenvolvimento.
// O ambiente pode exportar NODE_ENV=production; força "test" para os testes.
process.env.NODE_ENV = 'test';

module.exports = {
  preset: '@react-native/jest-preset',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@testing-library/react-native)',
  ],
  setupFiles: ['./jest.setup.js'],
};
