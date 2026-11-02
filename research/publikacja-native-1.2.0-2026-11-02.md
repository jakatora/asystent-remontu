# Asystent Remontu 1.2.0 / build 10 — publikacja Android i iOS

Stan roboczy na 2026-11-02 11:41 UTC: obie paczki zostały zbudowane i przesłane do sklepów, zgłoszenia do przeglądu jeszcze nie wysłano. Końcowy odbiór natywnych koszyków i aktualizacja zrzutów trwają. Nie utożsamiać uploadu, walidacji paczki ani statusu skonfigurowanego tracku `completed` z publicznym udostępnieniem aktualizacji.

## Źródło i pakiety

- Izolowana gałąź `codex/store-release-20261102`, worktree `G:/Projekty/asystent-remontu-release-20261102`.
- Kod aplikacji zbudowany z `86208e37f6523f3d5203118cb984a69295c27a09`; źródłem bazowym jest wdrożone W200 `ba7d745c3565dedbfecd99274636a63f3e7827ef`.
- Późniejsze commity `683462c`, `d9da847`, `11cb9aa` zmieniają wyłącznie CI i testy. Pliki aplikacji, bibliotek i zależności są identyczne z kodem paczek.
- iOS `app.replit.remontasystent`, App Store ID `6761497453`, Apple Team `B7J6A7R258`; zachowane istniejące podpisy i profile.
- Android `pl.asystentremontu.app`; zachowany istniejący zarządzany podpis EAS, SHA-256 certyfikatu `060bb3db364b08c01efce9e72c802d493925c2338d8bf068572c9dd5d02274d4`.
- Artefakty i dowody: `G:/Projekty/asystent-remontu-work/native-release-20261102`.

| Paczka | Bajty | SHA-256 |
|---|---:|---|
| IPA | 24917096 | `d4a2ec551c1b6f921ff510ffc600df3252179094e34d39c3d1cdbd676789af51` |
| AAB | 71299571 | `500632a8211ad31e5744738b020499d9349eaaab20dd39698fae745ac0419f4b` |
| APK do odbioru | 107306037 | `5056d8cc2e0cf68069fbf64b4f7a7ace372ed9275c6ce9e02c70c4feb45567e3` |

## Wykonane kontrole

- 592 testy mobile i kontrola typów mobile/pricing PASS przed zamrożeniem źródła; nie sumować ich z nakładającymi się testami W200.
- Skan wszystkich rozpakowanych wpisów IPA/AAB/APK: 104 wzorce obejmujące sekrety vaulta i linie kluczy prywatnych, 0 trafień. Jawny adres pomocy to świadomie publiczny identyfikator.
- Android: rzeczywisty manifest AAB i APK minSdk 24 / targetSdk 36, zgodne ID i wersja, podpis zgodny z dotychczasowym. Bez uprawnień mikrofonu, wszystkich plików, szerokiego dostępu do mediów i lokalizacji w tle.
- APK `zipalign -c -P 16 4` PASS. W każdej paczce 48 bibliotek 64-bit ma wyrównanie wszystkich segmentów LOAD co najmniej 16384; AAB deklaruje `PAGE_ALIGNMENT_16K`.
- IPA: minimum iOS 15.1, Xcode 26.6 / SDK iPhoneOS 26.5, 11 manifestów prywatności, brak wymaganej lokalizacji w tle. Opis mikrofonu dodany automatycznie przez moduł zdjęć nie oznacza żądania dostępu; aplikacja używa wyboru obrazów.
- Potwierdzone W200 WWW: 35 przypadków UI i 12 rzeczywistych HTTP, bez podstawiania wycen. To osobny dowód; nie zastępuje pełnego natywnego odbioru.

## Stan sklepów

- iOS Codemagic `6ae867ac1d0d27c634cbd2be` SUCCESS, Apple build `5c030415-0341-4b20-b9b3-7847f2c10905` VALID, numer 10.
- Wersja iOS `607ce9ea-8d04-42a1-b2df-5c08513d0e45`, metadata PL i EN, realny kontakt review przeniesiony z zaakceptowanej wersji. Zapisano wymagane `socialMedia=false` w klasyfikacji wiekowej. Właściciel potwierdził uzupełnienie App Privacy.
- Kontener review `433d3682-bf4b-4d43-9e5f-f1ac288cce53` utworzony. Wersja była poprawnie dodana do niezgłoszonego review, następnie usunięta z niego, aby można było edytować zrzuty. Nadal PREPARE_FOR_SUBMISSION; aktualizacja 1.1.0 pozostaje publiczna.
- Android EAS AAB `2f9baa2b-a3c3-42c8-be71-18dd944a3f58` i APK `192bbc2d-64ad-46f0-ab5c-1b619d8e49a7` FINISHED. Właściciel nadał publisherowi uprawnienia Play. AAB 10 przesłany, suma kontrolna odpowiedzi Google zgadza się z lokalną.
- Play edit `08460177700578435802`: metadata PL/EN, track production z planowaną wersją 10, walidacja API PASS, jeszcze bez `commit`. Poprzednio publiczny numer 9 / 1.0.3.
- Data safety przyjęte HTTP 200: przybliżone położenie/kod i dane koszyka, diagnostyka połączenia; szyfrowanie w tranzycie, brak reklamowego tracking, brak konta chmurowego. Zdjęcia remontu pozostają lokalne.

## Bieżący odbiór natywny

- Początkowy iOS smoke `6ae86c0e135ab61eff7dbdd2` zatrzymało systemowe okno Open. Poprawiono obsługę tego rzeczywistego okna.
- Kolejny iOS smoke `6ae87096a4746d3faf93b23b` przeszedł natywny start, onboarding, utworzenie SQLite, wejście w projekt i wpis kodu. Zatrzymał go automatyczny `hideKeyboard` na numerycznej klawiaturze iOS; zastąpiono go dotknięciem obszaru widoku przewijania. Nie był to crash aplikacji ani zakończony odbiór dostawy.
- Końcowy iOS `6ae874da80d539e9ddbed6c5` oraz Android `6ae874da973df0f1cddef092` uruchomione z CI `11cb9aa0595860ccb5bf74a7dd2f95a24a5b3304`. Android pobiera dokładnie APK ze wskazaną wyżej sumą; na jednorazowym emulatorze zasiewa wyłącznie syntetyczne projekty, a ceny/dostawę pobiera z rzeczywistego API.
- Lokalny Windows ma wyłączoną wirtualizację; własne emulatory zostały zatrzymane. Próba fizycznego Firebase Test Lab nie uruchomiła testu: projekt nie ma aktywnych rozliczeń do uploadu GCS. Nie włączano rozliczeń. Włączono jedynie API Testing/Tool Results przez istniejące autoryzowane Firebase CLI; domyślny pusty magazyn FTL ma retencję 60 dni. Upload otrzymał 403; nie utworzono obiektu APK ani macierzy testowej.

## Publiczna pomoc i prywatność

- `https://asystent-remontu-web-production.up.railway.app/pomoc`, `/polityka-prywatnosci`, `/regulamin`: 6 publicznych przypadków 320/390 px PASS, 63 zasoby aplikacji zachowane.
- Źródło hostingu `c3555b380046d0caaea626cf071f45358ff94c2e`, deployment `e108b3eb-f702-4bb7-8198-1c229ee9f4b4` SUCCESS. Wcześniejszą niespójność skompresowanego `release.json` wykrył odbiór i naprawiono przed PASS.
- Stary adres prywatności z Google Play `https://jakatora.github.io/asystent-remontu-privacy/privacy.html` także zaktualizowano: commit `01b29cd319af2020da1155745540fc115f824673`, publiczny HTTP 200. Operator potwierdzony w obu sklepach: Krzysztof Kapusta; usunięto błędną wcześniejszą tożsamość i zapowiedzi mikrofonu/AdID.
- Raport PR180 zaktualizowany o faktyczne wdrożenie i końcowy odbiór W200.

## Następne kroki

1. Odebrać aktywne testy, obejrzeć zrzuty i rzeczywisty wynik dostawy. Rozwiązywać faktyczne błędy, bez osłabiania asercji i podmieniania odpowiedzi API.
2. Uzupełnić aktualne natywne zrzuty w obu sklepach; iOS wyłącznie w dopuszczonych rozdzielczościach.
3. Ponownie zwalidować komplet, wysłać Play edit do przeglądu z ochroną przed anulowaniem obcego review; wysłać kontener Apple i zweryfikować rzeczywiste stany.
4. Zapisać wynik przeglądu/publikacji. Nie ogłaszać dostępności 1.2.0 przed potwierdzeniem sklepów.

Zastane zmiany robocze w głównym repozytorium (m.in. mappings, foilChoice, ean-overlay i lockfile) pozostają poza tym wydaniem i nie są nadpisywane. Cel dalszego rozwoju aplikacji pozostaje aktywny.
