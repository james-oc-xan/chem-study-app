const { getDefaultConfig } = require('expo/metro-config');

module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo(nent)?|@expo|@expo-google-fonts|react-clone-referenced-element|@unimodules|unimodules|sentry-expo|native-base)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
