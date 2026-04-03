# App Store (iOS) Release Checklist — Asystent Remontu v1.0.0

## App Configuration
- [x] `ios.bundleIdentifier` set to `pl.asystentremontu.app`
- [x] `ios.buildNumber` set to `1`
- [x] `ios.supportsTablet` set to `false`
- [x] iOS permission descriptions (NSCameraUsageDescription, NSPhotoLibraryUsageDescription, NSLocationWhenInUseUsageDescription)

## Pre-Build Steps
- [ ] Replace `REPLACE_WITH_EAS_PROJECT_ID` in `app.json` with actual EAS project ID
- [ ] Set up Apple Developer account
- [ ] Create App ID in Apple Developer portal
- [ ] Run `eas build:configure`
- [ ] Set up EAS credentials for iOS

## Build & Test
- [ ] Run `eas build --platform ios --profile preview` for simulator build
- [ ] Run `eas build --platform ios --profile production` for App Store build
- [ ] Test on physical iOS device via TestFlight

## App Store Connect Requirements
- [ ] App name: "Asystent Remontu"
- [ ] Subtitle suggestion: "Twój przewodnik po remontach"
- [ ] Category: Utilities or Lifestyle
- [ ] Screenshots: iPhone 6.7" and 6.1" required
- [ ] App description in Polish
- [ ] Privacy Policy URL (https://asystentremontu.pl/polityka-prywatnosci) — PAGE MUST EXIST
- [ ] Support URL (https://asystentremontu.pl/pomoc) — PAGE MUST EXIST
- [ ] Marketing URL (https://asystentremontu.pl)

## App Review Compliance
- [x] Privacy policy link visible in Settings
- [x] Terms of service link visible in Settings
- [x] Support/contact link visible in Settings
- [x] Account deletion option present (placeholder — data is local only)
- [x] Camera permission has clear usage description
- [x] Photo library permission has clear usage description
- [x] Location permission has clear usage description
- [x] No fake payment flows in consumer-facing screens
- [x] Contractor billing/plans are clearly internal/admin tools
- [x] Promoted/sponsored labels are transparent
- [x] Safety disclaimers present for DIY renovation work
- [x] No misleading feature claims

## Content Rating
- [ ] Likely rating: 4+ (no objectionable content)
- [ ] No user-generated content visible to other users in v1.0
- [ ] No in-app purchases in v1.0 (contractor plans are B2B internal)

## Remaining Blockers
- [ ] Privacy Policy webpage must be published at the declared URL
- [ ] Terms of Service webpage must be published at the declared URL
- [ ] Support page must be published at the declared URL
- [ ] App icon should be reviewed for App Store guidelines (1024x1024 required)
- [ ] Screenshots need to be captured on supported device sizes
