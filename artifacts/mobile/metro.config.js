const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..', '..');

// CRITICAL: set EXPO_ROUTER_APP_ROOT + EXPO_PROJECT_ROOT BEFORE getDefaultConfig.
// Metro spawns parallel workers (one per CPU); they inherit env vars only from the
// process that called `expo export:embed`. Setting them here guarantees every worker
// sees a static path that babel-preset-expo's expo-router plugin can inline.
const appRoot = path.resolve(projectRoot, 'app');
process.env.EXPO_ROUTER_APP_ROOT = appRoot;
process.env.EXPO_ROUTER_ABS_APP_ROOT = appRoot;
process.env.EXPO_PROJECT_ROOT = projectRoot;

const config = getDefaultConfig(projectRoot);

// pnpm monorepo: Metro must watch + resolve from BOTH the app's node_modules
// AND the workspace root's hoisted node_modules.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

// expo-sqlite's web worker imports a .wasm file — Metro must treat it as an asset.
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './global.css' });
