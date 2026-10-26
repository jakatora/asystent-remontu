# Minimum zakupu a wielokrotność — 2026-10-26

## Stan produkcji

HTTPS sprawdzony 2026-10-26T02:42:30.196Z: 76/103 referencji ma aktywną ofertę,
27 nadal bez oferty, 102 oferty, 34 sklepy i 19 integracji dostawy. Zapytanie
obejmujące wszystkie 103 referencje zwraca 76 rozpoznanych pozycji, 27 braków
i `deliveryComparison.best = null`. Nie przedstawiamy niepełnego koszyka jako
całego remontu. Zdjęcia pozostają 103/103.

## Dowód z rzeczywistego sklepu

Kandydat: [Centrum Matbud — Yetico Gamma Fasada 044, 10 cm, 3 m²/op.](https://centrummatbud.pl/Styropian-elewacyjny-10-cm-Yetico-Gamma-Fasada-044-3m2-op-p96729).
Natywne publiczne API sklepu opisuje produkt 96729, symbol `FASADA 044 10CM`,
jednostkę `OP`, minimum 50, krok 1, stan 120 opakowań i cenę 69,74 zł brutto.
W dwóch świeżych anonimowych koszykach:

- próba dodania jednej sztuki została podniesiona do 50 opakowań: 3487,00 zł;
- próba dodania 51 została przyjęta jako 51: 3556,74 zł.

Nie użyto danych klienta, regulaminu, płatności ani wysłania zamówienia.
W przeglądarce nie dodano jeszcze pozycji testowych; karta produktu pozostaje
otwarta do dalszego badania.

To **minimum 50, a nie wielokrotność 50**. Zakup 51 opakowań nie może zostać
wyceniony jako 100. Po połączeniu potrzeb dwóch pomieszczeń minimum obowiązuje
raz dla oferty w zamówieniu.

Oferta nie została jeszcze dodana do katalogu. Brak natywnego GTIN; trzeba
zakończyć przegląd dokładnego powiązania z referencją producenta
5902578301976. Karta zawiera też sprzeczne ogólne zdanie o cenie za m² oraz
niejednoznaczny opis krawędzi. Operacyjna jednostka koszyka to OP; wyjaśnienie
całej tożsamości i opakowania wymaga oddzielnego dowodu. Ogólny endpoint
`free-delivery` i skeleton HTML koszyka nie potwierdzają samodzielnie kosztu
transportu. Trzeba sprawdzić rzeczywisty wybór dostawy całego zamówienia.

## Zmiana kodu

Dodano opcjonalne `minimumPackages`, oddzielone od `purchaseMultiple`.
Liczenie pojedynczej oferty, wybór ofert, optymalizator kombinacji, porównanie
odbioru i dostawy oraz podział między sklepy respektują oba ograniczenia.
Warianty z różnymi minimami nie są łączone w jedną pozornie tańszą ofertę.

Optymalizator dopuszcza dla każdego sprzedawcy zero opakowań albo jego minimum
i kolejne zwykłe przyrosty. Nadal może łączyć różne wielkości i sklepy.
Zachowuje kryteria kosztu oraz naddatku. Duże siatki korzystają z istniejącego
ograniczonego fallbacku, który także respektuje minimum. Fallback nie buduje
tablicy proporcjonalnej do liczby fizycznych opakowań. Dodatnia, bardzo mała
ilość nie staje się pustym darmowym planem.

API przekazuje minimum w ofertach, planach etapów i skonsolidowanym koszyku.
Interfejs potrafi je osobno opisać przy ofercie i zakupie. Aktualny backend
produkcyjny nie udostępnia jeszcze nowej oferty Matbud, więc nowego komunikatu
dla niej nie sprawdzono w produkcyjnym UI. Nie zmieniono migracji ani danych
prac użytkownika.

## Weryfikacja

- 346 testów aplikacji, kalkulatorów, cen i API: PASS, 0 pominiętych.
- W tym 8 nowych testów: 50/51, minimum z przyrostem 42, niezależne wyliczenie
  wszystkich kombinacji dla różnych ilości, zachowanie obu reguł w podziałach
  sklepów, zsumowanie pomieszczeń, walidacja i rzeczywisty lokalny HTTP.
- Deklaracje zależności przebudowano przez `pnpm exec tsc -b lib/pricing-service`;
  następnie API i mobile typecheck: PASS. Pierwszy typecheck API przed
  przebudową zgłosił nieaktualne deklaracje nowego pola.
- 66 chronionych identyfikatorów i negatywne mutacje: PASS.
- Lokalny działający UI nadal pokazuje pierwotne trzy prace, jedną posiadaną
  pozycję, kod 00-001 oraz 790,83 zł = 637,43 zł materiałów + 153,40 zł dostaw.
- Bez nowego wdrożenia Railway. To przygotowanie obsługi reguły zakupu,
  nie potwierdzenie nowej integracji ani zwiększenie pokrycia katalogu.

Dowody w katalogu czatu `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz`:
`work/catalog-wave19-research/matbud-{native-read,cart-proof}.json`,
`work/catalog-status-production-20261026.json`,
`work/minimum-packages-{core-tests,mobile-typecheck,api-typecheck,types-build}-20261026.log`,
`outputs/minimum-packages-original-basket-20261026.txt`.

Ścieżka pieniędzy: kwoty z potwierdzonych ofert w całkowitych groszach;
minimum nigdy nie oznacza rabatu lub darmowego towaru. Dowód rzeczywistości:
natywne anonimowe koszyki sklepu oraz HTTP własnego serwisu. Brak jeszcze
dowodu automatycznej dostawy Matbud — nie ogłaszamy jej jako działającej.

Pełny cel pozostaje aktywny: 27 referencji, transport Castorama/OBI oraz dalsze
potwierdzanie cen i stanów dla lokalnego wyboru użytkownika.
