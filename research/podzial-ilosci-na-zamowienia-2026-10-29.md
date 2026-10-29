# Podział ilości produktu na tańsze zamówienia

Stan na 2026-10-29. Aplikacja porównuje teraz zakup kilku opakowań jednego produktu w jednym zamówieniu oraz w kilku mniejszych zamówieniach z rzeczywiście wycenioną dostawą. Rozwiązuje to przypadek, w którym większy koszyk uruchamia znacznie droższy transport.

## Wynik dla użytkownika

Dla 20 m² podłogi i 10% zapasu potrzeba 22 m² podkładu Arbiton Secura Thermo Aquastop Smart, czyli 4 fizycznych opakowań po 6 m². Produkt pozostaje dokładnie ten sam: EAN 5905167826942, [oferta Kronodom](https://kronodom.pl/podklad-pod-panele-arbiton-secura-thermo-aquastop-smart-16mm-1opk.6m2-czerwona-harmonijka).

| Sposób zakupu | Materiały | Dostawy | Razem |
| --- | ---: | ---: | ---: |
| Jedno zamówienie 4 opakowań | 247,92 zł | 249,00 zł | 496,92 zł |
| Dwa zamówienia po 2 opakowania | 247,92 zł | 2 × 69,00 zł | **385,92 zł** |

Oszczędność wynosi **111 zł**, bez zmiany produktu i bez kupowania dodatkowego lub mniejszego zapasu. Aplikacja pokazuje oba wymagane zamówienia, ich ilości `2 × 6 m²`, materiały po 123,96 zł i dostawę po 69 zł. Ostrzega, że złączenie ich ponownie w koszyku sklepu może uruchomić droższy transport. Opcja „Jedno zamówienie w każdym sklepie” zachowuje cenę 496,92 zł; wybór należy do użytkownika.

Kwoty pochodzą z bieżących anonimowych koszyków sklepu i produkcyjnego API. To wycena krajowa dla Polski, nie potwierdzenie doręczenia pod pełny adres. [Polityka dostaw Kronodom](https://kronodom.pl/opcje-i-koszty-dostawy) wyjaśnia zależność transportu od wagi i wymiarów; stawki nie są dzielone ani zgadywane na podstawie banera „od”.

## Reguły obliczania

- Najpierw musi przejść wycena pełnego koszyka. Odmowy z powodu braku stanu, zmiany ceny lub niedostępności nie można obejść, tworząc mniejsze koszyki.
- Dzielimy liczbę pełnych fizycznych opakowań jednego produktu w jednym formacie. Suma liczby opakowań każdej oferty musi być równa pierwotnej. Identyfikacja produktu, oferta, jednostka, format opakowania, cena i metadane zakupu pozostają takie same.
- Każde mniejsze zamówienie nadal spełnia minimalną liczbę opakowań i wielokrotność partii. Niewykonalna reszta nie staje się dodatkowym zamówieniem.
- Dostawa każdego sprawdzanego kształtu koszyka pochodzi z rzeczywistego adaptera sklepu. Identyczne koszyki mogą korzystać z tej samej aktualnej wyceny w cache, tak jak dotychczasowe porównania. Nie tworzymy ani nie składamy zamówień handlowych.
- Suma materiałów jest kontrolowana oddzielnie od sumy dostaw. Plan z brakującym lub podwójnie policzonym opakowaniem, inną ceną, jednostką lub produktem zostaje odrzucony.
- Dowód obejmuje wycenę pełnego stanu oraz mniejsze koszyki. Ważność całego planu kończy się wraz z najwcześniejszym z tych dowodów, bez przedłużania pierwotnego czasu cache.
- Wyszukiwanie sprawdza do 12 kształtów koszyka i do 8 zamówień dla dzielonego produktu, w ramach istniejącego wspólnego limitu żądań i czasu. Zaczyna od podziałów zbliżonych wielkością. Przy równej cenie preferuje mniej zamówień, a następnie mniejsze największe zamówienie.

Nowy moduł `quantity-order-partitions.ts` działa razem z dotychczasowym podziałem całych produktów. Gdy większy remont rozdziela produkty, pojedynczą wyodrębnioną pozycję można dodatkowo rozdzielić na mniejsze ilości. Lista zamówień pozostaje płaska i czytelna w istniejącym widoku aplikacji.

Zakres nadal jest ograniczony: nie wyliczamy wyczerpująco wszystkich nakładających się koszyków typu `A2 + B` oraz `A2`, a jedna pozycja zawierająca kilka różnych ofert/formatów nie jest dzielona ilościowo tym modułem. Takie przypadki oraz przekroczenia limitu są oznaczone jako ograniczony zakres wyszukiwania. Najtańszy wynik dotyczy wycenionych wariantów, nie matematycznego minimum każdej możliwej kombinacji.

## Dowody działania

Rzeczywisty adapter Kronodom wykonał 20 żądań: pełny koszyk 4 opakowań oraz mniejsze kształty 2, 1 i 3 opakowań. Potwierdzono cenę 61,98 zł za opakowanie, cały stan i dostawy. Dwie identyczne pozycje planu po 2 opakowania korzystają z aktualnego dowodu dla takiego samego kształtu koszyka.

11 przypadków produkcyjnego HTTP:

| Przypadek | Wynik z dostawą |
| --- | ---: |
| 4 opakowania, jedno zamówienie | 496,92 zł |
| 4 opakowania, dwa zamówienia po 2 | **385,92 zł** |
| 5 opakowań, zamówienia 2 + 3 | 447,90 zł |
| 7 opakowań, trzy zamówienia 3 + 3 + 1 | 640,86 zł |
| Dwa pomieszczenia po 10 m², razem 4 opakowania | 385,92 zł |
| 10 m² podłogi, 2 opakowania w jednym zamówieniu | 192,96 zł |
| Mieszany remont: Volden, folia, taśma i 4 opakowania Arbiton | 700,36 zł |
| 4 opakowania dla kodu 42-209, taryfa Polska | 385,92 zł |
| Niepotwierdzona zgodność podkładu | Brak pełnej wyceny |
| Zapotrzebowanie przekraczające stan | Brak pełnej wyceny, `insufficient_stock` |
| Dotychczasowy komplet Volden / folia 12 m² / taśma 7 m | 314,44 zł |

W aplikacji natywnie sprawdzono 385,92 zł, rozpisanie obu zamówień i oszczędność 111 zł. Przełączenie na jedno zamówienie pokazało 496,92 zł i usunęło instrukcję podziału. Własny projekt QA `proj_mvss3izb0i9m37n4o` po testach przywrócono do oryginalnej nazwy i obmiarów 10 / 12 / 7; pozostałe projekty nietknięte. Zdjęcia i liczby katalogowe w tej zmianie pozostają bez zmian.

## Walidacja i wydanie

- 776 testów rdzenia i 1054 testy backendu: 0 błędów, 0 pominiętych. Testy obejmują minima i partie, brak stanu, zmianę identyfikacji/ceny, niewłaściwy kod i wygasłe dowody, sumę ilości i kwot, limit wyszukiwania, płaską listę mieszanego remontu oraz przełącznik jednego zamówienia.
- Końcowy typecheck `pricing-service`, mobile i API: PASS. Negatywne próby walidatora legacy wykryły usunięcie ID, eksportu i pusty rejestr. Brak uruchomień GitHub Actions; brak zmian i ponownych testów modułu storage.
- [Backend PR78](https://github.com/jakatora/przetargai/pull/78) merged, head `7c86ef92b8ae1dfa6f10364fe1e98265324f7aea`, main `1d0b3e2749f2730d33cb71afd105328d091863f2`.
- Railway `29d538cd-b902-4d80-bc15-f651c8a4faf7` SUCCESS. Wszystkie 148 plików wdrożenia zgodne z przejrzanym wydaniem. Zmieniono tylko bundle modułu remontu, zachowując pozostałe 147 plików i wszystkie 219 obserwacji cen.
- Katalog nadal ma 172 referencje, 165 aktywnych produktów, 213 ofert, 219 źródeł, 49 aktywnych kanałów i 33 kanały z automatyczną dostawą w obsługiwanym zakresie. Pozostaje 7 historycznych referencji bez oferty oraz 170 nierozwiązanych wymagań w audycie 65 starych map pomiarów. Są to wymagania, nie liczba unikalnych brakujących SKU.

Przegląd ścieżki pieniędzy: wszystkie kwoty brutto bazują na rzeczywistych koszykach, liczba i tożsamość opakowań oraz sumy pieniędzy są zachowane, a nieudana wycena nie staje się zerem. Dowód obejmuje rzeczywisty adapter sklepu, produkcyjne HTTP i działający widok aplikacji. Nie zmieniano płatności ani przepływów Stripe. Cel rozwoju aplikacji pozostaje aktywny.
