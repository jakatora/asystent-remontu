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

Testy: silnik cen 152/152, czytnik koszyka 10/10, mobile 372/372, typecheck API i mobile. Pełny zestaw wspólnego backendu przeszedł 1054/1054 przy `test-concurrency=2`, bez pominięć. Pierwszy przebieg z domyślną równoległością zatrzymał się na teście kopii zapasowej; test uruchomiony osobno przeszedł 4/4, a pełny ponowny przebieg również zakończył się poprawnie. Kontrola legacy IDs i wszystkie 7 URL-i czytnika koszyka przeszły.

## Odbiór produkcyjny

Backend [PR 123](https://github.com/jakatora/przetargai/pull/123) scalono jako `80f9f92`. Railway deployment `3f694d4c-0acc-4925-8896-f23c890594dd` ma status **SUCCESS**. Produkcyjny endpoint HTTPS dla wybranego sklepu Sewera oraz kodu testowego `00-001` zwrócił `compared`, brakujących produktów 0, materiały 41532 gr + dostawy 7470 gr = **49002 gr**, trzy zamówienia ze wskazanymi oddziałami i pięcioma produktami. Po wyłączeniu osobnych zamówień zwrócił `needs_delivery_costs` bez pełnej kwoty.

Globalny ranking tego samego zestawu na produkcji zwrócił `compared`, braków 0 i **374,03 zł z dostawami**: Lobo — ta sama farba Dulux 9 l za 171,90 zł + 22,90 zł dostawy; Sewera — trzy taśmy i Atlas GTA za 135,43 zł + 43,80 zł dostaw z Sosnowca i Katowic. Suma materiałów 307,33 zł, dostaw 66,70 zł. W sprawdzonym zakresie to o **115,99 zł mniej** niż zakup wszystkiego w Sewerze. Sewera wyceniła dokładny kod `00-001`; Lobo podało krajową taryfę PL. Wynik ma `searchLimited=true`, więc jest najtańszym potwierdzonym zestawem w porównanym zakresie, bez gwarancji minimum całego rynku.

Świeża kopia produkcji miała 148 plików i 278 obserwacji. Pakiet zmienił tylko moduł wyceny, zachowując pozostałe 147 plików. Po wdrożeniu porównanie wykazało 148/148 plików identycznych z przygotowanym pakietem, nadal 278 obserwacji. SHA256 modułu: `f5fe25d9ebbe8d3f32f44b53abc8799eef4f86b8483bbb3dde2c61cf54fdd763`.

Automatyczny podział wymaga obecnie osobno zweryfikowanego oddziału dla każdej oferty i jednej wielkości opakowania w danej pozycji. Koszyki mieszające takie oferty z produktami bez wskazanego oddziału nadal wymagają dalszej obsługi. Brakująca dostawa pozostaje jawnym brakiem pełnego kosztu.
