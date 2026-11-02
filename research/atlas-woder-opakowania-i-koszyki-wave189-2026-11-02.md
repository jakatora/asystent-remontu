# Atlas Woder E — opakowania i koszt pełnych koszyków, 2026-11-02

Opublikowano dwa nowe produkty i fotografie Woder E 2/5 kg, pięć ofert Woder E oraz dodatkową ofertę identycznego Knauf Super Finish 28 kg w Sewerze. Jawny dobór opakowań zachowuje zapotrzebowanie użytkownika. API i WWW ze źródła 28750d89 są opublikowane i zweryfikowane publicznie. Cel całego rozwoju pozostaje aktywny; wykryta luka doboru dużych koszyków jest opisana poniżej.

## Tożsamość i źródła

- Producent: https://www.atlas.com.pl/produkt/atlas-szybkoschnaca-folia-w-plynie-woder-e/ — jednoskładnikowy Woder E. Lista fabrycznych pojemności nie potwierdza dostępności sklepowej.
- PSB 2 kg: https://www.grupapsb.com.pl/produkt/szybkoschnaca-folia-w-plynie-2-kg-woder-e-atlas-5905400514483.html
- PSB 5 kg: https://www.grupapsb.com.pl/produkt/szybkoschnaca-folia-w-plynie-5-kg-woder-e-atlas-5905400514490.html
- PSB 15 kg: https://www.grupapsb.com.pl/produkt/folia-w-plynie-woder-e-szybkoschnaca-15-kg-atlas-5905400514506.html

Zamknięta rodzina obejmuje wyłącznie GTIN 5905400514483 (2 kg), 5905400514490 (5 kg), 5905400514506 (15 kg). Bez aliasowania Woder W, Duo, innych rewizji GTIN, litrów i niezweryfikowanego GTIN 10 kg. Nie zmieniono zużycia, formuł, domyślnych produktów ani zapisanych projektów. Zgoda na dobór rozmiarów jest jawna, pierwotna referencja i zapotrzebowanie pozostają zapisane.

## Rzeczywiste odczyty i fotografie

2026-11-02 01:56:58–01:57:01 UTC, HTTP 200. Lobo: 2 kg 48,90 zł; 5 kg 99,00 zł; 15 kg 249,00 zł. Sewera: 2 kg 57,99 zł; 5 kg 103,00 zł. Cena dotyczy jednego całego wiadra. To nowe obserwacje ofert, nie podwyżki względem najniższej ceny z 30 dni lub ceny innego sklepu.

Nowe referencje 2 i 5 kg mają fotografie z dokładnych kart Lobo, obejrzane lokalnie. Dwa zdjęcia Sewery są identyczną ilustracją modelu, dlatego dla nowych referencji wybrano różniące się fotografie opakowań Lobo. Obrazy pozostają URL-ami, bez binariów w repo. Masa logistyczna Lobo 3 / 7 / 16 kg nie zastępuje zawartości 2 / 5 / 15 kg i nie jest ręcznym cennikiem dostawy.

## Rzeczywiste koszyki adaptera

- lobo2, kod 30-001: materiały 48.90 zł; dostawa 22.90 zł, retailer_basket_national, PL.
- lobo5, kod 30-001: materiały 99.00 zł; dostawa 22.90 zł, retailer_basket_national, PL.
- lobo15, kod 30-001: materiały 249.00 zł; dostawa 45.90 zł, retailer_basket_national, PL.
- lobo-mixed, kod 30-001: materiały 147.90 zł; dostawa 22.90 zł, retailer_basket_national, PL.
- sewera2, kod 30-001: materiały 57.99 zł; dostawa 19.90 zł, retailer_basket_postcode, Katowice.
- sewera5, kod 30-001: materiały 103.00 zł; dostawa 19.90 zł, retailer_basket_postcode, Katowice.
- sewera-mixed, kod 30-001: materiały 160.99 zł; dostawa 19.90 zł, retailer_basket_postcode, Katowice.
- sewera-warsaw, kod 00-001: materiały 103.00 zł; dostawa 19.90 zł, retailer_basket_postcode, Katowice.

Lobo zwraca aktualną krajową wycenę całego anonimowego koszyka dla Polski, nie taryfę zależną od konkretnego kodu. Sewera potwierdza kod i oddział Katowice w rzeczywistym kalkulatorze. Dat wycen nie przedłużano; przed późniejszym zakupem wymagają aktualnego sprawdzenia. Nie złożono zamówienia ani nie podano danych kontaktowych.

Artefakty: G:/Projekty/asystent-remontu-work/wave189-20261102. native-price-observations.json, native-adapter-baskets.json i native-lobo-baskets.json są rzeczywistymi odczytami. Fixture w repo zawiera wybrane pola odpowiedzi Lobo bez cookies, sesji i danych klienta; modyfikacje w testach są kontrolowanymi awariami.

## Walidacja lokalna i backend produkcyjny

Źródło aplikacji i API: 327dc8f04905a69b99565a49a5332a248b652b9b. PR 170 scalony, head 6432bdf5cf15a422d9a1cc481e84da2c5ccd0b68, merge 2102258b12845c393c915493d18a922f6a6ce11d. API 65dc8920-10c1-4a85-a3d9-0050690e7720 SUCCESS 2026-11-02 02:11:37.516 UTC. Świeży SSH 150/150 plików zgodnych, bundle SHA256 f11da4f6a98e2d6d422f524345554a81f414b9f6ff54ae26e6482f0a27a1aa6d. Dodano 5 obserwacji, zachowano poprzednie 350 i 148 pozostałych plików. WWW w tym punkcie nadal wave188; publikacja i publiczne UI nie są jeszcze potwierdzone.

Czyste testy: 554 mobile / 227 pricing / 152 API lib / 159 adapters / 1064 shared, zero fail i skip; grupy nachodzą na siebie. Typy API/mobile i 66 legacy przeszły. GitHub zwrócił pustą listę statusów CI. Pierwsze dwa sprawdzenia typów wykazały brak zawężenia unii w nowych testach; poprawiono testy, zachowano logi, potem pełne grupy przeszły. Pomocnik native początkowo wskazywał błędny plik poprzedniej fali i zatrzymał się przed HTTP; poprawiono ścieżkę. Pierwszy walidator metadanych wskazywał błędną nazwę logu adapterów; właściwy adapter-regression.log potwierdził 159 testów.

Lokalnie 15 rzeczywistych porównań HTTP i 16 UI przeszło. Potrzeba 7 kg: stałe 15 kg 294,90 zł z dostawą, automatyczne 5 + 2 kg 170,80 zł. Ten sam kontrolny zestaw 16 pozycji: 3294,99 → 3192,37 zł, oszczędność 102,62 zł; liczba sklepów 10 → 11. Nie utożsamiać oszczędności produktu i całego remontu ani nie deklarować globalnego optimum. Mniejsza liczba sklepów to osobny istniejący wariant. Obrazy obu nowych rozmiarów załadowały się, układy 320/390 px obejrzano; wybór klawiaturą, kopiowanie, backup i reload zachowują ilość i zgodę.

Pierwsza lokalna automatyczna wycena 7 kg trwała 20,1 s; cały zestaw przed zmianą 34,7 s, po zmianie 18,8 s. To pojedyncze pomiary, część po rozgrzaniu cache, nie p95 i nie test obciążenia. W lokalnym serwerze 839 HTTP do sklepów, zero HTTP 429. Nie obiecywać natychmiastowego zimnego wyniku.

Audyt publiczny 2026-11-02 02:11:59 UTC: 244 referencje / 212 z ofertami / 316 ofert / 32 dawne braki, 231 wierszy snapshotu, 4 warianty merchant SKU i zero fałszywych dopasowań. 2 i 5 kg są nowymi referencjami, Lobo 15 kg to nowa oferta starej referencji. Nie usunięto dawnych braków przez aliasowanie.

Prywatny relay nadal dopuszcza wyłącznie ABUD, ChemiaDoParkietu25 i eTak. Jego bundel zmienił bajty przez import katalogu; to nie rozszerza zakresu na Lobo/Sewerę. Nowe oferty działają istniejącymi bezpośrednimi adapterami API. Początkowe założenie, że nowe ID wymagają rozszerzenia relay, skorygowano po odczycie kodu. W WWW 8 plików hostingu bez zmian, zmieniony wyłącznie bundel relay; 63 zasoby / 17 293 630 B, 77 wartości vaulta bez wycieku.

Rodzina Woder E działa w jawnie dodanych materiałach wspólnego koszyka. Kreator kompletnej hydroizolacji nadal prowadzi osobny system Mapei; nie dodano tam Woder E z obcymi taśmami i gruntem. Pełny system Atlas wymaga osobnego potwierdzenia zgodnych akcesoriów i zużycia.

Historia lokalna wszystkich pięciu nowych ofert zachowuje osobne szeregi; różnica jest wyliczana z dwóch ostatnich rzeczywistych obserwacji tej samej oferty. W odczycie ceny nie zmieniły się (delta 0); nie symulowano podwyżki lub obniżki. Prawdziwa kopia cache produkcji sprzed publikacji API pochodzi z 2026-11-02 02:06:39.968 UTC: 348 obserwacji / 10 576 punktów.

## Publiczny duży koszyk: niewycenione ABUD i nowa oferta Sewery

Pierwsze 13 publicznych scenariuszy Woder E przeszło. Scenariusz whole-fixed7 po 56,0 s zwrócił best = null, bez brakującego produktu, z niepotwierdzoną dostawą ABUD (retailer_connection_unavailable). Produkcyjnej oszczędności 102,62 zł NIE potwierdzono. Oryginalna porażka jest w production-woder-first-attempt.json i production-whole-failure-summary.json. Nie zmieniono wymagań ani nie podstawiono dostawy 0 zł. WWW nadal wave188.

API ma tryb client i obecny klucz istniejącego relay. Podpisana próba do istniejącego WWW o 02:16:13 UTC zwróciła po 10,7 s retailer_connection_unavailable; lokalny zwykły HTTP tej samej karty o 02:16:43 UTC zwrócił 200 w 746 ms. Nie zmieniano IP, regionu, DNS, proxy, ograniczeń sklepu ani zakresu relay. Lokalny własny serwer PID 6804 / sesja 77727 został zatrzymany poprawnie (exit 0, 839 HTTP).

Znaleziono niezależną ofertę TEGO SAMEGO GTIN 5901793357935 w Sewerze: https://sklep.sewera.pl/szpachla-do-spoinowania-super-finish-28kg-knauf-p15481. Rzeczywisty odczyt 2026-11-02 02:18:30.634 UTC: 96,90 zł brutto/SZT, jeden pełny pojemnik 28 kg. Producent: https://knauf.com/pl-PL/p/produkt/knauf-super-finish-11410_0120. Bez zamiennika modelu i bez zmiany zapotrzebowania. To szósta nowa oferta tej fali, bez nowej referencji produktu.

Rzeczywiste koszyki Sewery 30-001: jedno wiadro 96,90 zł + 125 zł Kurier Raben półpaleta do 50 kg; dwa wiadra 193,80 zł + 199 zł Raben Paleta do 100 kg. Cena materiału jest niższa od ABUD, ale koszt dostawy wyższy; aplikacja nadal musi porównać całość. Ta sama wycena nie jest przenoszona na większy lub mieszany koszyk. Kandydat z tą ofertą wymaga ponownych testów i publikacji.

## Kandydat z szóstą ofertą i otwarta jakość wyszukiwania

Źródło 28750d89cd9e51c0b67975624403fb78e6b56ae9, PR 171 MERGED (head 624050d73ff7db20351485d67e865f98b5ad77c9, merge 0dfcf5f3929d5b747c401289f585aabd7eb0643c). API 14710595-8e2f-4638-982a-54fea5a1645a SUCCESS 2026-11-02 02:30:47.506 UTC. SSH potwierdził wszystkie 150 plików, bundel 499fb18b45dbddb77035f4be413d23c7d57091e4304d68f59b3d0db70918d3e3. Seed 356, zachowano wcześniejsze 355, czyli łącznie sześć nowych obserwacji od wave188. Produkcja 244 / 212 / 317 / 32, zero false matches. WWW jeszcze nie opublikowane; publiczne pełne porównania nowego kandydata w toku.

Czyste testy nowego źródła: 554 mobile / 227 pricing / 153 API lib / 159 adapters / 1064 shared, typy i 66 legacy PASS. Lokalnie ponownie 15 native oraz 16 UI PASS. Lokalny zestaw 16 pozycji: 3340,43 → 3245,36 zł, 11 → 8 sklepów. Nie zastępować tym poprzednich kwot lub nieudanego wyniku produkcyjnego; koszyki i dostępne wyceny mają własne daty.

Otwarta luka algorytmu: z aktualnych, nadal ważnych wycen dwóch lokalnych odpowiedzi można złożyć ten sam zakup stałego wariantu za 3296,81 zł zamiast zgłoszonych 3340,43 zł (różnica 43,62 zł). Wymieniono wyłącznie dokładny koszyk WinBud na większy, już potwierdzony koszyk tego sklepu i usunięto pojedynczy narożnik Dam-Bud; zakupione produkty, opakowania i liczby są identyczne. Nie zmieniono cen ani dat i nie utworzono fikcyjnej wyceny. To konstrukcja diagnostyczna, NIE wynik zwracany przez aplikację i NIE dowód globalnego optimum. Dowód bounded-search-quality-gap.json. Ponowne wywołanie tego samego wariantu ze współdzielonym cache po 14,0 s nadal zwróciło 3340,43 zł (27 porównań, searchLimited=true); local-whole-cache-reuse-check.json.

Kolejny priorytet całego aktywnego celu: odtworzyć tę lukę kontrolowanym testem i poprawić dobór kompletnych koszyków sklepów, żeby ograniczona enumeracja nie pomijała dostępnego tańszego planu. Nie uznawać rozszerzenia katalogu i pozytywnych testów za ukończenie wymagania najtańszego całego remontu.

## Wynik końcowy publikacji — 2026-11-02

- Źródło runtime API i WWW: 28750d89cd9e51c0b67975624403fb78e6b56ae9. PR 170 i 171 są scalone. Ostateczny PR 171: head 624050d73ff7db20351485d67e865f98b5ad77c9, merge 0dfcf5f3929d5b747c401289f585aabd7eb0643c.
- API 14710595-8e2f-4638-982a-54fea5a1645a SUCCESS 02:30:47.506 UTC; WWW 9b61c5c0-2967-4205-8d43-2435526621d7 SUCCESS 02:35:45.617 UTC. Wszystkie 150 plików API odpowiadają przygotowanemu wydaniu, seed 356. Od wave188 dodano sześć obserwacji i zachowano wszystkie wcześniejsze 350.
- WWW: 63 publiczne zasoby zgodne SHA256, 17 293 630 B; skan 77 wartości vaulta bez wycieku. Trasy aplikacji i PL przeszły; brakujące zasoby, pliki serwera i .env zwracają 404, prywatny niepodpisany POST 401. Osiem plików hostingu zachowano, zmienił się wyłącznie bundel istniejącego relay. Nie rozszerzono jego sklepów lub działań.
- Katalog: 244 referencje, 212 z ofertami, 317 ofert, 32 wcześniejsze braki; cztery warianty merchant SKU i zero fałszywych dopasowań. Nowych sklepów jako marek nie dodano; rozszerzono ofertę istniejących Lobo i Sewery.

### Rzeczywiste publiczne porównania

Kod 30-001, ceny i dostawy sprawdzone w natywnych koszykach sklepów; ważność jest ograniczona do dat wycen.

| Wariant | Materiały | Dostawa | Razem | Sklepy |
| --- | ---: | ---: | ---: | ---: |
| Potrzeba 7 kg, stałe wiadro Woder E 15 kg | 249,00 zł | 45,90 zł | 294,90 zł | 1 |
| Ta sama potrzeba, jawny dobór 5 + 2 kg | 147,90 zł | 22,90 zł | 170,80 zł | 1 |
| Cały zestaw, stałe opakowanie Woder E | 2815,37 zł | 570,50 zł | 3385,87 zł | 8 |
| Ten sam zestaw, jawny dobór Woder E | 2703,36 zł | 567,50 zł | 3270,86 zł | 8 |

Oszczędność pojedynczej potrzeby wynosiła 124,10 zł, całego zestawu 115,01 zł. Oba publiczne pełne warianty rzeczywiście kupują dwa identyczne wiadra Knauf 28 kg z Sewery, więc brak połączenia do ABUD nie wymusza fikcyjnej stawki. Wariant 00-001 dla 7 kg również zwrócił 170,80 zł. Lobo potwierdza koszyk krajowy PL, a Sewera dokładny kod i oddział. Nie jest to deklaracja minimalnej ceny całego internetu ani trwała gwarancja cen.

Zestaw zawiera 16 wejściowych zapotrzebowań, które konsolidują się do 15 produktów: dwa wpisy Ceresit CT 17 Transparent po 6 l tworzą wspólną potrzebę 12 l. Końcowy walidator początkowo błędnie oczekiwał 16 grup; poprawiono rozróżnienie na podstawie rzeczywistych wejść i odpowiedzi, bez zmiany aplikacji lub usuwania materiału. Diagnostyka final-proof-count-diagnostic.json.

Ostatecznie 15 scenariuszy native i 16 UI przeszło lokalnie oraz publicznie. Obie fotografie nowych wiader ładowały się, układ 320/390 px, klawiatura Space/Enter, kopiowanie, backup, powrót i reload przeszły; zero pageerror i API 429 w tych UI. Pierwsza nieudana próba publiczna pozostaje osobno zachowana. Testy końcowego źródła: 554 mobile / 227 pricing / 153 API lib / 159 adapters / 1064 shared, typy i 66 legacy PASS, bez fail lub skip; grupy nachodzą na siebie. GitHub nie zgłosił statusów CI.

### Historia, koszty i ograniczenia

Kontrola sześciu nowych ofert wyliczyła każdą różnicę z dwóch ostatnich faktycznych obserwacji tej samej oferty. Wszystkie nowe szeregi miały zmianę 0 gr; nie pokazano sztucznej obniżki z porównania sklepów, ceny katalogowej lub minimum 30 dni. Cache przed drugim API: 353 obserwacje / 10 898 punktów o 02:28:35.460 UTC, po publikacji i UI: 354 / 11 233 o 02:37:31.241 UTC. Zachowano 10 895 wcześniejszych punktów; trzy najstarsze usunięto zgodnie z niezmienionym limitem 60 na ofertę. Odtworzenie rzeczywistej klasy RetailPriceHistory dało dokładnie ten sam zbiór, bez dowolnego kasowania historii.

Końcowy final-proof.json o 02:38:08.975 UTC potwierdził 233 wystąpienia nadal ważnych natywnych wycen, nienaruszone daty, identyczne pozostałe wymagania, wspólne ceny wybranych ofert, użycie Sewery i zgodną retencję historii. Ten zapis nie przedłuża ważności później. Nie zmieniono płatności, rabatów, Stripe, budżetu AI lub innych projektów; nie złożono zamówień i nie podano danych kontaktowych. W ścieżce kwot sprawdzono rzeczywistą cenę brutto całych opakowań, ilości, sumy, kod/kraj, dostawę, walidację obcego produktu i nieznanego transportu oraz izolację historii ofert.

Otwarta luka ograniczonego wyszukiwania pozostaje: we wcześniejszej ważnej próbie diagnostycznej można było złożyć plan tańszy o 43,62 zł od wyniku algorytmu. Nie została naprawiona przez dodanie ofert ani zakryta pozytywnymi testami. Następny priorytet to kontrolowany regresyjny test i lepszy dobór pełnych koszyków sklepów przy zachowaniu limitów, stocku, kodu i dat; cel całej aplikacji NIE jest ukończony. Nadal pozostają również 32 niepotwierdzone pozycje, stabilne integracje dużych sieci, wydajność wycen i walidacja z klientami.

Własne procesy zamknięto: pierwszy serwer PID 6804 / sesja 77727, exit 0, 839 HTTP; drugi PID 24252 / sesja 70179, exit 0, 881 HTTP. Przeglądarki QA zamknięte. Plików WIP ean-overlay/mappings/lock/.atlas/PROPOZYCJE nie edytowano ani nie dodawano do commitów. Artefakty obu etapów zachowano w wave189-20261102 i wave189-sewera-20261102.
