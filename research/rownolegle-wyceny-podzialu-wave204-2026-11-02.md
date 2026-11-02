# W204 — krótsze oczekiwanie na wyceny osobnych zamówień

Poprzednia fala W203 była postępem: wdrożyła dwa produkty Viva, zdjęcia i dobór 2/4 kg z rzeczywistą dostawą. Cel rozwoju pozostaje aktywny.

Problem: po potwierdzeniu pełnego zamówienia każdy podział na osobne dostawy był sprawdzany kolejno. Przy czterech różnych produktach to 14 prawidłowych podkoszyków; czas wynikał także z sekwencji niezależnych sesji, mimo wspólnej kolejki dopuszczającej trzy koszyki.

Zmiana: najwyżej trzech pracowników na podział jednego zamówienia, każdy koszyk ma osobną sesję. Cały zapas i cena pełnego zamówienia muszą nadal być potwierdzone przed rozpoczęciem. Liczba badanych podziałów nie maleje. Wyniki są składane w kolejności wejścia, więc czas odpowiedzi sklepu nie wybiera innego równorzędnego planu. Dla dużych zamówień pozostaje dotychczasowy oznaczony wybór prób, bez nowej obietnicy pełnego przeszukania.

Wspólna kolejka sprzedawców, limit 80 wycen, limity I/O, kod pocztowy, ważność dowodów, zachowanie opakowań, rabaty koszyka i odmowy ponad stan pozostają obowiązujące. Mutacje jednego koszyka pozostają sekwencyjne. Nie dodajemy taryfy ani stałego kosztu, nie zmieniamy produktów lub danych klienta.

Regresje sterowane: przed zmianą 3 FAIL / 1 PASS (tylko jeden koszyk uruchamiał się naraz), po zmianie 4 PASS. Testy używają rzeczywistych funkcji produkcyjnych i ręcznie kontrolują ukończenie niezależnych obietnic; nie opierają się na kruchym progu ms. Sprawdzają wszystkie 14 podkoszyków, maksimum 3, niezmienność opakowań, brak pracy przed kontrolą pełnego stanu, deterministyczny wynik mimo odwrotnej kolejności odpowiedzi oraz domknięcie prac po błędzie. Nie są benchmarkiem sklepu.

Pricing przed zamrożeniem: 246 PASS /0 FAIL /0 SKIP. Pełne czyste typy, testy, rzeczywiste porównanie HTTP starej/nowej wersji i wdrożenie są w toku.
