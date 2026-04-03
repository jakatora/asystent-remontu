# Expo Go Compatibility Report — Asystent Remontu v1.0.0

## SDK Version
- Expo SDK 54
- React Native 0.81.5

## Compatibility Status: MOSTLY COMPATIBLE

### Fully Expo Go Compatible
- `expo-router` (file-based routing)
- `expo-font` (Google Fonts)
- `expo-splash-screen`
- `expo-status-bar`
- `expo-constants`
- `expo-linking`
- `expo-web-browser`
- `expo-image`
- `expo-image-picker`
- `expo-haptics`
- `expo-linear-gradient`
- `expo-sqlite` (SDK 54+ supported in Expo Go)
- `@react-native-async-storage/async-storage`
- `react-native-reanimated`
- `react-native-gesture-handler`
- `react-native-safe-area-context`
- `react-native-screens`
- `react-native-svg`
- `react-native-keyboard-controller`
- `nativewind` / `tailwindcss`
- `@tanstack/react-query`
- `react-hook-form` + `zod`

### Potentially Requires Development Build
- `expo-glass-effect` — Liquid glass effect is iOS 26+ only. The app has a safe fallback: `isLiquidGlassAvailable()` is wrapped in try/catch and falls back to ClassicTabLayout. No crash risk.
- `expo-symbols` — SF Symbols (iOS only). Used in NativeTabLayout which is gated behind `isLiquidGlassAvailable()`. ClassicTabLayout uses `@expo/vector-icons` Feather icons instead. No crash risk.
- `expo-router/unstable-native-tabs` — Unstable API gated behind liquid glass check. Falls back to standard `<Tabs>` component.
- `expo-location` — Included in plugins but not actively used in any screen currently. Will work in Expo Go when activated.

### Not Used / Optional (No Risk)
- `@sentry/react-native` — Dynamically imported, gracefully skipped if unavailable
- `@supabase/supabase-js` — Only activates if env vars are set, otherwise no-op

## Conclusion
The app should run in Expo Go without issues. All potentially incompatible features have safe runtime fallbacks that prevent crashes. The ClassicTabLayout (Feather icons) is the default path in Expo Go.

## Web Preview Limitation (Pre-Existing)
The Expo web preview (`expo start --web`) does not work because expo-sqlite's WASM worker (`wa-sqlite.wasm`) fails to initialize in the Metro web bundler environment. The AppContext initialization hangs when trying to open the SQLite database. This is a known expo-sqlite web limitation and does NOT affect the native app (Android/iOS). The app bundles and runs correctly on native platforms.

## Recommendation
For development testing: Use Expo Go on a physical device or emulator (NOT the web preview)
For production builds: Use EAS Build (development build or production build)
