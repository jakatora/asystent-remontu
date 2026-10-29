# Potwierdzona dostawa z pamięci po limicie czasu żądania

Data weryfikacji: 2026-10-29. Kod `00-001` jest kodem testowym; przy zakupach aplikacja używa kodu użytkownika.

## Problem

Porównanie całego remontu ogranicza czas rozpoczynania nowych anonimowych wycen w sklepach. Serwis ma już pamięć potwierdzonych, krótkotrwałych wycen dla dokładnego sklepu, kodu, składu, ilości i cen koszyka. Wcześniejsza osłona limitu odcinała także dostęp do tej pamięci. Powtórne porównanie mogło zatem oznaczyć jako `quote_timeout` wariant, który sklep potwierdził kilka chwil wcześniej.

## Zmiana

Po upływie limitu serwer może wykorzystać **tylko** wcześniej potwierdzoną wycenę dokładnie tego samego pełnego zamówienia. Klucz pamięci obejmuje kod pocztowy, sklep, sumę materiałów oraz każdą ofertę, liczbę opakowań i cenę jednostkową. Wycena musi nadal mieścić się w oknie pamięci i mieć niewygasły termin z odpowiedzi sklepu. Brak wpisu, inny kod, ilość lub cena, wynik błędny i wycena wygasła zwracają `quote_timeout`; nie zaczynają po czasie nowego połączenia ze sklepem. Oryginalny czas potwierdzenia i wygaśnięcia pozostają bez zmian. Osobne limity połączeń ze sklepem i oznaczenie `searchLimited` nadal obowiązują.

## Dowód lokalny

Test anonimowego koszyka [Klingspor P60 w Sewerze](https://sklep.sewera.pl/papier-scierny-gr-60-arkusz-230x280mm-p6905), cena materiału 2,09 zł, kod `00-001`: natywna dostawa 19,90 zł dla tego kodu, czas potwierdzenia `2026-10-29T21:22:58.551Z`. Pierwsza wycena wykonała osiem rzeczywistych żądań do sklepu; ponowny odczyt po sztucznie przekroczonym limicie zwrócił tę samą wycenę bez nowego żądania. Koszyk z ceną materiału 2,10 zł nie odziedziczył stawki i zwrócił `quote_timeout`.

Lokalny HTTP aplikacji dwa razy wycenił pełne zamówienie jednego arkusza: 2,09 zł materiał + 19,90 zł dostawa = **21,99 zł**, status `compared`, zero braków, zakres `postal_code`; drugi odczyt wykonał zero nowych żądań do sklepu. Testy modułu dostaw `10/10`, serwisu wycen `151/151`, typecheck API PASS.

## Odbiór produkcyjny 2026-10-29

Backend [PR #120](https://github.com/jakatora/przetargai/pull/120) został scalony do `main` (`b767176`), a Railway deployment `44e1d482-3c73-4fb3-9ab7-1c0b7fadfdae` ma status `SUCCESS`. Produkcyjny HTTP dla kodu testowego `00-001` potwierdził pełny koszyk dziewięciu gradacji: po jednej sztuce Sewera 15,77 zł materiałów + 19,90 zł dostawa = **35,67 zł**, po 50 sztuk każdej gradacji Matiw 356,98 zł materiałów + 19,00 zł dostawa = **375,98 zł**. Ranking globalny dużego zestawu wskazał ten sam koszyk Matiw. Wszystkie odpowiedzi miały `compared`, zero braków i jedno zamówienie. Dwukrotny produkcyjny odczyt jednego arkusza P60 podał **21,99 zł**, a czas natywnej wyceny pozostał identyczny (`2026-10-29T21:28:59.764Z`).

Migawka przed zmianą miała 275 obserwacji i 148 plików. W przygotowanym pakiecie zmienił się tylko wygenerowany moduł wycen; pozostałe 147 plików zachowano. Po wdrożeniu wszystkie 148 plików były bajtowo zgodne z pakietem, obserwacji nadal 275, SHA-256 modułu `60a2c3c0980a104400ca0e5a48cb37b9ffba67e2283d39a2f02fedb23e054c07`. Testy współdzielonego backendu `1054/1054` PASS.

To poprawia wykorzystanie potwierdzonych wyników przy większych porównaniach. Nie zastępuje brakujących integracji Castoramy i OBI ani nie dowodzi przeszukania wszystkich możliwych podziałów zakupów.
