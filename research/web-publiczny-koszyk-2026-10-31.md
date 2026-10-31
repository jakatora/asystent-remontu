# Publiczna aplikacja webowa i sprawdzenie wspólnego koszyka — 31.10.2026

## Zakres

Udostępniamy rzeczywistą aplikację Expo, z kalkulatorem, zapisami projektów, zdjęciami i koszykiem całego remontu. Sam portal Vite nie zawiera tych przepływów. Frontend korzysta z istniejącego API `https://backend-production-a43e3.up.railway.app/api/remont`; nie powstał kolejny backend API.

Przygotowanie wydania wymaga czystego, zapisanego commita. Skrypt `artifacts/mobile/prepare-web-release.mjs` sam eksportuje Expo, sprawdza niezmienność źródła, odrzuca nieoczekiwane pliki i tworzy samodzielną paczkę z manifestem SHA256. Wydawane są skompilowane zasoby i trzy pliki serwera, bez repozytorium, kluczy, bazy użytkownika ani zależności deweloperskich.

## Działanie w przeglądarce

- Serwer obsługuje bezpośrednie wejścia do ekranów, właściwe MIME JavaScript/WASM, kompresję, cache i ponowną walidację ETag. Brakujący skrypt zwraca 404, a nie HTML aplikacji.
- SQLite wymaga izolacji kontekstu przeglądarki. Nagłówki COOP `same-origin` i COEP `credentialless` działają razem z zewnętrznymi zdjęciami. Źródła: [Expo SQLite](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/#web-setup), [MDN COEP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy).
- Polski język dokumentu i opis są ustawione w konfiguracji eksportu Expo. Nazwa aplikacji jest spójna na powitaniu i w ustawieniach, a wersja ustawień pochodzi z `app.json`. Przyciski Tailwind korzystają z istniejącej ciemniejszej barwy podstawowej.
- Pomoc, informacja o przetwarzaniu danych i zasady wersji rozwojowej są dostępne również bez uruchamiania bazy. Opisują faktyczne połączenia z API i sklepami. Nie publikujemy zastępczych danych właściciela ani niepotwierdzonego adresu kontaktowego w wersji webowej.
- Zapis jest lokalny dla przeglądarki i adresu. Projekty spod `localhost` nie migrują automatycznie na nową domenę. Nie ma jeszcze synchronizacji ani narzędzia przenoszenia zapisów między tymi adresami.

## Opakowania i rzeczywisty koszyk

Naprawiono prezentację opakowania Marvo: **2,235 m²**, zamiast skrócenia do 2,23. Wymiar opakowania zachowuje własną precyzję, niezależną od dwóch miejsc po przecinku dla pieniędzy. Koszyk i podział zamówień używają polskich separatorów i jednostki m². Obliczenia kwot, EAN-y i ilości pozostały bez zmian.

Test w headless Edge korzysta z osobnego profilu QA. Projekty powstają przez prawdziwy formularz, bez wpisywania danych bezpośrednio do SQLite. Dwa pokoje po 5 m², Marvo i podkład Volden, dają łącznie **5 paczek paneli oraz 2 paczki podkładu**. Lokalny wydany build potwierdził:

| Wariant | Materiały | Dostawa | Razem |
|---|---:|---:|---:|
| Dwa osobne zamówienia w LiderzyCen | 981,86 zł | 130,00 zł | **1111,86 zł** |
| Jedno wspólne zamówienie tych produktów | 981,86 zł | 600,00 zł | 1581,86 zł |

Panel ma dostawę 110 zł, podkład 20 zł. Różnica transportu to 470 zł. UI jasno wymaga dwóch osobnych zamówień. Taryfa LiderzyCen dotyczy Polski; kod `00-001` jest syntetycznym kodem testu, nie dowodem indywidualnej wyceny tego kodu przez ten sklep. Zakres ograniczonego wyszukiwania jest widoczny. To najtańszy potwierdzony wariant badanego zestawu w dostępnych ofertach, nie minimum całego rynku.

## Kontrole przed publikacją

Czysty checkout: 383/383 testy aplikacji bez skipów, typecheck PASS. Serwer: 4/4 testy rzeczywistego HTTP, w tym ścieżki, MIME, izolacja, kompresja, HEAD, cache, niepoprawne adresy i niedostępność wymaganych zasobów. Legacy: 66 prac i chronione ID zachowane.

Końcowy eksport commita `dcb753462e28667cbec47544a3bed466611c4c73`: 63 zasoby, 17 052 375 bajtów. SHA256 każdego pliku sprawdzony. Skan porównał paczkę z 75 odpowiednio długimi wartościami vaulta; brak dopasowań, wartości nie były logowane. Bundle `entry-ae77a8bf7f52d91499a1a51833aff1ee.js`.

Lokalne QA tego wydania: dwa wcześniejsze projekty przetrwały aktualizację i ponowne odświeżenie, `crossOriginIsolated=true`, obie fotografie HTTP/obraz załadowany, API HTTP200, zero błędów strony i żądań. Szerokości 1250 oraz 390 px nie powodują poziomego przepełnienia. Zrzuty i szczegółowe JSON-y pozostają poza repo w `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/work/`.

## Wdrożenie i dalsza weryfikacja

Utworzono osobny statyczny frontend Railway `asystent-remontu-web`, service `99ab922f-4db0-4aa8-a199-f0fc3d556a3a`, w istniejącym projekcie `d7028938-8b39-4add-9242-98192f135bc8`, production `cf9b7fcd-49fe-4ed6-a22a-fb02054625e6`. Publiczna domena: `https://asystent-remontu-web-production.up.railway.app`. Wspólny backend nie był wdrażany w tej fali.

Pierwszy deploy `8be4ca56-1eca-4edf-9524-ea9b839d981c` uzyskał status SUCCESS, lecz kontrola każdego publicznego pliku wykryła 404 fontów. Brakowało gotowych `assets/node_modules` z fontami i WASM Expo. Zawężenie reguł `.gitignore` i `.railwayignore` nie rozwiązało problemu. Drugi deploy `98c48940-6111-4774-87be-bf5ded1db7f1` został prawidłowo odrzucony nowym healthcheckiem503, który sprawdza obecność wszystkich zasobów manifestu.

Odczytano [rzeczywisty kod CLI Railway4.61.1](https://github.com/railwayapp/cli/blob/v4.61.1/src/controllers/upload.rs): pomija on każdy element ścieżki o nazwie `node_modules`, niezależnie od reguł ignorowania, również z `--no-gitignore`. Wydanie przesyła więc zweryfikowane zasoby we własnym archiwum `web-build.tar.gz`, 6 958 541 bajtów, rozpakowywanym przy budowaniu obrazu Node24 Alpine. Lokalnie rozpakowano archiwum do nowego katalogu i sprawdzono63/63 SHA256. Sam eksport nie jest modyfikowany ani nie zmienia nazw ścieżek. Builder DOCKERFILE potwierdzono w aktualnym schemacie Railway.

Końcowe wdrożenie `7c62525d-9871-4852-9522-0ce40ceb7a8d`: **SUCCESS**. Publiczny HTTPS potwierdził commit `dcb7534`, health `missingAssetCount=0`, wszystkie **63/63 zasoby o zgodnym SHA256**, prawidłowe nagłówki i MIME WASM. Osiem ekranów/stron pomocniczych odpowiada200; brakujące zasoby, `.env` i kod serwera odpowiadają404. API zachowało248 aktywnych ofert i168 produktów.

W prawdziwej przeglądarce pod publiczną domeną utworzono przez formularz nowe dwa syntetyczne projekty QA i wybrano je do wspólnego koszyka. Produkcyjne API zwróciło200, a UI pokazało5 paczek Marvo i2 Volden, materiały98186gr, dostawy13000gr, całość111186gr. Rozdzielenie zamówień i oszczędność47000gr są widoczne. Obie fotografie500px oraz ikony są załadowane. Projekty, wybór prac i kod00-001 pozostają po odświeżeniu; SQLite ma działającą izolację i SharedArrayBuffer. Kontrola szerokości1250/390px: bez poziomego przepełnienia, zero błędów strony i nieudanych żądań. To QA headless Edge; nie jest dowodem przetestowania Safari ani natywnej aplikacji na telefonie.

Zapytania o długoterminową historię tych dwóch produktów otrzymują oczekiwane404 `verified_history_unavailable`; klient traktuje je jako brak potwierdzonej historii, nie wymyśla wykresu. Lokalne porównywanie cen po odświeżeniu pozostaje osobną funkcją. Ten etap nie dodaje serwerowej historii cen.

Ścieżka pieniędzy: sumy w całkowitych groszach i faktyczne kwoty wyceny, dokładne jednostki opakowań, jawny zakres taryfy PL i ograniczonego wyszukiwania. Potwierdzenie rzeczywistości: produkcyjny HTTP oraz pełny przepływ UI z odpowiedzią istniejącego API. Nie składano zamówienia ani nie uruchamiano płatności.

Dowody lokalne: `work/web-production-http-wave139.json`, `work/web-production-qa-wave139.json`, `work/web-production-basket-wave139.png`, `work/web-production-mobile-wave139.png`, `work/mobile-clean-final-tests-wave139.log` oraz `work/web-release-integrity-wave139.json`. Obce WIP `ean-overlay.ts`, `mappings.ts`, lockfile, `.atlas` i `PROPOZYCJE-COCKPIT.md` nie są częścią wydania.

Cel rozwoju pozostaje aktywny. Wydanie webowe nie jest publikacją iOS/Android. Następne obszary: dokładne warianty wykładziny klejonej, pozostałe referencje bez potwierdzonych ofert, dostawy wymagające dostępu sklepów oraz przenoszenie projektów między adresami/urządzeniami.
