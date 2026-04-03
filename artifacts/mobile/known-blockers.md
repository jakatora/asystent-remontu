# Known Blockers — Asystent Remontu v1.0.0

## Release Blockers (Must Fix Before Publishing)

### 1. Privacy Policy & Terms Pages Not Published
- **Impact**: App Store and Google Play both require live, accessible privacy policy and terms of service URLs
- **Current State**: URLs are configured in `config/contact.ts` but the web pages do not exist yet
- **Fix Required**: Publish pages at:
  - `https://asystentremontu.pl/polityka-prywatnosci`
  - `https://asystentremontu.pl/regulamin`
  - `https://asystentremontu.pl/pomoc`

### 2. EAS Project Not Configured
- **Impact**: Cannot build release binaries without EAS project
- **Current State**: `app.json` has placeholder `REPLACE_WITH_EAS_PROJECT_ID`
- **Fix Required**: Run `eas init` and update `app.json`

### 3. App Signing Not Set Up
- **Impact**: Cannot publish to stores without signing keys
- **Current State**: No keystore or provisioning profiles configured
- **Fix Required**: Run `eas credentials` for both platforms

### 4. App Icon May Need Store-Specific Versions
- **Impact**: App Store requires 1024x1024 icon, Google Play uses 512x512
- **Current State**: Single `icon.png` in assets — may need verification of dimensions
- **Fix Required**: Verify icon dimensions meet store requirements

## Non-Blocking Issues (Can Ship Without)

### 5. Account Deletion Implemented (Local Data)
- **Status**: Settings "Usun wszystkie dane" now clears all SQLite tables with confirmation dialog
- **Risk**: None — fully functional for local-only data. If cloud accounts are added later, account deletion will need server-side support
- **Recommendation**: No action needed for v1.0

### 6. Supabase Sync Not Configured
- **Status**: Cloud sync shows "Niedostepne — brak konfiguracji" in Settings
- **Risk**: None — feature is correctly disabled and labeled
- **Recommendation**: Can ship as local-only in v1.0

### 7. Sentry Error Reporting Not Configured
- **Status**: Shows "Wylaczone" in Settings
- **Risk**: None — app works fine without it, but production crash reporting is recommended
- **Recommendation**: Configure Sentry DSN before production launch

### 8. Contractor Plans/Billing Are Mock/Test Mode
- **Status**: All billing flows are clearly labeled as test mode
- **Risk**: None for consumer users — these are B2B internal tools
- **Recommendation**: Keep behind admin-only access until real payment provider integration

### 9. Adaptive Icon Uses Generic Image
- **Status**: `icon.png` is used for both regular and adaptive icon
- **Risk**: Low — works but may not look ideal on Android home screens
- **Recommendation**: Create purpose-built adaptive icon foreground

## Feature Flags Recommended
Consider adding runtime feature flags for:
- Contractor registration (currently open)
- Billing/payment flows (currently test mode)
- Cloud sync (currently disabled)
- Location-based features (currently available but unused)
