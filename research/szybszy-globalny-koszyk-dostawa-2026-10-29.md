# Globalny koszyk: mniej zbędnych wycen dostawy — 2026-10-29

## Problem

Dla pięciu gradacji papieru Klingspor (P120/P150/P180/P220/P240), po 50 arkuszy każdej, produkcyjny ranking potwierdzał koszyk Matiw 201,24 zł z jedną dostawą, lecz próbował jeszcze wyceniać wiele droższych kombinacji mieszanych z Sewerą. Część wywołań kończyła się `quote_timeout`, więc wynik miał status `needs_delivery_costs`. To utrudniało użytkownikowi rozpoznanie najtańszego sprawdzonego zestawu.

## Zmiana

Silnik najpierw wycenia reprezentatywne pełne zamówienia sklepów. Gdy ma już potwierdzoną kwotę całego zestawu, oblicza dla każdej pozostałej kombinacji **optymistyczną dolną granicę**: sumę cen materiałów pomniejszoną o maksymalne dopuszczalne zaokrąglenie koszyka (1 gr na opakowanie), przy dostawie przyjętej jako 0 zł. Jeśli nawet ta granica jest wyższa niż potwierdzona kwota, kombinacja nie może wygrać i nie wymaga wywołania sklepu. Kombinacje, które mogą być tańsze, nadal przechodzą pełną wycenę, a błędy tych wycen pozostają widoczne.

## Dowód

Lokalny HTTP z rzeczywistymi anonimowymi koszykami obu sklepów: przed zmianą dla pięciu paczek status `needs_delivery_costs`, najlepszy potwierdzony Matiw 201,24 zł, timeouty mieszanych kombinacji. Po zmianie: `compared`, zero braków i błędów wyceny, 4 porównane kompletne koszyki, najtańszy Matiw 201,24 zł (182,24 zł materiałów + 19,00 zł jednej dostawy). Test jednostkowy sprawdza odcięcie kombinacji przegrywających już po cenie materiałów; drugi dowodzi, że potencjalnie tańszy podział między sklepy nadal jest wyceniany i może wygrać.

Zmiana dotyka wyłącznie wyboru zamówień do wyceny. Nie odejmuje dostawy od zwycięskiego koszyka, nie zmienia cen sklepu i nie zakłada fikcyjnej stawki 0 zł w wyniku. Testy pricing 151/151, typecheck pricing/mobile i `git diff --check` przeszły. Wynik testów wspólnego backendu i dowód produkcyjny znajdują się poniżej.

## Wdrożenie i potwierdzenie produkcyjne

Aplikacja: commit `f89aabb` wypchnięty. Backend [PR 116](https://github.com/jakatora/przetargai/pull/116) scalono jako `03bd8d1934cf18fbd1dfcf6bf49423c44f76cadc`. Railway deployment `3c518f26-bda0-4f6f-a225-d966a6e6220d` osiągnął `SUCCESS`. Świeża migawka miała 267 obserwacji i 148 plików; przygotowanie zmieniło wyłącznie wygenerowany moduł pricing, zachowując pozostałe 147 plików. Wspólny backend 1054/1054 testów. Po wdrożeniu 148/148 plików zgodnych, 267 obserwacji, SHA modułu `ef6d0b2804673793f8344d8388180a14c389efc0ab3ea4be29f20c7260594456`.

Produkcyjny HTTP dla testowego kodu `00-001` i pięciu gradacji: 1 arkusz każdej w Sewerze `compared`, zero braków, 27,94 zł z dostawą dla kodu; 50 arkuszy każdej w Matiw `compared`, zero braków, 201,24 zł ze stawką krajową; globalny ranking dla 50 sztuk `compared`, zero braków i niewycenionych koszyków, Matiw 201,24 zł. Obie wyceny obejmują jedną dostawę na zamówienie. Stawka Matiw obowiązuje jako krajowa taryfa z anonimowego koszyka i nie jest indywidualnym potwierdzeniem dla każdego adresu.
