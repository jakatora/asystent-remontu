# Potwierdzona dostawa z pamięci po limicie czasu żądania

Data weryfikacji: 2026-10-29. Kod `00-001` jest kodem testowym; przy zakupach aplikacja używa kodu użytkownika.

## Problem

Porównanie całego remontu ogranicza czas rozpoczynania nowych anonimowych wycen w sklepach. Serwis ma już pamięć potwierdzonych, krótkotrwałych wycen dla dokładnego sklepu, kodu, składu, ilości i cen koszyka. Wcześniejsza osłona limitu odcinała także dostęp do tej pamięci. Powtórne porównanie mogło zatem oznaczyć jako `quote_timeout` wariant, który sklep potwierdził kilka chwil wcześniej.

## Zmiana

Po upływie limitu serwer może wykorzystać **tylko** wcześniej potwierdzoną wycenę dokładnie tego samego pełnego zamówienia. Klucz pamięci obejmuje kod pocztowy, sklep, sumę materiałów oraz każdą ofertę, liczbę opakowań i cenę jednostkową. Wycena musi nadal mieścić się w oknie pamięci i mieć niewygasły termin z odpowiedzi sklepu. Brak wpisu, inny kod, ilość lub cena, wynik błędny i wycena wygasła zwracają `quote_timeout`; nie zaczynają po czasie nowego połączenia ze sklepem. Oryginalny czas potwierdzenia i wygaśnięcia pozostają bez zmian. Osobne limity połączeń ze sklepem i oznaczenie `searchLimited` nadal obowiązują.

## Dowód lokalny

Test anonimowego koszyka [Klingspor P60 w Sewerze](https://sklep.sewera.pl/papier-scierny-gr-60-arkusz-230x280mm-p6905), cena materiału 2,09 zł, kod `00-001`: natywna dostawa 19,90 zł dla tego kodu, czas potwierdzenia `2026-10-29T21:22:58.551Z`. Pierwsza wycena wykonała osiem rzeczywistych żądań do sklepu; ponowny odczyt po sztucznie przekroczonym limicie zwrócił tę samą wycenę bez nowego żądania. Koszyk z ceną materiału 2,10 zł nie odziedziczył stawki i zwrócił `quote_timeout`.

Lokalny HTTP aplikacji dwa razy wycenił pełne zamówienie jednego arkusza: 2,09 zł materiał + 19,90 zł dostawa = **21,99 zł**, status `compared`, zero braków, zakres `postal_code`; drugi odczyt wykonał zero nowych żądań do sklepu. Testy modułu dostaw `10/10`, serwisu wycen `151/151`, typecheck API PASS. Wdrożenie produkcyjne zostanie opisane po osobnym odbiorze.

To poprawia wykorzystanie potwierdzonych wyników przy większych porównaniach. Nie zastępuje brakujących integracji Castoramy i OBI ani nie dowodzi przeszukania wszystkich możliwych podziałów zakupów.
