# Dobór drzwi w porównaniu cen i wspólnym koszyku — 2026-10-25

Ogólny „komplet drzwi (skrzydło + ościeżnica)” z rzeczywistego kalkulatora nie dopasowywał się do konkretnych ofert. Teraz użytkownik może wskazać skrzydło ze zdjęciem, a osobno oznaczyć posiadaną, pasującą ościeżnicę i klamkę. Zapisany wybór trafia do porównania cen projektu oraz wspólnego koszyka remontu.

Katalog cen pozostaje **73/103 produkty, 30 brakujących, 99 ofert, 31 sklepów i 17 integracji dostawy**. W tej zmianie nie dodano nowej oferty ani nie wdrażano ponownie backendu. To poprawa wykorzystania istniejących ofert w rzeczywistym projekcie.

## Dobór i kompletność

- Dostępne konkretne skrzydła: Archi 80 lewe białe pełne, EAN 5903917782364, oraz Credis 80 lewe białe przeszklone, EAN 5900378219590. Archi nadal nie ma potwierdzonej oferty; sam wybór pozycji katalogowej nie gwarantuje ceny ani stanu. Przy wyborze Credis produkcyjny serwer zwraca 279,36 zł za jedną sztukę.
- „Dobiorę inny model” pozostawia skrzydło jako brakującą pozycję; nie zmienia go na jeden z dostępnych modeli bez decyzji użytkownika. Osobno można wybrać „mam” dla skrzydła, kompletnej ościeżnicy i klamki z szyldami.
- Po wyborze powstają osobne wymagania: skrzydło, pełna ościeżnica, klamka, dotychczasowa pianka i próg. Brakująca ościeżnica ma kategorię `door-frame-set`; nie może dopasować się do referencyjnej bazy PerfectDoor o kategorii `door-frame`. Karta tej bazy nie potwierdza pełnego zestawu pasującego do wskazanego skrzydła. Nie dodajemy automatycznie zawiasów ani nie zgadujemy reszty zestawu.
- Ogólne obmiary, formuły i wynik kalkulatora pozostają bez zmian. Rozdzielenie kompletu działa wyłącznie po zapisanym wyborze, dla pojedynczej jednoznacznej pozycji `door-set` i dodatniej całkowitej ilości. Przekazujemy tę samą ilość skrzydeł/ościeżnic; ceny i transport nadal liczy serwer.
- Brakujące elementy pozostają jawne, a niepełny zestaw nie dostaje pełnej sumy z dostawą. Wybrany model w rozmiarze 80 nie jest automatycznym potwierdzeniem dopasowania do dowolnego otworu 90 cm. UI odsyła do wymiarów i zestawu producenta.

Źródła tożsamości i wariantów:

- https://www.castorama.pl/drzwi-pelne-archi-80-lewe-biale-lakierowane/5903917782364_CAPL.prd
- https://www.castorama.pl/drzwi-pokojowe-credis-80-lewe-biale/5900378219590_CAPL.prd
- https://liderzycen.pl/pl/p/Drzwi-pokojowe-Credis-80-lewe-biale/30489
- https://www.castorama.pl/baza-oscieznicy-regulowana-perfectdoor-80-100-mm-prawa-dab-sonoma/5902659279118_CAPL.prd

Specyfikacja OPP Klasyk, EAN 5063022524034, jest sprzeczna z tytułem/URL w sprawie strony otwierania. Tego modelu nie dodano do nowego wyboru do czasu wyjaśnienia. Nie wyprowadzamy strony z samego sluga strony.

## Zapis i własne materiały

`remont.door-selection.v1:<projectId>` zapisuje wyłącznie kontrolowany identyfikator skrzydła, deklaracje posiadania części oraz odcisk obmiarów. Zmiana obmiarów wymaga nowego doboru. Nieznany model, błędny JSON, wersja, typy lub odcisk nie mogą po cichu zmienić wyceny. Starszy rekord bez `handleOwned` oznacza potrzebną klamkę, a nie jej posiadanie.

Wybór i odczyt są rozdzielone od starych preferencji sklepu i dostawy. Podczas odczytu nie pokazujemy wyniku poprzedniego wyboru. Błędy odczytu/zapisu są widoczne; błąd odczytu w koszyku remontu blokuje wycenę bez zgadywania posiadanych części.

Wspólny koszyk odczytuje wybór przy otwarciu. „Mam/Kupione” dla całego oryginalnego `door-set` obejmuje skrzydło i ościeżnicę. Nie usuwa automatycznie nowej klamki: oryginalna pozycja nie deklarowała jej zawartości. Sprzeczne zdublowane flagi zakupowe nie usuwają wymaganych elementów. Wybory i stany jednego projektu nie usuwają materiałów z drugiego.

## Weryfikacja

**299 testów logiki/API/mobile PASS, 0 skip**, w tym cztery nowe testy na rzeczywistym kalkulatorze; po dodaniu sprawdzenia starszego zapisu ponownie przeszły cztery testy doboru. Typecheck mobile: PASS, kontrola 66 identyfikatorów prac i `git diff --check`: PASS. Nie zmieniano zależności, migracji ani rejestru prac. Backend bez zmian, więc nie powtarzano jego 55 niezależnych regresji.

Rzeczywisty produkcyjny HTTPS, 2026-10-25 22:54:24 Europe/Warsaw:

| Przypadek | Wynik |
|---|---|
| Oryginalny kalkulator bez wyboru | 3 nierozpoznane pozycje |
| Credis, potrzebna ościeżnica i klamka | 1 wycenione skrzydło za 279,36 zł i 4 brakujące pozycje, bez pełnej sumy |
| Credis, posiadana ościeżnica i klamka | 279,36 zł i 2 brakujące pozycje: pianka i próg |
| Dwa projekty z Credis | 2 sztuki, skonsolidowane 558,72 zł za skrzydła |
| Cały komplet posiadany tylko w jednym z tych projektów | Drugie skrzydło nadal 279,36 zł; potrzebna klamka pierwszego projektu nie znika |
| Dotychczasowe trzy prace z dostawą | **790,83 zł = 637,43 + 153,40**, bez zmiany |

UI istniejącej karty aplikacji potwierdziło wybór Credis, zdjęcie i cenę, odtworzenie po przeładowaniu, osobne oznaczenie posiadanej ościeżnicy i klamki oraz wykorzystanie zapisu we wspólnym koszyku. Po zaznaczeniu czwartej pracy koszyk pokazał sześć wycenionych produktów, w tym Credis za 279,36 zł, i dwa braki bez pełnej sumy. Po odznaczeniu testu przywrócono trzy prace, kod 00-001, jedną posiadaną pozycję i 790,83 zł.

Projekt testowy `proj_mvocoxcs1z9wqksmw` pozostał z Credis oraz potrzebną ościeżnicą i klamką; flagi posiadania z testów wyłączono. Projekt nie jest zaznaczony we wspólnym koszyku. Otwarty podgląd pokazuje nowy wybór. Bez nowej publikacji Android/iOS; działa lokalny podgląd Expo z istniejącym produkcyjnym backendem `8c581766-3ada-4d2d-97ba-30f36d0b73c1`.

Dowody w `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/`: `work/door-selection-tests.log`, `work/door-selection-focused-tests.log`, `work/door-selection-production-proof.json`, `outputs/asystent-remontu-dobor-produktow-drzwi-dowod-20261025.json`, `outputs/asystent-remontu-wybor-skrzydla-final-20261025.png`, `outputs/asystent-remontu-wybrane-drzwi-koszyk-20261025.png`.

## Dalsza praca w pełnym celu

Potrzebny jest wybór konkretnych kompletnych ościeżnic i klamek, właściwe produkty dla pianki i progów oraz zgodność pozostałych wariantów. Ten dobór działa w porównaniu cen i koszyku remontu; nie przepisuje jeszcze lokalnych pozycji zakładki Zakupy ani starego szacunku Budżetu. Tych ścieżek nie należy ogłaszać zsynchronizowanymi.

Nadal pozostają 30 brakujących produktów, dostawy Castorama/OBI, rzeczywiste lokalne ceny i stany, limity zapasów przy odbiorze, częściowo posiadane materiały i pozycje ręczne. Cel nie jest zakończony.

Dodatkowe badanie czterech braków: Atlas Stopter K-20 EAN 5905400160253 w E-Kowalczyk jest niedostępny. Profil 5907738940163 w MyBudio ma sprzeczną długość 4 m i producenta Hanbud zamiast referencyjnego Budmat 3 m — nie importować samego zgodnego GTIN. Kreisel GW180 EAN 5907418038791 jest w Rodimax, lecz niesprawdzony checkout tego sklepu nadal uniemożliwia uznanie oferty za aktywną. Dla MP75 EAN 5902367206352 znaleziono historyczną specyfikację, bez nowej aktualnej oferty. Ceny i dostępności tych pozycji nie zostały zmyślone ani dodane do licznika.
