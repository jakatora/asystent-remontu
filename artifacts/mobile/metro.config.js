const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web worker imports a .wasm file — Metro must treat it as an asset.
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './global.css' });
