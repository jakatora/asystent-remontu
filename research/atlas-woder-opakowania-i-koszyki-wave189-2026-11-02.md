# Atlas Woder E — opakowania i koszt pełnych koszyków, 2026-11-02

Status: kandydat w walidacji. Ten raport nie potwierdza jeszcze publikacji.

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
