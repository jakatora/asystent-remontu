# Kronosfera: LK100F i dostawa całego zamówienia — 2026-10-26

Katalog po wdrożeniu: **76/103 produktów z ofertą, 27 bez potwierdzonej oferty, 102 aktywne oferty, 34 sklepy i 19 integracji automatycznej dostawy**. Zdjęcia przypisane do 103 referencji. To pokrycie obecnego katalogu, nie całego rynku ani gwarancja dostawy z każdego sklepu.

## Tożsamość produktu

Źródło: https://kronosfera.pl/k/listwa-przypodlogowa-lk100f24-9002,2068. Biała listwa MDF KronoOriginal, SKU LK100F24-9002, produkt 2068, 2400 × 14 × 100 mm, jedna sztuka = 2,4 mb. Cena brutto odczytana z karty i prawdziwego koszyka: 31,99 zł za sztukę.

Karta sklepu nie publikuje GTIN. Powiązanie z katalogową referencją EAN 5907555424969 jest zatwierdzonym powiązaniem modelu i SKU, a nie rzekomym odczytem kodu kreskowego ze sklepu ani dopasowaniem przybliżonym.

- Katalog producenta: https://kronosfera.pl/storage/file/core_files/2025/8/28/b4e17905d0344c0061ea8e07ee80bb72/KRONOSTEP_2025_22072025_PL_EN_web.pdf, drukowana strona 77, PDF indeks 38. Tabela wskazuje LK100F24-9002 → LK100F i wymiary 2400 × 14 × 100 mm w sekcji białych listew MDF. Odczyt tekstowy oraz obejrzana renderowana strona.
- Niezależna referencja modelu i EAN: https://www.obi.pl/p/7240922/kronospan-listwa-przypodlogowa-biala-lk100f-frez.

Reader wymaga dokładnego SKU i identyfikatora, producenta, koloru, wszystkich wymiarów, jednostki, formularza zakupu, widocznej ceny brutto i zgodnych danych JSON-LD. Sprzeczny opublikowany GTIN odrzuca ofertę.

## Rzeczywisty koszyk i dostawa

Warunki: https://kronosfera.pl/dostawa. Dla podłóg i akcesoriów tego kanału nie ma odbioru własnego. Nie wolno sugerować siedziby firmy jako punktu odbioru. Dostawy realizowane są z zakładu w Strzelcach Opolskich, na terenie Polski, bez wniesienia.

Każda wycena używa świeżego anonimowego koszyka, sprawdza jego pusty stan, dodaje zatwierdzony produkt i odczytuje pierwszy ekran koszyka. Nie przekazuje danych klienta, nie przechodzi do kolejnego kroku, nie akceptuje regulaminu i nie składa zamówienia. Wycena to jawnie oznaczona taryfa krajowa (`retailer_basket_national`, PL), nie pozorowane sprawdzanie pełnego adresu dla kodu pocztowego.

| Sztuki | Materiały brutto | Dostawa | Razem |
|---:|---:|---:|---:|
| 1 | 31,99 zł | 87,49 zł | 119,48 zł |
| 2 | 63,98 zł | 87,49 zł | 151,47 zł |
| 14 | 447,86 zł | 174,98 zł | 622,84 zł |
| 79 | 2527,21 zł | 0,00 zł | 2527,21 zł |

Koszyk stosuje wagę / rozmiar i własną regułę darmowej dostawy. Nie dodano stałej stawki zastępczej. Przy darmowej dostawie parser usuwa przekreśloną dawną stawkę i wymaga zgodności wszystkich aktualnych podsumowań, liczby sztuk oraz ceny pozycji. Wybrana przedpłata ma koszt 0 zł.

## Poprawka liczby opakowań

Test zbudowanego serwera wykrył, że `33.6 / 2.4` daje `14.000000000000002`, co przy bezpośrednim `Math.ceil` zamawiało 15 sztuk. Wspólna funkcja rozpoznaje wyłącznie szum zmiennoprzecinkowy w tolerancji 4 ULP przy dodatnich liczbach całkowitych. Rzeczywisty nadmiar nadal wymaga kolejnego opakowania, dodatnia ilość nigdy nie kupuje zera, a wielokrotności partii są zachowane. Automatyczna dostawa i koszt awaryjny optymalizatora używają tej samej funkcji.

## Weryfikacja i wdrożenie

- 336 testów aplikacji / API / wycen i 1054 testy wspólnego backendu: PASS, 0 pominiętych. Typecheck API i mobile: PASS. 66 chronionych identyfikatorów i testy negatywnych mutacji: PASS.
- Rzeczywiste HTTPS sklepu, lokalny HTTP zbudowanego runtime i produkcyjne HTTPS: ilości 1/2/14/79, połączenie 1,2 + 1,2 mb w jedną sztukę, dwa kody pocztowe, wykluczenie odbioru. Pełny katalog: 76 rozpoznanych, 27 braków, brak pełnej sumy przy brakujących produktach.
- Oryginalne trzy prace: niezmienione 790,83 zł z dostawą. UI potwierdził 119,48 zł dla jednej sztuki i 622,84 zł dla 14 sztuk; własne dodatki testowe usunięto, trzy prace przywrócono. Testowy koszyk sklepu opróżniono.
- PR https://github.com/jakatora/przetargai/pull/25, commit źródłowy `58764e5e0347bf8d8f2cfc53b5bb369366f18a1a`, merge `d64ebf314c1b8be4a361f0f3383c3e29ac4d9e0a`.
- Railway deployment `ae70c7f9-e962-4cc8-9cec-127d9d13d801`: SUCCESS 2026-10-26T01:52:45.932Z. Health 200 i auth/me 401.
- Automatyczny kolektor ponownie odczytał nową ofertę o 2026-10-26T01:53:18.958Z, aktywna, bez błędu. To osobne potwierdzenie od świeżych wycen koszyka.
- Zachowano wszystkie wcześniejsze 103 obserwacje, w tym dwie wyłączone. Nowych zarejestrowanych jest 104. Świeży snapshot serwera SHA256 `c360d46655a3a06c5da380d3f7d38664fbcd597bb78ba3dc2a227d6673026e92`; tuż przed wdrożeniem potwierdzono zgodność wszystkich 148 plików produkcyjnego źródła. Wydanie zmienia tylko `src/services/remont-pricing.cjs` i `src/data/remont-verified-offers.json`; inne aplikacje współdzielonego serwera pozostają zachowane.

Dowody poza repo, w katalogu czatu `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/`: `work/catalog-wave17-production-proof.json`, `work/catalog-wave17-local-live-proof.json`, `work/catalog-wave17-predeploy-baseline-proof.json`, `work/catalog-wave17-core-tests.log`, `work/catalog-wave17-shared-tests.log`, materiały źródłowe w `work/catalog-wave17-research/`, zrzuty w `outputs/kronosfera-*-20261026.*`.

Skille: money-path-review — faktyczne kwoty brutto, izolacja wspólnego serwera, brak oferty / dostawy nie jest zerem, dowód prawdziwego HTTP i UI; use-railway — aktualizacja istniejącego serwisu z zachowaniem innych aplikacji. Bez zmiany migracji, zależności i cudzej pracy. Frontend zweryfikowany w lokalnym Expo; nie jest to nowe wydanie mobilne do sklepów.

Pozostaje 27 referencji, dalsze oferty i zdjęcia nowych produktów, lokalne stany i ceny, dostawy Castorama / OBI oraz usprawnienia kompletowania remontu. Pełny cel pozostaje aktywny.
