# Zwykłe produkty w koszykach kilku oddziałów Sewery — 2026-10-31

Koszyk łączący taśmę Rigips z przypisanym Sosnowcem, farbę Dulux z Tarnowskich Gór i zwykłą taśmę malarską Blue Dolphin nie otrzymywał na produkcji pełnej wyceny: `needs_delivery_costs`, braków materiałów 0, `quote_unavailable`.

Czytnik przekazuje teraz osobno oferty przypisane do zweryfikowanych oddziałów oraz zwykłe oferty. Silnik porównuje kompletne podziały, w których zwykłe produkty trafiają do istniejących oddziałów albo do domyślnego koszyka Katowic. Każda próba musi potwierdzić dokładne produkty, ilości, ceny brutto, stan oraz własną dostawę dla kodu użytkownika. Wybierana jest najniższa suma rzeczywiście potwierdzonych dostaw. Fizyczne opakowania pozostają niezmienione i występują raz w pełnym planie.

Sprawdzanych jest maksymalnie 32 podziałów, ze współdzieloną pamięcią wycen, limitem żądań i czasem całego porównania. Pierwsze próby zachowują użyteczny pełny plan także przy wyczerpaniu czasu późniejszych prób. Zakres pozostaje jawnie ograniczony: inne oddziały i dalsze podziały ilości mogą mieć inne koszty.

Niedobór zwykłego produktu podczas próby z alternatywnego oddziału nie nakłada globalnego limitu jego oferty w tym porównaniu. Test całego silnika odtwarza brak produktu w Katowicach i poprawną dostawę z Sosnowca; pozycja pozostaje dostępna w potwierdzonym pełnym koszyku. Nadal uwzględniamy zweryfikowane niedobory produktów przypisanych do konkretnego oddziału.

## Rzeczywiste koszyki

Natywne odczyty z 2026-10-31, dla testowego kodu `00-001`:

| Produkt | Cena opakowania |
| --- | ---: |
| [Rigips papierowa 50 mm × 75 m](https://sklep.sewera.pl/tasma-spoinowa-papierowa-50mm-x-75m-rigips-p7448), EAN 5905637118010 | 21,94 zł |
| [Dulux Easycare nieskazitelna biel 9 l](https://sklep.sewera.pl/farba-wewnetrzna-biala-easycare-nieskazitelna-biel-9l-mat-dulux-p21385), EAN 5904078198759 | 279,89 zł |
| [Blue Dolphin taśma malarska 30 mm × 50 m](https://sklep.sewera.pl/tasma-malarska-niebieska-30mmx50m-p6966), EAN 5907758515952 | 14,72 zł |

Materiały razem: **316,55 zł**. Trzy osobne natywne koszyki dały dostawy 19,90 + 30,90 + 19,90 = 70,70 zł. Po dołączeniu taśmy malarskiej do Sosnowca dostawy kosztowały **50,80 zł**, a cały zestaw **367,35 zł**. To o 19,90 zł mniej niż trzy przesyłki. Dołączenie jej do Tarnowskich Gór również potwierdziło 50,80 zł. Nie złożono zamówienia ani płatności. Wynik dotyczy wskazanych opakowań, kodu i czasu, bez gwarancji minimum całego rynku.

Testy: silnik cen 156/156, czytnik koszyka 11/11, typecheck API/mobile. Odbiór pełnego endpointu i wdrożenia zostanie dopisany po zakończeniu.
