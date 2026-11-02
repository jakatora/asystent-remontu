# Asystent Remontu 1.2.0 / build 10 — publikacja Android i iOS

Stan na 2026-11-02 13:32 UTC: **Google zatwierdziło 1.2.0 / versionCode 10**, ale oficjalny odczyt zwraca `RELEASE_LIFECYCLE_STATE_APPROVED_NOT_PUBLISHED`. Wymagane ręczne opublikowanie zatwierdzonych zmian. Apple nadal potwierdza `WAITING_FOR_REVIEW` dla 1.2.0 / build 10 i automatyczne udostępnienie po akceptacji. Oba zgłoszenia rzeczywiście wysłano o 12:34 UTC lub wcześniej. To jeszcze nie publiczna dostępność aktualizacji. Nie utożsamiać uploadu, walidacji paczki ani statusu skonfigurowanego tracku `completed` z publikacją.

## Źródło i pakiety

- Izolowana gałąź `codex/store-release-20261102`, worktree `G:/Projekty/asystent-remontu-release-20261102`.
- Kod aplikacji zbudowany z `86208e37f6523f3d5203118cb984a69295c27a09`; źródłem bazowym jest wdrożone W200 `ba7d745c3565dedbfecd99274636a63f3e7827ef`.
- Późniejsze commity CI do `7e296f1a4cf779f7a0bd245751be3687e7019e11` zmieniają wyłącznie CI i testy. Pliki aplikacji, bibliotek i zależności są identyczne z kodem paczek.
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
- Kontener review `433d3682-bf4b-4d43-9e5f-f1ac288cce53` faktycznie zgłoszony `2026-11-02T12:09:42.598Z`. Apple potwierdza `WAITING_FOR_REVIEW` oraz `releaseType=AFTER_APPROVAL`; wcześniejsza 1.1.0 pozostaje publiczna do akceptacji nowej wersji.
- Wszystkie cztery nowe zrzuty PL/EN mają `assetDeliveryState=COMPLETE`: po dwa rzeczywiste widoki iPhone 14 Plus, RGB 1284×2778 w `APP_IPHONE_65`. Wymiar ten nie należy do `APP_IPHONE_67`; serwer odrzucał taką grupę jako `SPEC_MISMATCH`. Stare osiem kopii PL usunięto wyłącznie z nowej wersji przed zgłoszeniem. Dowody: `ios-screens-final.json`, `ios-submitted.json`, `ios-review-current.json` w folderze artefaktów.
- Android EAS AAB `2f9baa2b-a3c3-42c8-be71-18dd944a3f58` i APK `192bbc2d-64ad-46f0-ab5c-1b619d8e49a7` FINISHED. Właściciel nadał publisherowi uprawnienia Play. AAB 10 przesłany, suma kontrolna odpowiedzi Google zgadza się z lokalną.
- Play edit `08460177700578435802`: metadata PL/EN, track production 10, końcowa walidacja API PASS, rzeczywisty `commit` przyjęty `2026-11-02T12:34:23.441Z` z `changesNotSentForReview=false` i `changesInReviewBehavior=ERROR_IF_IN_REVIEW`. Odczyt `tracks/production/releases` o 12:34:27 UTC potwierdza 1.2.0 (10) jako `RELEASE_LIFECYCLE_STATE_IN_REVIEW`; wcześniejszy 9 (1.0.3) nadal `PUBLISHED`. Nie anulowano innego przeglądu.
- Google przyjął dwa nowe rzeczywiste zrzuty Androida RGB 1080×2400, sumy identyczne z bitmapami z końcowego testu: home `3af3d157e41f829a41ee9e684ad1eee47c0794cee8aabf0ab0348b8ce2a41a6b`, koszt z dostawą `bd60fbbef1d232320330221596be4acb5e48f51a5a9ade51ad66596ea5174145`. Zastąpiono osiem starych phoneScreenshots PL; ikona i feature graphic zachowane, EN korzysta z domyślnych obrazów. Dowody: `play-screens-final.json`, `play-final-validation.json`, `play-submitted.json`, `play-release-lifecycle.json`.
- Data safety przyjęte HTTP 200: przybliżone położenie/kod i dane koszyka, diagnostyka połączenia; szyfrowanie w tranzycie, brak reklamowego tracking, brak konta chmurowego. Zdjęcia remontu pozostają lokalne.

## Bieżący odbiór natywny

- Początkowy iOS smoke `6ae86c0e135ab61eff7dbdd2` zatrzymało systemowe okno Open. Poprawiono obsługę tego rzeczywistego okna.
- Kolejny iOS smoke `6ae87096a4746d3faf93b23b` przeszedł natywny start, onboarding, utworzenie SQLite, wejście w projekt i wpis kodu. Zatrzymał go automatyczny `hideKeyboard` na numerycznej klawiaturze iOS; zastąpiono go dotknięciem obszaru widoku przewijania. Nie był to crash aplikacji ani zakończony odbiór dostawy.
- Końcowy iOS `6ae874da80d539e9ddbed6c5` z CI `11cb9aa0595860ccb5bf74a7dd2f95a24a5b3304`: wszystkie kroki i rzeczywisty JUnit PASS. Zrzut planu pokazuje Realbud 112,84 PLN (w tym 25,00 dostawy) oraz Sewerę 243,52 PLN (w tym 23,90 dostawy). Suma 356,36 PLN jest ponad kadrem tego zrzutu; nie opisywać jej jako widocznej na obrazie. To historyczny wynik odbioru z 2026-11-02, nie aktualna oferta zakupowa.
- Android pobiera dokładnie podpisane APK ze wskazaną wyżej sumą; na jednorazowym emulatorze zasiewa wyłącznie syntetyczne projekty po sprawdzeniu 14 rzeczywistych migracji SQLite. Ceny i dostawę pobiera z rzeczywistego API. Pierwsze próby wykryły błędy własnego testu: ścieżki SDK, zbyt wczesne zasiewanie bazy i przewijanie przed asynchronicznym rozwinięciem podsumowania. Nie uznano ich za zakończony odbiór.
- Próba `6ae87f9db6c1950bd8b1e0f1` miała zielony status CI, lecz JUnit ERROR na zimnym onboardingu; końcowe `adb logcat` maskowało kod błędu Maestro. Naprawiono propagację `set -euo pipefail` i zbieranie logów w EXIT trap. Końcowa próba `6ae88184026a0dba67660bb2` / CI `7e296f1` jawnie czeka na natywny `onboarding-skip`: wszystkie kroki SUCCESS, **rzeczywisty JUnit 1/1 SUCCESS**, test 2 min 44 s. Archiwum `android-smoke-onboard-asystent-remontu_6_artifacts.zip`, 3985878 bajtów, SHA-256 `63995ded37687777833679803a9e153603a7580715526029456d5d687857d242`.
- Obejrzany końcowy zrzut Androida pokazuje razem kod 30-001, materiały 307,46 PLN, dostawy 48,90 PLN oraz łączny koszt 356,36 PLN, Realbud + Sewera / dwa zamówienia. Jedna dostawa wyceniona dla kodu, druga według jawnej taryfy krajowej. Widoczny komunikat „Porównanie niepełne” zachowuje rzeczywiste ograniczenie konkurencji. Nie podmieniano odpowiedzi cen/dostaw i nie usunięto końcowych asercji; wcześniejsze nieudane dowody pozostają zapisane osobno.
- Lokalny Windows ma wyłączoną wirtualizację; własne emulatory zostały zatrzymane. Próba fizycznego Firebase Test Lab nie uruchomiła testu: projekt nie ma aktywnych rozliczeń do uploadu GCS. Nie włączano rozliczeń. Włączono jedynie API Testing/Tool Results przez istniejące autoryzowane Firebase CLI; domyślny pusty magazyn FTL ma retencję 60 dni. Upload otrzymał 403; nie utworzono obiektu APK ani macierzy testowej.

## Publiczna pomoc i prywatność

- `https://asystent-remontu-web-production.up.railway.app/pomoc`, `/polityka-prywatnosci`, `/regulamin`: 6 publicznych przypadków 320/390 px PASS, 63 zasoby aplikacji zachowane.
- Źródło hostingu `c3555b380046d0caaea626cf071f45358ff94c2e`, deployment `e108b3eb-f702-4bb7-8198-1c229ee9f4b4` SUCCESS. Wcześniejszą niespójność skompresowanego `release.json` wykrył odbiór i naprawiono przed PASS.
- Stary adres prywatności z Google Play `https://jakatora.github.io/asystent-remontu-privacy/privacy.html` także zaktualizowano: commit `01b29cd319af2020da1155745540fc115f824673`, publiczny HTTP 200. Operator potwierdzony w obu sklepach: Krzysztof Kapusta; usunięto błędną wcześniejszą tożsamość i zapowiedzi mikrofonu/AdID.
- Raport PR180 zaktualizowany o faktyczne wdrożenie i końcowy odbiór W200.

## Pozostałe kroki po stronie sklepów

1. Google już zatwierdziło aktualizację. W Google Play Console → Asystent Remontu → Przegląd publikowania należy kliknąć „Opublikuj zmiany”. [Oficjalne znaczenie stanu i metody zasobu](https://developers.google.com/android-publisher/api-ref/rest/v3/applications.tracks.releases) potwierdzają zatwierdzenie oczekujące ręcznej publikacji; zasób oferuje tylko `list`. Świeży discovery v3 potwierdził brak osobnej metody publikowania zatwierdzonych zmian. Nie tworzono nowej edycji ani ponownego review dla już zaakceptowanego wydania. Oba dostępne narzędzia sterowania przeglądarką / Windows ponownie zwróciły `failed to write kernel assets ... OS error 3`; dlatego przekazano właścicielowi konkretny krok w Console. To brak możliwości kliknięcia, nie brak autoryzacji właściciela. Na Apple pozostaje poczekać na decyzję.
2. Sprawdzać rzeczywisty `releaseLifecycleState` Google dla versionCode 10 oraz stan wersji Apple. `PUBLISHED` / dostępność nowej wersji potwierdza publikację; status przeglądu jej nie zastępuje. Apple ma `AFTER_APPROVAL`; nie wyciągać z tego wniosku o ustawieniach managed publishing Google.
3. Po akceptacji potwierdzić publiczną dostępność 1.2.0 i zapisać wynik. Nie obiecywać czasu oceny sklepów.

Obserwacja do kolejnej wersji: na emulatorze Androida białe ikony systemowego paska są słabo widoczne na jasnym tle. Warto sprawdzić kontrast w jasnym/ciemnym trybie na urządzeniu i ustawić styl jawnie, jeśli problem się potwierdzi. To nie dowód błędu na każdym urządzeniu ani powód wycofania poprawnie zgłoszonego wydania.

Zastane zmiany robocze w głównym repozytorium (m.in. mappings, foilChoice, ean-overlay i lockfile) pozostają poza tym wydaniem i nie są nadpisywane. Cel dalszego rozwoju aplikacji pozostaje aktywny.
