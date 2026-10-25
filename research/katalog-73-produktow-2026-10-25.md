# Katalog 73/103 — drzwi, zawias i kotwa — 2026-10-25

Produkcja potwierdza **73 produkty z ofertami, 30 brakujących, 99 aktywnych ofert, 31 sklepów i 17 integracji automatycznej dostawy**. Wszystkie 103 referencje mają przypisane zdjęcia. To pokrycie obecnego katalogu, a nie całego rynku ani wszystkich przepływów kalkulatora. Cel pozostaje aktywny.

## Trzy nowe oferty

| Produkt | EAN | Zakup | Cena brutto |
|---|---|---|---:|
| Kotwa montażowa do ościeżnic 10×182 mm | 5905458019787 | 1 szt. | 5,12 zł |
| Zawias Metro regulowany 3D 14 mm, ocynkowany | 5906711270471 | 1 szt. | 15,66 zł |
| Erkado Credis, białe lewe skrzydło pokojowe, rozmiar 80 | 5900378219590 | 1 skrzydło | 279,36 zł |

Karty z ceną i zdjęciem:

- https://liderzycen.pl/pl/p/Kotwa-montazowa-do-oscieznic-10-x-182-mm/21842
- https://liderzycen.pl/pl/p/Zawias-regulowany-3D-14-mm-ocynkowany/22128
- https://liderzycen.pl/pl/p/Drzwi-pokojowe-Credis-80-lewe-biale/30489

Niezależne potwierdzenie producenta i tożsamości:

- Kotwa: https://www.castorama.pl/kotwa-montazowa-do-oscieznic-10-x-182-mm/5905458019787_CAPL.prd — podany producent Kingfisher International Products B.V. Nie przypisano nazwy sklepu jako producenta.
- Zawias: https://www.grupapsb.com.pl/produkt/zawias-wkrecany-regulowany-3d-14-mm-ocynkowany-metro-5906711270471.html — Metro, zgodny EAN, 3D i średnica 14 mm. Nie importowano orientacyjnej ceny sieci Mrówka.
- Drzwi: https://www.castorama.pl/drzwi-pokojowe-credis-80-lewe-biale/5900378219590_CAPL.prd — producent ERKADO, lewy wariant, rozmiar 80, biel, przeszklenie mleczne, bez ościeżnicy i klamki. Cena referencyjna Castoramy nie jest nową obserwacją ceny LiderzyCen.

API LiderzyCen wpisuje `producer={name:liderzycen,id:50}` dla tych trzech pozycji. Nowe pole `brandReference` zapisuje niezależny adres referencyjny i dokładną zastępczą wartość sklepu. Wyjątek wymaga konkretnego EAN, SKU, jednostki, wariantu, dokładnej nazwy i niezmienionego ID/nazwy producenta. Nie usuwa ogólnej walidacji marki. Inny producent, kod, jednostka lub zmiana drzwi z lewych na prawe blokuje świeżą wycenę przed dodaniem towaru do anonimowego koszyka. Referencja marki jest ręcznie zrecenzowaną informacją katalogową, nie drugim żądaniem wykonywanym przy każdym pobraniu ceny.

## Koszty dostawy

Sprawdzono anonimowe koszyki po jednej i dwóch sztukach każdego produktu oraz trzy produkty razem. Nie wprowadzono danych klienta, nie złożono zamówienia ani nie wykonano płatności.

| Koszyk | Materiały | Dostawa | Razem |
|---|---:|---:|---:|
| Jedna kotwa | 5,12 zł | 15,00 zł | 20,12 zł |
| Jeden zawias | 15,66 zł | 15,00 zł | 30,66 zł |
| Jedno skrzydło Credis | 279,36 zł | 600,00 zł | 879,36 zł |
| Po jednej sztuce trzech nowych produktów | 300,14 zł | 600,00 zł | **900,14 zł** |

Dwie kotwy: 25,24 zł razem; dwa zawiasy: 46,32 zł; dwa skrzydła: 1 158,72 zł. Koszyk z drzwiami wymaga innego transportu niż drobny osprzęt. Opłata jest odczytywana dla całego koszyka i ilości, nie wpisana jako stały cennik w kodzie. Zakres LiderzyCen pozostaje `retailer_basket_national`, Polska; nie jest to potwierdzenie dostawy pod konkretny kod lub pełny adres. Koszt dojazdu po odbiór jest poza sumą produktów.

## Czytelny wariant i ograniczenie kalkulatora drzwi

W nazwie referencji Credis dopisano **lewe**, a w bazie PerfectDoor **prawa dąb sonoma**; identyfikatory produktów i prac zachowano. Poprzedni alias nazwy Credis pozostał dostępny. Przy wycenie drzwi pojawia się informacja o dopasowaniu rozmiaru, strony otwierania, przylgi, zawiasów i zakresu regulacji ościeżnicy. Przy rozpoznanym Credis komunikat doprecyzowuje lewy wariant bez ościeżnicy i klamki.

Rzeczywisty test kreatora utworzył lokalny projekt `proj_mvocoxcs1z9wqksmw`, „Test zgodności — drzwi Credis 80 lewe”, obmiary 90×210 cm, ściana 10 cm. Potwierdzono wyświetlenie komunikatu o zgodności oraz uczciwe oznaczenie niepełnego zestawu. Projekt pozostał **niezaznaczony** we wspólnym koszyku; dotychczasowe trzy prace, jedna posiadana pozycja, kod 00-001 i 790,83 zł zachowane.

Test ujawnił ograniczenie, którego nie rozwiązano tą zmianą: zapisany wynik `interior-doors` przekazuje ogólny „komplet drzwi (skrzydło + ościeżnica)”, pianę i próg. `resolveMaterialQuantity` nie rozdziela kompletu na konkretne części. Nowe oferty są dostępne dla konkretnych referencji/EAN, ale nie oznacza to pełnej wyceny tego kreatora. Nie wolno podmienić kompletu samym skrzydłem ani zmyślić ilości zawiasów; trzeba wprowadzić jawny dobór zgodnego zestawu i jego części. Obecne referencje obejmują lewy model Credis i prawą bazę ościeżnicy; nie stanowią potwierdzonego kompletu.

## Walidacja i wdrożenie

- **295 testów logiki/API/mobile + 20 testów seedów + 55 regresji wspólnego backendu = 370 PASS, 0 skip**. Typecheck API i mobile: PASS; mobile ponownie po komunikacie UI. Kontrola 66 identyfikatorów prac: PASS.
- Produkcyjny HTTPS potwierdził powyższe koszyki, respektowanie wybranego sklepu i lewą nazwę drzwi. Odbiór wszystkich 73 wycenionych produktów ma plan. Żądanie wszystkich 103 zachowuje 73 rozpoznane i 30 brakujących, bez fałszywej pełnej sumy. Dotychczasowy koszyk: **790,83 zł = 637,43 + 153,40**. Health 200, auth/me 401.
- **Walidacja adresów: 10/12 HTTP 200.** Dziewięć kart/API/zdjęć LiderzyCen i referencja PSB dostępne. Dwie referencje Castoramy zwracają bezpośrednio 503 przy HEAD i GET; producentów i specyfikację odczytano przez narzędzie web z głównych stron Castoramy. Nie obchodzono blokady i nie importowano z tych kart cen/dostaw. Nie oznaczać całego skryptu walidacji URL jako PASS.
- Dodatkowa równoległa karta podglądu Expo pokazała błąd `Unknown` w SQLite WorkerChannel. Po zamknięciu tej karty kreator i zapis projektu działały w istniejącej karcie. Przyczyny nie potwierdzono; nie deklarować testu wielu kart ani konsoli bez błędów. Nie jest to dowód awarii natywnych wydań.
- PR https://github.com/jakatora/przetargai/pull/21 merged i attached. Źródło `365b92e314e47931fc51904c298652a5291d24e2`, main `391df81e7aad24fd49e77c9e25b8bff3d78ed5bf`.
- Railway **`8c581766-3ada-4d2d-97ba-30f36d0b73c1`: SUCCESS od 2026-10-25 22:39:55 Europe/Warsaw**. Nowe źródła odczytane 22:40:28: `active=true`, `error=null`. Świeży snapshot poprzedniej produkcji `63c09228` ma SHA256 `19d797fd8d3b5a8759f8b078123517b16669a8b0ac2ff73e669d7bd18153a25d`. Zmieniono tylko moduł Remontu i trzy dopisane obserwacje, poprzednie 98 zachowano. Bez nowego wydania Android/iOS.

Dowody w `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/`: `work/catalog-wave10-production-proof.json`, `work/catalog-wave10-local-live-proof.json`, `work/catalog-wave10-delivery-proof.json`, `work/catalog-wave10-reference-get-proof.json`, `outputs/asystent-remontu-katalog-73-dowod-20261025.json`, `outputs/asystent-remontu-dobor-drzwi-20261025.png`.

Nadal do wykonania: 30 brakujących produktów, dobór i wycena faktycznego zestawu drzwi, dostawy Castorama/OBI, lokalne stany i ceny sklepów stacjonarnych, limity zapasów przy odbiorze, częściowo posiadane materiały i ręczne pozycje. Przy dużych koszykach porównanie nadal jawnie obejmuje wybrane kombinacje.
