# W202 — zachowanie przyczyny dostawy i zbędne podziały koszyka

Stan 2026-11-02: poprawka źródłowa i trzy regresje przygotowane; odbiór rzeczywistego HTTP i wdrożenie jeszcze niewykonane. Poprzednia fala W201 jest wdrożona. Poprzednia tura celu była postępem: nowe źródła i fotografie, publiczny odbiór i dwa wdrożenia.

## Problem potwierdzony w rzeczywistych zapytaniach

W201 wykazało problem w koszyku sześciu produktów (cztery materiały malowania i dwa narożniki Rigips). W202 odtworzono go na tych samych rzeczywistych ofertach, przez produkcyjną funkcję porównania i rzeczywiste anonimowe adaptery sklepów, bez podmieniania stawek. Zarejestrowano 25 atomowych wycen, 90 żądań HTTP i 25 276 ms. Sewera poprawnie zwracała `retailer_transport_quote_required` dla kilku konkretnych koszyków, już po 5,6 s dla samych narożników. Późniejsze warianty otrzymywały `quote_timeout`, bo kończył się wspólny budżet rozpoczęcia zapytań. Ostatni błąd na poziomie nazwy sklepu zasłaniał prawdziwą przyczynę wyceny planu pokazanego użytkownikowi.

Drugi problem: przy niepotwierdzonym transporcie obowiązkowego zamówienia algorytm nadal szukał tańszych opcjonalnych podziałów innych, już wycenionych zamówień. Podział wymaga potwierdzonego koszyka nadrzędnego i nie zmienia nieznanej dostawy pozostałego obowiązkowego sklepu w pełną wycenę całego remontu.

## Zakres poprawki

Przyczyny błędów są powiązane z dokładną sygnaturą zamówienia, ilością i ceną. Opis niepotwierdzonej dostawy pokazanego planu pochodzi z wyniku tego zamówienia. Nie przenosi się przyczyny transportu indywidualnego z innego koszyka i nie ukrywa się faktycznego timeoutu wybranego planu.

Opcjonalne podziały rozpoczynają się dopiero po uzyskaniu pełnej wyceny remontu. Obowiązkowy rozdział magazynów Sewery i przeliczanie po potwierdzonych ograniczeniach zapasów pozostają w pierwszej fazie. Niepełny plan zachowuje wszystkie materiały, nieznany koszt i oznaczenie ograniczonego wyszukiwania. Dotychczasowy limit 80 wycen, terminy, ceny brutto i oryginalna ważność stawek nie są rozszerzane.

## Regresje i dalszy odbiór

Trzy nowe regresje najpierw wszystkie FAILED na źródle W201, następnie PASS po poprawce: indywidualny transport wybranego koszyka nie ginie po późniejszym timeoutcie innego; rzeczywisty timeout wybranego koszyka nie jest zastępowany indywidualnym transportem innego; brak pełnej dostawy blokuje zbędne podziały (2 atomowe wyceny zamiast 14 w tym kontrolowanym przykładzie). Pełne 240 testów pricing PASS, 0 skip. Jest to dowód regresji algorytmu, nie dowód działania żywych sklepów.

Pozostaje odbiór na czystym źródle, ponowne rzeczywiste wyliczenie koszyka sześciu produktów, publiczna aplikacja oraz wdrożenie wspólnego backendu z zachowaniem innych usług. Nie ogłaszamy usunięcia wszystkich limitów czasu: zimne duże koszyki nadal wymagają dalszego usprawniania.

Artefakty: `G:/Projekty/asystent-remontu-work/wave202-20261102`. Natywne buildy 1.2.0/10 zgłoszone do sklepów pozostają zamrożone. Pięć zastanych plików WIP poza zakresem.
