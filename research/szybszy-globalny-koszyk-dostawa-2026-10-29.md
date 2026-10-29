# Globalny koszyk: mniej zbędnych wycen dostawy — 2026-10-29

## Problem

Dla pięciu gradacji papieru Klingspor (P120/P150/P180/P220/P240), po 50 arkuszy każdej, produkcyjny ranking potwierdzał koszyk Matiw 201,24 zł z jedną dostawą, lecz próbował jeszcze wyceniać wiele droższych kombinacji mieszanych z Sewerą. Część wywołań kończyła się `quote_timeout`, więc wynik miał status `needs_delivery_costs`. To utrudniało użytkownikowi rozpoznanie najtańszego sprawdzonego zestawu.

## Zmiana

Silnik najpierw wycenia reprezentatywne pełne zamówienia sklepów. Gdy ma już potwierdzoną kwotę całego zestawu, oblicza dla każdej pozostałej kombinacji **optymistyczną dolną granicę**: sumę cen materiałów pomniejszoną o maksymalne dopuszczalne zaokrąglenie koszyka (1 gr na opakowanie), przy dostawie przyjętej jako 0 zł. Jeśli nawet ta granica jest wyższa niż potwierdzona kwota, kombinacja nie może wygrać i nie wymaga wywołania sklepu. Kombinacje, które mogą być tańsze, nadal przechodzą pełną wycenę, a błędy tych wycen pozostają widoczne.

## Dowód

Lokalny HTTP z rzeczywistymi anonimowymi koszykami obu sklepów: przed zmianą dla pięciu paczek status `needs_delivery_costs`, najlepszy potwierdzony Matiw 201,24 zł, timeouty mieszanych kombinacji. Po zmianie: `compared`, zero braków i błędów wyceny, 4 porównane kompletne koszyki, najtańszy Matiw 201,24 zł (182,24 zł materiałów + 19,00 zł jednej dostawy). Test jednostkowy sprawdza odcięcie kombinacji przegrywających już po cenie materiałów; drugi dowodzi, że potencjalnie tańszy podział między sklepy nadal jest wyceniany i może wygrać.

Zmiana dotyka wyłącznie wyboru zamówień do wyceny. Nie odejmuje dostawy od zwycięskiego koszyka, nie zmienia cen sklepu i nie zakłada fikcyjnej stawki 0 zł w wyniku. Testy pricing 151/151, typecheck pricing/mobile i `git diff --check` przeszły. Pełny dowód produkcyjny i test wspólnego backendu wymagają wdrożenia wygenerowanego modułu.
