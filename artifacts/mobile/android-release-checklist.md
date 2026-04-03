# Android Release Checklist — Asystent Remontu v1.0.0

## Build Configuration
- [x] `android.package` set to `pl.asystentremontu.app`
- [x] `android.versionCode` set to `1`
- [x] `android.backgroundColor` set
- [x] `android.adaptiveIcon` configured with foreground image and background color
- [x] `android.permissions` declared: CAMERA, READ_MEDIA_IMAGES, ACCESS_FINE_LOCATION
- [x] `expo-image-picker` plugin with permission strings
- [x] `expo-location` plugin with permission strings
- [x] `expo-sqlite` plugin declared
- [x] New Architecture enabled (`newArchEnabled: true`)

## Pre-Build Steps
- [ ] Replace `REPLACE_WITH_EAS_PROJECT_ID` in `app.json` with actual EAS project ID
- [ ] Run `eas build:configure` to generate `eas.json`
- [ ] Create upload keystore for Google Play signing
- [ ] Set up EAS credentials (`eas credentials`)

## Build & Test
- [ ] Run `eas build --platform android --profile preview` for test APK
- [ ] Install APK on physical device and verify:
  - [ ] App launches without crash
  - [ ] Database initializes correctly (14 migrations)
  - [ ] Tab navigation works
  - [ ] Create project flow works
  - [ ] Shopping list generates correctly
  - [ ] Camera/gallery photo picker works
  - [ ] Contractor search works
  - [ ] House Build module works
  - [ ] Back navigation works correctly throughout
  - [ ] Delete project navigates safely
- [ ] Run `eas build --platform android --profile production` for AAB

## Google Play Console
- [ ] Create app listing in Google Play Console
- [ ] Upload AAB
- [ ] Fill in store listing (see `google-play-checklist.md`)
- [ ] Set up internal testing track first
- [ ] Test with Google Play internal testing before production release

## Known Android-Specific Notes
- Adaptive icon uses the same icon.png as foreground — consider creating a dedicated adaptive icon
- Permissions are declared but only requested at runtime when needed (camera for photos, location for contractor search)
- `READ_MEDIA_IMAGES` is the correct permission for Android 13+ (replaces READ_EXTERNAL_STORAGE)
