# W202 — zachowanie przyczyny dostawy i zbędne podziały koszyka

Wdrożono 2026-11-02 13:30 UTC: niepełny plan pokazuje przyczynę dostawy z dokładnego koszyka, zamiast ostatniego błędu innego wariantu. Opcjonalne podziały czekają na pełną wycenę remontu. Lokalny i publiczny odbiór zakończony: po 8 scenariuszy UI i 4 rzeczywiste koszyki HTTP. Nie potwierdzono automatycznej ceny transportu długich profili; zimna duża wycena nadal może wyczerpać budżet czasu. Poprzednia tura celu również była postępem (W201: nowe produkty i fotografie, publiczny odbiór i dwa wdrożenia).

## Problem potwierdzony w rzeczywistych zapytaniach

W201 wykazało problem w koszyku sześciu produktów (cztery materiały malowania i dwa narożniki Rigips). W202 odtworzono go na tych samych rzeczywistych ofertach, przez produkcyjną funkcję porównania i rzeczywiste anonimowe adaptery sklepów, bez podmieniania stawek. Zarejestrowano 25 prób atomowej wyceny, 90 żądań HTTP i 25 276 ms. Część prób po terminie nie rozpoczynała już I/O. Sewera poprawnie zwracała `retailer_transport_quote_required` dla kilku konkretnych koszyków, już po 5,6 s dla samych narożników. Późniejsze warianty otrzymywały `quote_timeout`, bo kończył się wspólny budżet rozpoczęcia zapytań. Ostatni błąd na poziomie nazwy sklepu zasłaniał prawdziwą przyczynę wyceny planu pokazanego użytkownikowi.

Drugi problem: przy niepotwierdzonym transporcie obowiązkowego zamówienia algorytm nadal szukał tańszych opcjonalnych podziałów innych, już wycenionych zamówień. Podział wymaga potwierdzonego koszyka nadrzędnego i nie zmienia nieznanej dostawy pozostałego obowiązkowego sklepu w pełną wycenę całego remontu.

## Zakres poprawki

Przyczyny błędów są powiązane z dokładną sygnaturą zamówienia, ilością i ceną. Opis niepotwierdzonej dostawy pokazanego planu pochodzi z wyniku tego zamówienia. Nie przenosi się przyczyny transportu indywidualnego z innego koszyka i nie ukrywa się faktycznego timeoutu wybranego planu.

Opcjonalne podziały rozpoczynają się dopiero po uzyskaniu pełnej wyceny remontu. Obowiązkowy rozdział magazynów Sewery i przeliczanie po potwierdzonych ograniczeniach zapasów pozostają w pierwszej fazie. Niepełny plan zachowuje wszystkie materiały, nieznany koszt i oznaczenie ograniczonego wyszukiwania. Dotychczasowy limit 80 wycen, terminy, ceny brutto i oryginalna ważność stawek nie są rozszerzane.

## Regresje i rzeczywisty odbiór

Trzy nowe regresje najpierw wszystkie FAILED na źródle W201, następnie PASS po poprawce: indywidualny transport wybranego koszyka nie ginie po późniejszym timeoutcie innego; rzeczywisty timeout wybranego koszyka nie jest zastępowany indywidualnym transportem innego; brak pełnej dostawy blokuje zbędne podziały (2 atomowe wyceny zamiast 14 w tym kontrolowanym przykładzie). Pełne 240 testów pricing PASS, 0 skip. Jest to dowód regresji algorytmu, nie dowód działania żywych sklepów.

Na czystym źródle `af1f514d5c88c181beab13d5ca14752ddcb6fe6c`: 240 pricing / 165 API-lib / 592 mobile / 1064 shared PASS, 0 skip; typy pricing/mobile/API PASS i 66 identyfikatorów prac zachowanych. Grupy częściowo się pokrywają, nie sumować. Kontrolowany przykład 14→2 wycen potwierdza usunięcie zbędnych podziałów, nie jest pomiarem oszczędności żądań w rzeczywistym sklepie.

Lokalnie i publicznie po 4 rzeczywiste koszyki HTTP PASS: sześć materiałów z profilami, grunt i długi profil, pełne malowanie oraz inny kod pocztowy. Duży koszyk zachowuje wszystkie 6 pozycji, liczby listew 2+1 i konkretną informację o indywidualnym transporcie Sewery. Nie ma fikcyjnego pełnego minimum. Pełne malowanie w publicznym odczycie: 307,46 PLN materiałów + 48,90 PLN rzeczywistych dostaw = 356,36 PLN; to obserwacja, nie cena gwarantowana na przyszłość.

Lokalnie i publicznie po 8 scenariuszy UI / 6 rzeczywistych odpowiedzi API / 0 błędów strony / 0 HTTP 429. Sprawdzono cały projekt malowania, dodanie obu długości profilu, wszystkie sześć wymagań, polski komunikat dostawy, szerokości 320/390 px, rzeczywiste odświeżanie cen, kod 00-001 i reload. Pierwsza lokalna próba nie doszła do testu koszyka: po zmniejszeniu syntetycznej kopii do jednego projektu pozostały preferencje czterech usuniętych projektów. Import prawidłowo odrzucił niespójną kopię. Poprawiono wyłącznie fixture testowe i wykonano pełne lokalne r2 oraz publiczne r1; nie zmieniano walidatora ani danych użytkownika.

Duży rzeczywisty koszyk HTTP: 21 931 ms lokalnie, 24 589 ms publicznie. Nie jest to porównywalny kontrolowany benchmark względem wcześniejszego profilera i nie dowodzi ogólnego przyspieszenia. Zimne duże koszyki nadal wymagają usprawniania budżetu i planowania I/O. Poprawiono utratę informacji i zbędne opcjonalne wyszukiwanie, nie wszystkie timeouty.

## Wdrożenie, historia i zakres

[PR 182 wspólnego backendu](https://github.com/jakatora/przetargai/pull/182) scalony jako `693087b90b9ef1fa41017ae5a30f9dc2cb099490`, head `247d1033d52eafbde28fd7c19b54f3a00d431ea2`. Lista statusów GitHub była pusta; lokalnych kontroli nie nazywamy zielonym CI.

Railway API `e7944a51-dd95-4e22-a064-ca57553d1f38`: SUCCESS 2026-11-02 13:30:14 UTC. Odczyt wszystkich 150 wdrożonych plików identyczny z paczką; zmieniony tylko moduł remontu, **149 innych plików i 376 obserwacji seed zachowanych**. SHA-256 modułu `6c0f8183e0b6d13747ab66bf6195034971043c9c0175adde96bd81e308adb875`. Skan 41 poufnych wartości vaulta: 0 wycieków. Nie kopiowano środowiska, testów, zależności ani baz do uploadu.

Zmiana dotyczy wyłącznie serwera. Publiczny WWW zachowuje źródło `94568bf88ada8f559a33e7c2980b695409c73d6b`, a istniejący interfejs korzysta z poprawionego API. Natywne pakiety nie wymagają ponownego zgłoszenia. Izolowane konteksty testowe zamknięte; własny serwer PID 53684 / port 4986 zakończony poprawnie przez komendę `stop`, 0 listenerów. Przeglądarka i localhost 8082 użytkownika nienaruszone.

Cache przed/po: 373→373 obserwacje; wszystkie wcześniejsze źródła zachowane, daty nie starsze. Historia 14 456→14 765 punktów: zachowano 14 436 dawnych punktów, 20 najstarszych usunęła wyłącznie istniejąca retencja 60 punktów na źródło. Brak nieoczekiwanej utraty. Żadnej fikcyjnej zmiany ceny ani dostawy 0 za nieznany koszt. Pięć zastanych plików WIP ma niezmienione SHA-256.

Artefakty: `G:/Projekty/asystent-remontu-work/wave202-20261102`, w tym `final-proof.json`, `native-profile-baseline.json`, lokalne/publiczne `*-http-cases.json` i `*-mixed-qa.json`, `scope-proof.json`, `candidate-cleanup.json`. Natywne buildy 1.2.0/10 pozostają zamrożone. Stan sklepów 2026-11-02 13:32 UTC: Apple WAITING_FOR_REVIEW; Google zatwierdziło aktualizację, ale wymaga ręcznej publikacji (`APPROVED_NOT_PUBLISHED`). Odrębny raport publikacji zawiera wymagany krok. Cel ciągłego rozwoju pozostaje aktywny.
