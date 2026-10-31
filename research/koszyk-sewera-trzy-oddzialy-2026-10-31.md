# Koszyk remontu z kilku oddziałów Sewery — 2026-10-31

Przy pięciu produktach z trzech potwierdzonych oddziałów produkcyjne API zwracało `needs_delivery_costs`, mimo że każdy oddział potrafił wycenić własną przesyłkę. Dotychczasowy podział obsługiwał tylko dwie pozycje. Użytkownik nie otrzymywał pełnej kwoty większego zestawu.

Czytnik Sewery przekazuje teraz grupy dokładnych ofert według zweryfikowanego oddziału. Silnik tworzy osobny anonimowy koszyk dla każdej grupy, dzięki czemu trzy taśmy z Sosnowca pozostają w jednym zamówieniu. Każdy koszyk ponownie potwierdza produkty, ilości, ceny brutto, stan i dostawę dla kodu pocztowego. Pełny wynik wymaga wszystkich poprawnych wycen. Niepełny, zdublowany lub obcy zestaw ofert, inny oddział, wygasła wycena albo inny kod nie tworzą pełnej kwoty.

Kwoty sumowane są w groszach. Wszystkie opakowania muszą wystąpić dokładnie raz, z pierwotną ceną i ilością. Wspólny termin ważności kończy się wraz z najwcześniejszą wyceną częściową. Funkcja działa po włączeniu osobnych zamówień; interfejs pokazuje liczbę zamówień, produkty oraz koszt każdej dostawy. Dalsze podziały wewnątrz jednego oddziału nie są wyczerpująco porównywane, co oznaczamy jako ograniczony zakres porównania.

## Rzeczywisty sklep

Anonimowe natywne koszyki z 2026-10-31, dla testowego kodu `00-001`, potwierdziły:

| Oddział | Produkty | Materiały | Dostawa |
| --- | --- | ---: | ---: |
| Sosnowiec | Rigips papierowa 75 m, akustyczna 50 mm i 30 mm po 30 m | 69,53 zł | 19,90 zł |
| Tarnowskie Góry | Dulux Easycare nieskazitelna biel 9 l | 279,89 zł | 30,90 zł |
| Katowice | Atlas GTA 18 kg | 65,90 zł | 23,90 zł |
| Razem | 5 produktów, 3 zamówienia | 415,32 zł | 74,70 zł |

Łączny potwierdzony koszt wyniósł **490,02 zł**. To wycena konkretnego zestawu, kodu i chwili; nie oznacza minimum całego rynku. Nie złożono zamówienia ani płatności.

Dokładne karty: [taśma papierowa](https://sklep.sewera.pl/tasma-spoinowa-papierowa-50mm-x-75m-rigips-p7448), [taśma 50 mm](https://sklep.sewera.pl/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-50mm-x-30m-rigips-p7445), [taśma 30 mm](https://sklep.sewera.pl/tasma-akustyczna-do-profili-piankowa-uszczelniajaca-30mm-x-30m-rigips-p7444), [Dulux](https://sklep.sewera.pl/farba-wewnetrzna-biala-easycare-nieskazitelna-biel-9l-mat-dulux-p21385), [Atlas GTA](https://sklep.sewera.pl/atlas-gta-gotowa-gladz-polimerowa-18kg-p6321).

Testy: silnik cen 152/152, czytnik koszyka 10/10, mobile 372/372, typecheck API i mobile. Produkcyjny odbiór wdrożenia zostanie dopisany po jego zakończeniu.
