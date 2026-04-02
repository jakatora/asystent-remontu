# App Review Notes — Asystent Remontu

## What the app does
Asystent Remontu is a Polish-language renovation assistant app. It helps users plan home renovations by calculating required materials, generating shopping lists, estimating costs, and providing step-by-step instructions for over 60 types of renovation work.

## Login requirements
No login or account creation is required. The app works fully offline. All data is stored locally on the user's device.

An optional cloud sync feature is prepared in the settings screen but is not currently active (displayed as "Niedostępne — brak konfiguracji" / "Unavailable — no configuration"). No account creation flow exists in the current version.

## How to test the app
1. Open the app — you will see a dashboard with quick actions
2. Tap "Nowy projekt" (New project) to start the renovation wizard
3. Select a work category (e.g., "Wykończenia" / Finishing) and a specific job
4. Enter room dimensions when prompted
5. The app will calculate materials needed and show results
6. You can generate a shopping list, view a budget estimate, and track the project

## Support and privacy links
- Support page: accessible from Settings > "Pomoc i wsparcie" or via web at /pomoc
- Privacy policy: accessible from Settings > "Polityka prywatności" or via web at /polityka-prywatnosci
- Contact email displayed in Settings > "Kontakt"

## Contractor module
The "Znajdź fachowca" (Find a Contractor) feature uses demonstration/mock data. Contractor profiles shown are sample data for UI demonstration purposes. The module is fully functional in terms of UI flow (searching, filtering, sending requests) but uses local mock data rather than a live contractor database.

## Pricing information
All prices shown in the app are reference estimates ("ceny referencyjne"). They are not real-time market prices. The app clearly labels them as estimates and allows users to override individual prices with their own values.

## Account deletion
Account creation does not exist in this version of the app. No user accounts are created, so account deletion is not applicable. All data is stored locally and can be cleared by uninstalling the app or using the device's storage settings.

## Technical notes
- Built with Expo / React Native
- Offline-first architecture using expo-sqlite
- No external API calls required for core functionality
- No in-app purchases in this version
