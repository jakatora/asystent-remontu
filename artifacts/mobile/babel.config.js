const path = require('path');

// Force EXPO_ROUTER_APP_ROOT before babel-preset-expo reads it.
// pnpm + monorepo + EAS Cloud combo sometimes doesn't pick up the env var
// from eas.json env block — set it here so babel always sees a static path.
process.env.EXPO_ROUTER_APP_ROOT =
  process.env.EXPO_ROUTER_APP_ROOT || path.resolve(__dirname, 'app');

module.exports = function (api) {
  api.cache(false); // disable cache so EXPO_ROUTER_APP_ROOT change is picked up immediately
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
