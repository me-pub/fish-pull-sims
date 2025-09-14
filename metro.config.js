// Metro config: ensure 'react-native' field is preferred so RN Codegen
// sees TypeScript sources (e.g., react-native-svg/src/*) instead of lib/*.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
