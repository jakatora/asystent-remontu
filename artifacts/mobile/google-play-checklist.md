# Google Play Release Checklist — Asystent Remontu v1.0.0

## App Configuration
- [x] `android.package` set to `pl.asystentremontu.app`
- [x] `android.versionCode` set to `1`
- [x] `android.adaptiveIcon` configured
- [x] `android.permissions` declared

## Google Play Console Setup
- [ ] Create developer account (Google Play Console)
- [ ] Create app in console
- [ ] App name: "Asystent Remontu"
- [ ] Short description: "Przewodnik po remontach — krok po kroku"
- [ ] Full description in Polish
- [ ] Category: Tools or House & Home
- [ ] Content rating questionnaire completed

## Store Listing Assets
- [ ] Feature graphic (1024x500)
- [ ] Phone screenshots (min 2, recommended 8)
- [ ] 7-inch tablet screenshots (if applicable)
- [ ] 10-inch tablet screenshots (if applicable)
- [ ] App icon (512x512, auto-generated from adaptive icon)

## Privacy & Compliance
- [x] Privacy policy link in Settings
- [x] Terms of service link in Settings
- [x] Support/contact information in Settings
- [x] Account/data deletion option present
- [x] Camera permission justified in app
- [x] Location permission justified in app
- [x] No deceptive behaviors
- [x] Safety disclaimers for renovation work
- [ ] Privacy Policy page must be live at declared URL
- [ ] Data safety section must be filled in Google Play Console
  - Personal info: None collected in v1.0
  - Location: Optional, for contractor search only
  - Photos: Stored locally only, not transmitted
  - App activity: Stored locally only

## Technical Requirements
- [x] Target SDK level (managed by Expo/EAS)
- [x] AAB format (EAS builds AAB by default)
- [x] 64-bit support (React Native 0.81+ includes this)
- [x] No embedded ad SDKs
- [x] No background services

## Testing
- [ ] Internal testing track — upload first build
- [ ] Test on multiple Android versions (API 24+)
- [ ] Test on different screen sizes
- [ ] Verify all permissions work correctly
- [ ] Verify SQLite database works on fresh install

## Monetization
- [x] No in-app purchases in v1.0
- [x] Contractor plans/billing are B2B internal tools, not consumer-facing
- [x] No ads

## Remaining Blockers
- [ ] Privacy Policy webpage must be published
- [ ] Terms of Service webpage must be published
- [ ] Data Safety section must be completed in Google Play Console
- [ ] EAS project needs to be configured
- [ ] Upload keystore needs to be created
