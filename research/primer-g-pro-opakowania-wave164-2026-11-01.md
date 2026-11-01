# Primer G Pro: automatyczny dobór opakowań całego remontu — 2026-11-01

## Wynik i zakres

Użytkownik może wybrać automatyczny zestaw kanistrów Mapei Primer G Pro 1/5/10/20 l, osobno w projekcie i we wspólnym koszyku. Domyślnie zachowujemy jego dotychczasowy wybór. Zmiana wspólnego koszyka nie nadpisuje projektów. Zapasy odliczamy przed doborem opakowań; ilości z kilku projektów łączymy przed sprawdzeniem pełnego kosztu produktów i dostawy. Obmiary i lista zakupów nie zmieniają się wskutek wyboru.

To rozszerzenie istniejących zweryfikowanych produktów, bez nowego sklepu lub produktu. Cztery kanistry pozostają odrębnymi produktami z własnym GTIN, ofertą, zdjęciem i linkiem. Rodzina `mapei-primer-g-pro-litres-v1` jest zamkniętą listą w kodzie produkcyjnym:

| Zawartość koncentratu | GTIN |
|---|---|
| 1 l | 8022452241123 |
| 5 l | 8022452241130 |
| 10 l | 8022452241147 |
| 20 l | 8022452241154 |

Nie łączymy starszych kodów Primer G, kilogramów, nazw podobnych produktów ani dowolnych GTIN przesłanych przez klienta. Wody do rozcieńczania nie dodajemy do ilości koncentratu. Źródła pierwotne produktów i rozdział GTIN opisano w [wave163](mapei-grunt-hydroizolacja-wave163-2026-11-01.md). Każdy wybrany kanister ma własną aktualną kontrolę ceny; nowa rodzina odświeża te cztery ceny także bez ręcznego żądania odświeżenia, z istniejącym ograniczonym cache. Nie zmienia to domyślnego odświeżania innych produktów.

## Zachowanie i przykłady

| Potrzeba / wybór | Potwierdzony zakup | Materiały | Dostawa | Razem |
|---|---|---|---|---|
| 6 l, zachowaj 5 l | 2 × 5 l | 159,80 zł | 17,99 zł | 177,79 zł |
| 6 l, automatycznie | 5 l + 1 l | 117,80 zł | 10,50 zł | 128,30 zł |
| 11 l, automatycznie | 10 l + 1 l | 177,80 zł | 21,00 zł | 198,80 zł |
| 21 l, automatycznie | 20 l + 1 l | 286,90 zł | 35,99 zł | 322,89 zł |
| Dwa projekty po 3 l, oba automatyczne | 5 l + 1 l | 117,80 zł | 10,50 zł | 128,30 zł |
| Projekt A: 3 l, zapas 1 l; projekt B: 3 l, oba automatyczne | 1 × 5 l | 79,90 zł | 10,50 zł | 90,40 zł |
| 6 l automatycznie + Mapegum WPS 20 kg | 5 l + 1 l + 20 kg w Rab-Dom | 502,80 zł | 0 zł | 502,80 zł |
| 3 l automatycznie + Mapegum WPS 20 kg | 5 l Rab-Dom + 20 kg WinBud | 447,60 zł | 30,00 zł | 477,60 zł |

Kwoty są obserwacjami z 2026-11-01. Taryfa sklepów jest krajowa PL (`retailer_basket_national`), nie indywidualnie potwierdzona dla adresu; formularze używały 30-001. Stawki i darmowy transport pochodzą z rzeczywistego koszyka sklepu, bez nowych stałych stawek/progów w kodzie. Nie składano zamówień ani nie przekazywano kontaktu użytkownika.

Dla 11/21/55 l oraz zachowanego 1 l w mieszanym koszyku porównanie zgłasza `searchLimited`: UI i skopiowany plan mówią, że sprawdzono wybrane pełne zestawy. Przykład 55 l daje 5 × 10 l + 5 l za 779,40 zł z potwierdzoną dostawą 0; nie jest dowodem globalnego minimum. Zachowane pojemności pozostają wymaganiem: 3 l w kanistrach 1 l z jednego projektu nie mogą zostać bez zgody zastąpione dużym kanistrem tylko dlatego, że drugi projekt wybrał automat.

## Trwałość i poprawka małych ilości

Wybory `remont.primer-package-choice.v1:<projectId>` mają ścisły parser i kolejkę zapisu. Nawigacja, wspólny koszyk i eksport kopii czekają na bieżący zapis. Błąd zapisu zachowuje poprzedni wybór i poprzednią wycenę. Błąd odczytu wstrzymuje pełną wycenę i daje ponowny odczyt. Kopia/odtworzenie przenosi wybory projektów i wspólnego koszyka razem z zapasem. Uszkodzone preferencje w archiwum są odrzucane.

Przed końcowym wydaniem R2 wykryto i odtworzono błąd tolerancji: dodatni brak `1e-8 l` mógł dać pusty plan za 0, a mały dodatni wymóg zachowania 5 l mógł zostać pominięty. Publiczne API wersji R1 i czerwone testy potwierdziły oba przypadki. Poprawka wymaga fizycznego opakowania dla każdej dodatniej potrzeby i każdego dodatniego wymogu pojemności, zachowując tolerancję zaokrągleń dla niepustego planu. Po poprawce te przypadki dają odpowiednio 1 l za 48,40 zł i 5 l za 90,40 zł z dostawą. Zapas równy zapotrzebowaniu nadal nie wywołuje zakupu. Testy są dodane do kodu produkcyjnego, nie tylko do skryptów kontrolnych.

## Weryfikacja

- 100 testów adapterów/API/relay, 471 aplikacji, 179 pricing i 1064 współdzielonego backendu: **1814 PASS, 0 FAIL, 0 SKIP**. Testy czystego checkoutu nie obejmują obcego WIP. Build biblioteki pricing i typy aplikacji/API przechodzą.
- 12 rzeczywistych wycen przygotowanego API: 10 zwykłych koszyków i dwa przypadki małej dodatniej ilości. Nie podmieniano odpowiedzi sklepów.
- Siedem wycen publicznego API przed publikacją WWW: 128,30 / 322,89 / 128,30 / 211,59 / 502,80 / 48,40 / 90,40 zł, wszystkie z czterema potwierdzonymi cenami gruntu i pustym `failedOfferIds`.
- 26 scenariuszy przeglądarki lokalnie i 26 publicznie: wybór i błąd zapisu, ilości 6/11/21 l, dwa projekty z niezależnymi ustawieniami, wspólny wybór, zapas pełny/częściowy/minimalny brak, kopia do drugiej przeglądarki i reload. Dwa rzeczywiste zdjęcia 1/5 l załadowane. Szerokość 390 px bez overflow, polski dokument, izolacja przeglądarki, zero błędów JS i HTTP429. Publiczne API bez podmiany odpowiedzi.
- Własne profile QA i sztuczne projekty; żadnej edycji projektów użytkownika. Awarie zasymulowano wyłącznie we własnym localStorage. Nie ma testu fizycznego Androida/iOS ani badania z klientami.
- Bez zmian migracji, pomiarów, zależności i chronionych 66 identyfikatorów. Zachowany rozdział rich/legacy oraz wcześniejsza rodzina farby V33.

## Publikacja i dowody

Kod funkcji `abc604b3beff67ac954483d876a969bec65b6da4`; poprawka R2 `81fd184008be9748a6d4375f5b41e636de11adf6`. Backend: [PR153](https://github.com/jakatora/przetargai/pull/153) i [PR154](https://github.com/jakatora/przetargai/pull/154), merge poprawki `b01c59f9a5b37f98eef40ecf8a77a863126a1bec`. Nowy runtime SHA256 `d817cc48d0dd0ce53ff8b34a266436080ed8d9ac80751c0d5a52efcc1a4dd437`.

R2: API `c56e002f-8f99-48fc-8933-2953665d3e15` i WWW `52203330-407c-4dc3-b1f7-1b8b074f4a5f` — oba **SUCCESS**. Publiczna strona: https://asystent-remontu-web-production.up.railway.app/renovation-basket. Wcześniejsze wdrożenia R1 są zastąpione; końcowe dowody odnoszą się do poprawki R2.

Świeży snapshot, preflight i snapshot po publikacji: 150 plików backendu; zmieniony wyłącznie `src/services/remont-pricing.cjs`, pozostałe 149 plików i wszystkie 329 obserwacji zachowane. Wszystkie 150 wdrożonych plików identyczne z przygotowanym wydaniem. Siedem plików WWW serwera/config identycznych z R1; SHA prywatnego relay `b775872ce99a9c7b0b3c98ea2b71ad73d92582da720926692c67471ce7fe2aab`. Lokalny build: 63 pliki, 17 200 811 bajtów, zero dopasowań 76 wartości vaulta. Publicznie 63 pliki sprawdzone SHA256, 9 tras, WASM i nagłówki izolacji; prywatne pliki 404, niepodpisany endpoint 401. Publiczny audyt 230 referencji: 197 z aktualną ofertą, 291 aktywnych ofert, 4 odrębne SKU bez EAN, zero pominięć i fałszywych potwierdzeń. Bez nowego serwera, klucza, płatnego API lub cyklicznego zadania.

Dowody: `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/work/primer-family-native-proof-wave164-r2.json`, `primer-family-cloud-before-web-proof-wave164-r2.json`, `primer-family-{local,production}-qa-wave164-r2.json`, `primer-family-production-purchase-plan-wave164-r2.txt`, `primer-tiny-public-before-fix-wave164.json`, czerwone/zielone logi `primer-tiny-regression-*-wave164*.log`, logi `*-wave164-r2*.log`, `web-release-integrity-wave164-r2.json`, `web-server-compatibility-wave164-r2.json`, `web-production-http-wave164-r2.json`, `catalog-identity-production-audit-wave164-r2.json`. Skrypty z własnymi profilami i katalogami wydania są initializerami; nie uruchamiać ich ponownie na tych samych ścieżkach.

## Kolejne kroki

33 wcześniejsze referencje bez aktualnej ceny pozostają do zweryfikowania. W tej partii nie naprawiono niepotwierdzonych dostaw eTak/ABUD ani nie wdrożono indywidualnej wyceny kodu dla wszystkich sklepów. Kolejne opakowania Mapegum 5/10 kg wymagają osobnego odwzorowania nowych GTIN; nie wolno aliasować starszych bez dowodu. Katalog ma nadal 230 referencji — to nie jest pełne pokrycie rynku.

Rozwój biznesowy nadal wymaga obserwowanych prób z użytkownikami. Techniczne QA koszyków nie zastępuje walidacji popytu. Afiliacja, cennik i płatności nie są uruchomione w tej partii. Obce WIP pozostawione nietknięte. Cel ciągłego rozwoju pozostaje **ACTIVE**.
