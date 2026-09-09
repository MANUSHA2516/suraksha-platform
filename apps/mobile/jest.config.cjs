module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo/.*|expo-.*|@react-navigation/.*|react-native-.*)/)',
  ],
};
