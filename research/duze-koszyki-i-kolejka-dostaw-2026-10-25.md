# Duże koszyki i kolejka wycen dostawy — 2026-10-25

## Zakres i aktualne pokrycie

Katalog pozostaje bez zmian: **51/103 produktów ma zweryfikowane oferty, 76 ofert w 19 sklepach; 52 produkty pozostają do uzupełnienia. Zdjęcia: 103/103.** Obsługa większego koszyka nie oznacza uzyskania cen lub dostawy dla wszystkich produktów. Źródłem licznika jest `catalogue-coverage-2026-10-25.json`.

## Zmiana zachowania

- Czwarta równoczesna wycena czeka w ograniczonej kolejce FIFO zamiast od razu zwracać `quote_busy`. Limit: trzy aktywne zadania, 12 oczekujących, 15 sekund oczekiwania. Powtórzona identyczna wycena współdzieli zadanie; klucz nadal obejmuje kod pocztowy, cały koszyk i cenę. Przeciążenie kolejki nie jest zapamiętywane jako negatywna wycena.
- Automatyczne porównanie obsługuje do 200 produktów, 64 aktywnych sklepów i 10 000 opakowań na produkt. Dla większych zestawów wybiera ograniczoną liczbę kompletnych przydziałów. Maksymalnie 80 odrębnych koszyków sklepowych wymaga rzeczywistej wyceny. UI nadal oznacza `searchLimited` i liczbę potwierdzonych zestawów; wynik nie jest gwarancją minimum wszystkich kombinacji lub całego rynku.
- Dla wielu sklepów nie stosujemy enumeracji 2^n ani 32-bitowej maski. Zachowujemy także kompletne alternatywy jednego sklepu. Odbiór osobisty wybiera opakowania bez enumeracji podzbiorów. Ręcznie wpisane, stałe dostawy zachowują osobny limit 50 produktów i 10 sklepów.
- Znane nieobsługiwane integracje nie zajmują miejsc koszyków z automatyczną dostawą. Brak ceny dostawy pozostaje jawnym brakiem wyceny.
- Publiczne karty Sewery są pobierane maksymalnie trzema równoczesnymi odczytami. Zmiany anonimowego koszyka pozostają sekwencyjne. Błąd odczytu zatrzymuje kolejne karty i czeka na zakończenie już rozpoczętych żądań. Potwierdzenie bieżącej ceny, ilości, magazynu i sumy w koszyku sklepu pozostaje obowiązkowe. Sesje koszyków nie są współdzielone.

## Dowody przed wdrożeniem

- 239 testów logiki i HTTP: PASS, bez pominięć. Wśród nich 103 produkty/33 sklepy z odbiorem, 103 produkty/12 sklepów z kontrolowaną dostawą, 21 produktów/33 sklepy z zachowaniem ostatniego sklepu i odczekanie aktywnych odczytów po błędzie Sewery.
- 55 regresji istniejących tras wspólnego backendu: PASS, bez pominięć. Typecheck mobile, API i pricing-service: PASS. Definicje prac, obmiarów, rejestr i migracje nie zmieniły się.
- Rzeczywiste HTTP do sklepów: cztery równoczesne kody 00-001, 30-001, 40-001, 80-001 otrzymały wycenę bez `quote_busy`. Prescot potwierdził 61 sztuk Wago: 167,75 zł + 24,60 zł = 192,35 zł. Koszyk 21 dostępnych pozycji z odbiorem: 684,03 zł. Dotychczasowe trzy prace remontowe nadal: **790,83 zł** z dostawą.

**Nie potwierdzono dostawy całego rzeczywistego koszyka 21 produktów.** Realbud zwracał „Transport na zapytanie” z techniczną kwotą 0 zł; Sewera brak gotowego transportu, brak magazynowy lub timeout. To nie jest darmowa dostawa. Kontrolowane testy 103 produktów nie są dowodem dostawy 103 rzeczywistych produktów.

Dowody robocze: `large-basket-tests-final.log`, `large-basket-shared-regression.log`, `large-basket-available-local-live-proof.json`, `large-basket-original-regression-local-proof.json` w katalogu pracy tej rozmowy.

## Wdrożenie i źródła

Przygotowano ze świeżego snapshotu działającej produkcji d5dd1dd0-164c-43af-b3b9-fca2c225b2ab; archiwum 955873 B, SHA256 `643d59bec0e751b574cff7d525e107c49057134438f7cbbf572f0baac0a5a3b2`. Zmienia się wyłącznie `src/services/remont-pricing.cjs`. Bootstrap ofert pozostaje identyczny.

Źródła backendu: [PR11](https://github.com/jakatora/przetargai/pull/11), commit źródłowy `4f2c1dc819ddd6b64a334c24187f84db6111d4c6`, merge `944634f48e59e02d329e94d70b8e3738b340a3a8`. Railway **3ce54580-f2a2-427b-b7c3-a3c527dcfba3 SUCCESS**, 2026-10-25T16:23:55.974Z (17:23 Warszawa).

Po potwierdzeniu SUCCESS rzeczywisty HTTPS do produkcji potwierdził: wszystkie **51 dostępnych produktów** w jednym zestawie z odbiorem osobistym (po jednym opakowaniu, 3472,32 zł), cztery równoczesne wyceny narożnika dla różnych kodów (każda 30,99 zł, bez `quote_busy`), Wago 61 szt. za 192,35 zł z dostawą oraz dotychczasowy koszyk trzech prac 790,83 zł z dostawą. `/health` 200, `/auth/me` 401. Dowód `work/large-basket-production-proof.json`; kopia w `outputs`. Cena zestawu po jednym opakowaniu jest testem technicznym, nie uniwersalną listą materiałów remontowych.

## Pozostała praca

Uzupełnienie 52 brakujących pozycji cenowych; dostawy siedmiu pozostałych sklepów i działający dostęp Castorama/OBI; jawnie rozdzielone zamówienia jednego sklepu, jeśli ciężki cały koszyk wymaga indywidualnego transportu; zgodność systemów hydroizolacji i zużycia; ręczne pozycje, narzędzia, częściowo posiadane ilości oraz trwały wybór jakości. Cel obejmujący wszystkie 103 produkty pozostaje aktywny.
