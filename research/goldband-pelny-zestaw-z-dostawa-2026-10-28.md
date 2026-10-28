# Goldband — pełny wybrany zestaw z dostawą, 28.10.2026

Dla dwóch istniejących próbnych pokoi koszyk pokazuje teraz pełny koszt trzech wybranych zakupów materiałowych: **913,35 zł z dwiema dostawami**. Wcześniej brakowało wyceny transportu tynku. Kontrola ujawniła również, że dotychczasowy sklep ma za mały zapas na te prace. Dodano drugą ofertę tego samego EAN i wykorzystano istniejący adapter anonimowego koszyka.

## Dostępność i alternatywna oferta

[Krasny — Goldband 25 kg](https://krasny.pl/gips-goldband-25-gips-tynkarski-goldband-25kg-id-5902367206383) pokazuje 49,89 zł brutto i **2 sztuki w Magazynie Centralnym**. JSON-LD `InStock` nie potwierdza dowolnej liczby worków. Przy 12 workach prawdziwy koszyk ostrzega o przekroczeniu zapasu i oczekiwaniu na dostępność. Podaje wtedy 369 zł za paletę, ale nie jest to dowód bieżącej dostępności całego zamówienia. Nie przenosimy do wyceny starego ogólnego cennika dostaw sklepu z 2022 r.

Nowy czytnik `krasny-stock.ts` jest ograniczony do dokładnego źródła, EAN, jednostki i worka 25 kg. Czyta jeden widoczny blok zapasu oraz jeden wskazany magazyn. Brak, sprzeczne lub nieprawidłowe dane nie stają się nieograniczonym zapasem. Zero jest potwierdzonym brakiem. Nie uruchamia kodu strony ani nie korzysta z ilości dopuszczonej do zamówienia z oczekiwaniem. Dotychczasowy silnik otrzymuje `maxPackages` i blokuje za mały zapas. Odbiór Krasnego wymaga potwierdzenia.

[LiderzyCen — Goldband 25 kg](https://liderzycen.pl/pl/p/Tynk-gipsowy-reczny-Knauf-Goldband-25-kg/55390) potwierdza **30,38 zł brutto za cały worek**, a nie 24,70 zł netto. EAN **5902367206383**, numer producenta **96107**, odpowiada workowi 25 kg w [tabeli Knauf](https://knauf.com/pl-PL/p/produkt/knauf-goldband-10265_0120). Sklep: produkt 55390, SKU `ctma_5902367206383`, stockId 55478, jednostka zakupu `szt.`. Zmienione EAN, SKU, jednostka lub zawartość worka odrzucają odczyt. Nie dodano nowego unikalnego produktu ani sklepu — jest dodatkowa oferta obecnego produktu.

Rzeczywiste anonimowe koszyki dla 1, 6 i 12 worków potwierdziły po **230 zł kuriera** „Kurier Materiały Budowalne 20” przy Przelewy24. Widoczny sklepowy koszyk 12 worków zgadza się z adapterem: **364,56 + 230,00 = 594,56 zł**. To aktualna taryfa dla Polski, nie indywidualna wycena adresu. Nie wprowadzano danych klienta, nie akceptowano regulaminu ani nie składano zamówienia. Zdjęcie Goldband w aplikacji zastąpiono większą fotografią nowego sklepu.

Cena referencyjna w aplikacji również wynosi teraz 30,38 zł za worek i dokładnie 1,2152 zł/kg, z nową datą i źródłem. Dawne zapisane kalkulacje zachowują historyczne dane; bieżący koszt zakupów pochodzi z porównania ofert. Pojawienie się tańszego sklepu nie jest zgłaszane jako obniżka historycznej ceny innej oferty.

## Wspólny koszyk i wybór sklepu

Dwa pokoje po 10 m², Goldband 15 mm, 10% zapasu, zbrojenie 2 i 3 m² oraz jawnie zerowy zakup narożników:

| Zakup | Opakowania | Materiały | Dostawa |
|---|---:|---:|---:|
| Goldband — LiderzyCen | 12 × 25 kg | 364,56 zł | 230,00 zł |
| Betokontakt i Profix — Realbud | 1 × 5 kg + 1 × 50 m² | 293,79 zł | 25,00 zł |
| Razem | | **658,35 zł** | **255,00 zł** |

Łącznie **913,35 zł**. Jeden pokój ma 476,07 zł materiałów i 255 zł dostaw, razem **731,07 zł**. Wspólne opakowania dla dwóch pokoi nadal oszczędzają 293,79 zł na gruncie i siatce. Narzędzia i robocizna są osobno. Nie porównujemy nowej pełnej kwoty ze starą kwotą bez nieznanej dostawy jako oszczędności całego zamówienia.

Wybór Krasnego pokazuje, że zgłoszony zapas 50 kg nie pokrywa 280,5 kg zapotrzebowania. To opis jawnego ograniczenia, zamiast mylącego „brak cen”. Ten sam brakujący tynk z dwóch pokoi jest pokazany raz jako 280,5 kg. Grunt i siatka pozostają dwiema pozostałymi brakującymi pozycjami; nie powstaje pozorna cena pełnego koszyka. Wybór LiderzyCen pokazuje 364,56 zł za dostępną część materiałów i jawny brak dwóch pozostałych produktów.

Wyjaśnienie zapasu uwzględnia skonsolidowane zapotrzebowanie. Powtórzona oferta w dwóch pokojach jest jednym zapasem. Nieznanych ilości, rozbieżnych zapisów i niezgodnych jednostek nie interpretuje jako niedoboru. Nie zmienia serwerowych kwot, planu zakupu ani kompletności koszyka.

## Sprawdzenia i wdrożenie

721 testów kalkulatora, cen i API oraz 1054 testy wspólnego backendu: PASS, bez pominiętych testów. TypeScript aplikacji i API: PASS. 12 rzeczywistych zapytań produkcyjnego HTTP obejmuje pełny zestaw jednego i dwóch pokoi, niedobór Krasnego, częściowy wybór sklepu, niepotwierdzony odbiór i nieprawidłowe parametry. Osobno potwierdzono brak fałszywego alertu zmiany ceny po dodaniu sklepu. Trzy adresy źródeł: 0 błędów, 1 ostrzeżenie antybotowe Knauf; tabelę producenta odczytano narzędziem WWW. Kontrola ID i negatywne próby walidatora: PASS.

[PR72](https://github.com/jakatora/przetargai/pull/72) scalony jako `23429d413bc54749df3e6352818233ea9e3bdf2f`. Railway `2142c3a0-2d1c-4310-944a-a51f7ab59468`: SUCCESS. Wszystkie 148 produkcyjnych plików zgodne z wydaniem; zachowano 146 pozostałych plików i 212 pozostałych obserwacji. Odnowiono zapas Krasnego i dodano jedną ofertę; razem 214 źródeł. Brak uruchomień GitHub Actions nie oznacza zielonego CI.

Rzeczywisty UI po przeładowaniu zachował dwa wybrane pokoje, kod 00-001 i pełną kwotę 913,35 zł. Wybranie Krasnego pokazało zapotrzebowanie 280,5 kg i zgłoszone 50 kg, trzy połączone pozycje bez wyceny oraz brak pełnej kwoty. Wybranie LiderzyCen pokazało 364,56 zł za część materiałów i dwie brakujące pozycje. Przywrócono najtańszy zestaw i sprawdzono rzeczywiste załadowanie wszystkich trzech zdjęć; nowe Goldband ma 340 × 800 px. Nie tworzono ani nie edytowano projektów; liczba pozostaje 25. Zrzut JPEG 1280 × 720: `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/work/catalog-wave72-pelny-koszyk.jpg`. Karta browser2/tab8 pozostawiona na wyniku.

Katalog nadal ma 169 referencji, 162 produkty z aktywną ofertą, teraz 208 ofert w 48 aktywnych sklepach/kanałach. Siedem dawnych referencji pozostaje bez aktywnej dokładnej oferty. Te same 65 map obmiarów: 84/251 wymagań z wyceną, 167 bez wyceny (94 bez zapytania, 72 bez produktu, 1 bez oferty), 11 pełnych scenariuszy materiałowych. Nie jest to procent ukończenia aplikacji. Cel pozostaje aktywny: dalsze wymagania receptur, brakujące produkty lub jawni następcy, dostawy i dane konkretnych pobliskich placówek.
