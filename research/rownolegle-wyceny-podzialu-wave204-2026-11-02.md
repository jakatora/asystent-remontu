# W204 — więcej sprawdzonych podziałów dostawy w tym samym limicie

Poprzednia fala W203 była postępem: wdrożyła dwa produkty Viva, zdjęcia i dobór 2/4 kg z rzeczywistą dostawą. Cel rozwoju pozostaje aktywny.

Problem: sekwencja ograniczała liczbę rzeczywiście sprawdzonych wariantów przed upływem wspólnego limitu. Po potwierdzeniu pełnego zamówienia każdy podział na osobne dostawy był sprawdzany kolejno. Przy czterech różnych produktach to 14 prawidłowych podkoszyków; czas wynikał także z sekwencji niezależnych sesji, mimo wspólnej kolejki dopuszczającej trzy koszyki.

Zmiana: najwyżej trzech pracowników na podział jednego zamówienia, każdy koszyk ma osobną sesję. Cały zapas i cena pełnego zamówienia muszą nadal być potwierdzone przed rozpoczęciem. Liczba badanych podziałów nie maleje. Wyniki są składane w kolejności wejścia, więc czas odpowiedzi sklepu nie wybiera innego równorzędnego planu. Dla dużych zamówień pozostaje dotychczasowy oznaczony wybór prób, bez nowej obietnicy pełnego przeszukania.

Wspólna kolejka sprzedawców, limit 80 wycen, limity I/O, kod pocztowy, ważność dowodów, zachowanie opakowań, rabaty koszyka i odmowy ponad stan pozostają obowiązujące. Mutacje jednego koszyka pozostają sekwencyjne. Nie dodajemy taryfy ani stałego kosztu, nie zmieniamy produktów lub danych klienta.

Regresje sterowane: przed zmianą 3 FAIL / 1 PASS (tylko jeden koszyk uruchamiał się naraz), po zmianie 4 PASS. Testy używają rzeczywistych funkcji produkcyjnych i ręcznie kontrolują ukończenie niezależnych obietnic; nie opierają się na kruchym progu ms. Sprawdzają wszystkie 14 podkoszyków, maksimum 3, niezmienność opakowań, brak pracy przed kontrolą pełnego stanu, deterministyczny wynik mimo odwrotnej kolejności odpowiedzi oraz domknięcie prac po błędzie. Nie są benchmarkiem sklepu.

Pricing przed zamrożeniem: 246 PASS /0 FAIL /0 SKIP. Poniżej zapisano ukończone czyste testy, pomiary i wdrożenie.

## Wynik produkcyjny

Stan 2026-11-02T14:39:26.546Z. Source 7c415bfe3871e405dbb40234e68b14a09c623d05; [PR 184](https://github.com/jakatora/przetargai/pull/184), merge 3de3254f538f11dd4d605dcd608f8e60620cd84e. API f0551f99-1bc2-4391-969e-54eacb5761ed SUCCESS, bundle SHA-256 d3996a3ed5e9560188139501d519d8a2eaf70ce95f6d99486fd9145dcb819675. Wspólna strona nadal source970b77dbe2156d24aaa275ac952778f9c9a3f678; UI i binaria sklepowe bez nowej publikacji w tej fali.

Pomiary nie dowodzą znaczącego przyspieszenia. Potwierdzają lepsze wykorzystanie istniejącego limitu czasu:

| Rzeczywisty zimny przypadek | Przed | Po | Wynik |
|---|---|---|---|
| 4 materiały, porównanie sklepów |24778 ms,109 HTTP|24263 ms,109 HTTP|35636 gr z dostawą,identyczne opakowania|
| 3 materiały, wybrany Sewera |23473 ms,5 koszyków/40 HTTP|22642 ms,8 koszyków/64 HTTP|24352 gr z dostawą,identyczne opakowania|

To po jednej parze pomiarów, bez obietnicy SLA. Oba serwisy zaczęły z identycznym cache produktów i pustym cache wycen dostawy; bez podstawionych wyników. W drugim przypadku rośnie liczba pełnych odczytów koszyka i checkoutu, a nie tylko liczba nieukończonych zapytań. Czas nadal dochodzi do pierwotnego deadline. Pierwszy zbyt ścisły walidator oczekiwał równej liczby HTTP i poprawnie zasygnalizował różnicę40/64; zachowano obie surowe odpowiedzi. Późniejsza analiza tych samych danych potwierdziła, że pracy jest więcej. Nie ponawiano pomiaru, aby wybrać korzystniejszy wynik.

Wybrany Sewera dla wszystkich4 materiałów pozostaje niepełny, ponieważ nie ma oferty wybranego gruntu. Brakująca pozycja1 i bestnull są zachowane; scenariusz3 materiałów jest odrębnym jawnym koszykiem. Nie usuwamy gruntu z koszyka użytkownika, aby uzyskać cenę.

- Czyste testy246 pricing / 168 API lib / 594 mobile / 1064 shared PASS, zero fail/skip; typy API/mobile, build pricing i 66 legacy IDs PASS. Zestawy pokrywają się. GitHub statuses[] — nie ogłaszamy zielonego CI.
- Lokalnie i publicznie po 8 przypadków UI, 6 odpowiedzi API i 9 przypadków HTTP; dodatkowo rzeczywisty publiczny wybrany koszyk3 materiałów. Zero pageerror i429, bez wstrzykniętych wycen.
- Pełny remont malowania nadal30746+4890=35636gr; sześcioproduktowy koszyk z profilami zachowuje wszystkie pozycje oraz niewyceniony indywidualny transport. Viva 5 kg nadal10983gr z dostawą przy doborze 2/4 kg zamiast13378gr dla 2 × 4 kg;15 kg i stary CE40 bez fałszywej ceny.
- Produkcyjny odczyt 150 plików zgadza się z paczką;149 pozostałych plików bez zmian,378 obserwacji seed identycznych. Skan 41 wrażliwych wartości vaulta: brak ujawnionych kluczy. Katalog nadal255 refs / 222 confirmed / 336 offers / 33 jawne luki. Liczba ofert spadła z 337: bieżąca karta FUGI.PL potwierdza brak Mapeband W 10 m (GTIN 8022452113932), a WinBud nadal potwierdza ten sam produkt. Utrata jednej oferty nie jest ukrywana ani zastępowana starą ceną; liczba referencji z ofertą nadal wynosi 222.
- Cache 375→375, wszystkie starsze zachowane lub nowsze; historia15066→15354, zachowano15029, usunięto37 tylko zgodnie z retencją{"60_point_retention":37}, nieoczekiwana utrata0. Pięć obcych plików roboczych ma niezmienione hashe.

Przegląd ścieżki pieniędzy: sumy brutto rzeczywistych pełnych opakowań oraz osobno potwierdzone koszty każdego zamówienia, zachowane sztuki i zapas. Nie ma wykonania płatności, refundów, zamówień ani płatnego AI. Wspólna kolejka, kontrola całego zapasu przed podziałami, daty ważności i kod pocztowy bez zmian; unknown≠0. Dowód rzeczywisty stanowią odpowiedzi HTTP i UI produkcji, nie tylko testy jednostkowe.

Artefakty: G:/Projekty/asystent-remontu-work/wave204-20261102/final-proof.json, benchmark-proof.json, benchmark-selected-three-proof.json, benchmark-selected-three-cases.json, local-mixed-qa.json, production-mixed-qa.json i production-selected.json. Nadal pozostaje przyspieszenie zimnych koszyków i 33 luki katalogu. Cel dalszego rozwoju ACTIVE.
