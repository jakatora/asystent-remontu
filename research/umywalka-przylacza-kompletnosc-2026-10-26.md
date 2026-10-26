# Przyłącza umywalki i poprawne zapotrzebowanie — 2026-10-26

Znaleziono błąd kosztu: przepis `sink-installation` liczył jeden zawór na umywalkę, choć instrukcja wymaga podłączenia ciepłej i zimnej wody. Doliczał również pojedynczy dodatkowy wężyk mimo przyłączy w zestawie referencyjnej baterii Ferro Stillo BSL2. Sam opis „dokup drugi zawór” nie naprawiał koszyka.

## Zachowanie po zmianie

- Dwa zawory na umywalkę, wspólna reguła w kalkulatorze, szczegółowym wyniku i odczycie starszych zapisów. Jedna umywalka wymaga dwóch zaworów, dwie — czterech.
- Nowy obmiar „Dodatkowe wężyki do kupienia”, domyślnie zero dla nowego przepisu z BSL2. Jest to łączna liczba dodatkowych/wymiennych sztuk, nie liczba par na umywalkę. Wężyk referencyjny Invena ma 30 cm i G3/8×M10; długość i zgodność trzeba sprawdzić. Nie obiecujemy, że zastąpi każde przyłącze.
- Syfon jest rozpoznawany jako konkretny McAlpine WHB1-32 we wszystkich poziomach materiałów; tańszy poziom nie usuwa elementu potrzebnego do odpływu. Dodatkowe wężyki także są wyceniane niezależnie od poziomu.
- Naprawiono jednostkę silikonu: zapis przepisu to kartusze wskazanego modelu Soudal 280 ml, a katalog wymaga ml. Dla dwóch umywalek zachowano dotychczasowe założenie dwóch kartuszy, czyli 560 ml, zamiast nierozpoznanej pozycji „2 kartusze” lub błędnego 2 ml. Konwersja ograniczona do dokładnego ID, marki/modelu, wielkości opakowania i tego przepisu; bez ogólnego przeliczania dowolnych kartuszy.
- Kreator akceptuje całkowite liczby sztuk, pokazuje domyślne **0** także w podsumowaniu, a pola mają dostępne etykiety i klawiaturę liczbową dla sztuk. Błędna wartość 1,5 wężyka została odrzucona w prawdziwym formularzu.
- Poprawiono opis mocowania: umywalka wymaga mocowań dobranych do modelu i ściany. Opcjonalna osłona półpostumentu nie zastępuje jej mocowania. Nie dodano fikcyjnego uniwersalnego zestawu mocującego ani jego ceny.

## Starsze dane i oznaczenia „Mam”

Zmiana widoku obliczeń nie zapisuje na nowo JSON projektu, cen źródłowych lub wierszy SQLite. Nie zmieniono migracji. Starsze dwa zawory zapisane dla dwóch umywalek są odczytywane jako aktualne wymaganie czterech sztuk. Dawne oznaczenie posiadania dwóch sztuk nie usuwa całej nowej ilości z koszyka. Dotychczasowy mechanizm potwierdzenia ilości w Zakupach pozwala potwierdzić pełne aktualne zapotrzebowanie.

Starszy zapis bez decyzji o wężykach pozostaje „ilość do ustalenia”; nie jest automatycznie zamieniany na darmowe zero ani dowolną nową parę. Wielokrotny odczyt zachowuje ten stan. Nowy model ilości oznacza, że nowe domyślne zero było częścią obliczenia; historyczny zapis nie dostaje tego oznaczenia bez decyzji w obmiarach. Własne odrębne pozycje zakupowe i przechowywane wartości użytkownika pozostają bez zmian.

## Źródła techniczne

- [FERRO — Stillo, karta serii](https://www.ferrocompany.com/pliki/en/FERRO_Stillo_EN.pdf): BSL2, przyłącza elastyczne G3/8–M10x1 i automatyczny korek G1¼. Potwierdzenie przyłączy także na [karcie sprzedawcy TGS](https://tgs.pl/pl/p/Ferro-Stillo-bateria-umywalkowa-stojaca-chrom/44). Bez importowania nowej ceny z wyników wyszukiwania.
- [McAlpine — WHB1-32](https://mcalpine.pl/product/syfon-umywalkowy-niski-bialy-whb1-32/): niski syfon membranowy 1¼×32 mm; EAN 5036484088390. Niezależna tożsamość i parametry także w [Instal-Konsorcjum](https://ik.pl/produkty/syfon-umywalkowy-114x32mm-z-membrana-silikonowa-i-rewizja~p2836893). Nie wliczano nowych ofert tych sklepów.
- [Leroy Merlin — montaż półpostumentów](https://www.leroymerlin.pl/produkty/lazienka/umywalki/postumenty-polpostumenty/): osłonę montuje się po stabilnym zawieszeniu i podłączeniu umywalki; dobór zgodnego modelu.
- [Soudal 280 ml — istniejąca referencja Castoramy](https://www.castorama.pl/silikon-sanitarny-soudal-280-ml-bialy/5411183157064_CAPL.prd): konwersja dokładnie znanej wielkości kartusza. Ceny i daty ofert pozostawiono serwerowi, bez odmładzania obserwacji.

## Dowód na rzeczywistym serwerze i w aplikacji

Rzeczywisty HTTPS `/api/remont/pricing/project`, wejście z bieżącego kalkulatora: dwie prace obejmujące jedną i dwie umywalki, jawnie wybrany Atlantic New. Serwer łączy **6 zaworów za 207,24 zł, 3 syfony i 840 ml silikonu / 3 kartusze**. Żaden wężyk fabrycznego zestawu nie jest kupowany drugi raz. Pięć rozpoznanych grup produktów, bez braków katalogowych w tym wejściu, **1447,26 zł materiałów w trybie odbioru**, bez dojazdu i bez zapewnienia lokalnego zapasu. To koszt wycenionych pozycji, nie komplet wszystkich możliwych prac i mocowań instalacyjnych.

Osobna próba: jawne trzy dodatkowe wężyki Invena to **3×11,14=33,42 zł**. TOK-MET zwraca `address_required`, `best:null`, `needs_delivery_costs`; nie zastępujemy braku wyceny dostawy zerem. Stary zapis bez decyzji o wężykach daje `partial`, `best:null`. Pierwszy pomocniczy assert używał pól odpowiedzi etapu dla wyniku skonsolidowanego; poprawiono pomocnik do rzeczywistego kontraktu `totalQuantity`/`lineCostGrosze`, bez zmiany kalkulatora lub osłabienia wymagań ilości.

W prawdziwym UI utworzono jeden własny projekt kontrolny **„Test kompletu — 2 umywalki, przyłącza w zestawie”**, ID `proj_mvps3mo96r5yibhgr`. Projekt pozostaje zapisany do przeglądu; żadnego wcześniejszego projektu nie usunięto ani nie zmieniono. Zakupy mają cztery zawory i nie zawierają dodatkowego wężyka przy zerowej decyzji. Po wyborze Atlantic New karta LiderzyCen pokazuje **4×1 szt. = 138,16 zł**, dwa syfony 217,72 zł, dwie baterie 259,96 zł, dwie umywalki 316,00 zł i dwa kartusze 33,00 zł. Razem **964,84 zł** z opcją odbioru i zastrzeżeniem dojazdu/dostępności. Pełny reload zachował model, ilości i wybór odbioru. Tę samą kwotę sprawdzono we wspólnym koszyku z samym nowym projektem. W trybie wysyłki brak pełnego frachtu pozostał widoczny.

Po próbach przywrócono wcześniejszy wspólny koszyk: trzy pierwotne prace, Standard, jedna posiadana pozycja, dostawa do domu, 00-001, bez preferowanego sklepu i dodatków. Nowy projekt nie jest w nim zaznaczony. Stan kontrolny **637,43+153,40=790,83 zł**. Lokalny widok Zakupów nowego projektu nadal używa referencyjnego kosztu przepisu 1076 zł; bieżące oferty są w „Gdzie najtaniej”. Ujednolicenie prezentacji tych dwóch źródeł kosztu pozostaje dalszym zadaniem; nie deklarujemy, że 1076 zł jest aktualną ceną sklepów.

## Walidacja

**470 testów core/kalkulator/pricing/API PASS, 0 skip**, w tym pięć nowych testów obejmujących 1/2/10 umywalek, zera/dodatkowe sztuki/ułamki, wszystkie poziomy, JSON bez mutacji, powtarzane odczyty, stare oznaczenia posiadania, dwa projekty oraz zgodność zwykłego i szczegółowego wyniku. Testy importują regułę produkcyjną. Mobile typecheck PASS, kontrola 66 chronionych ID wraz z negatywnymi mutacjami PASS, diff check PASS. Nie uruchamiano ponownie testów niezmienionego wspólnego backendu i nie budowano binarek iOS/Android. Backend nie wymagał wdrożenia.

Ścieżka pieniędzy: użyto faktycznych cen ofert serwera i pełnych opakowań, kwoty API w groszach; niezmienione daty/ceny, brak ruchów płatniczych lub płatnego AI, nieznana ilość i fracht nie są zerowym kosztem. Dowód wykracza poza unity: produkcyjny HTTP, nowy projekt kreatora, Zakupy, wycena projektu, pełne odświeżenie i wspólny koszyk.

Dowody w katalogu rozmowy: `work/catalog-wave37-production-proof.json`, `work/catalog-wave37-core-tests.log`, `work/catalog-wave37-legacy-mutation-proof.json`, `outputs/catalog37-wizard-fraction-rejected-20261026.txt`, `outputs/catalog37-shopping-20261026.txt`, `outputs/catalog37-project-prices-20261026.txt`, `outputs/catalog37-project-reloaded-20261026.txt`, `outputs/catalog37-four-valves-20261026.png`, `outputs/catalog37-common-basket-20261026.txt`, `outputs/catalog37-basket-restored-20261026.txt`.

Pełny cel pozostaje aktywny. Ta zmiana naprawia rzeczywiste ilości i rozpoznawanie elementów; nie dodaje nowego SKU. Nadal trzeba dobrać i wycenić mocowania do modelu/ściany, ewentualne przyłącze odpływowe, ujednolicić lokalne szacunki z porównaniem sklepów, uzupełnić sześć historycznych modeli i rzeczywiste dostawy Castoramy/OBI.
