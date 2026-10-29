# Wymiana syfonu — dopasowanie i cały koszyk z dostawą

Stan sprawdzenia: 2026-10-29. Zachowano job sink-trap-replace, input trapCount oraz oba identyfikatory materiałów legacy sink-trap-mat/teflon-trap. Poprzedni wzór faucets ignorował liczbę syfonów. Model basin-trap-whb-v1 kupuje rzeczywiste 1–10 całych sztuk, bez automatycznego zapasu. Nie zmieniono migracji ani mapowań z cudzymi zmianami.

## Dopasowanie i kompletność

Gotowy wariant to biały McAlpine WHB1-32 z membraną, EAN 5036484088390, przyłącze umywalkowe 1¼ cala i odpływ 32 mm. Karta producenta podaje wysokość syfonu 62 mm; sam ten wymiar nie gwarantuje miejsca na cały montaż. Użytkownik potwierdza zgodność gwintu, rury, układu i przestrzeni według rysunku. To syfon bez nowego spustu; nie zastępujemy nim automatycznie modelu zlewozmywakowego, DN40 lub innego przyłącza.

Pełna wycena wymaga jawnego potwierdzenia sprawnego, dopasowanego spustu, rury i kompletu uszczelek, bez dodatkowych zakupów do tej wymiany. Brak danych albo potrzebne inne części zachowuje niewycenione wymaganie. Nie twierdzimy, że każda uszczelka i złączka jest w ofercie producenta. Dawny teflon-trap pozostaje identyfikatorem wymagań przyłącza, ale nie dodajemy automatycznie rolki PTFE. Potwierdzone połączenia bez dodatkowych zakupów dają zero; inne pozostają do doboru. Nie przedstawiamy taśmy jako zamiennika brakującej uszczelki.

Stare wyniki bez modelu, zmieniony EAN, błędne surowe ilości i brakujące wymagania są ponownie oznaczane do sprawdzenia. Dawne Mam/Kupione nie ukryje zwiększonej liczby syfonów, nieznanego przyłącza ani brakujących części. Edytor projektu udostępnia wszystkie te pola i przelicza zapisane zakupy.

Źródła pierwotne:
- [McAlpine: dane produktu i rysunek](https://mcalpine.pl/product/syfon-umywalkowy-niski-bialy-whb1-32/).
- [Oryginalna karta produktu 2025](https://mcalpine.pl/wp-content/uploads/2025/06/WHB1-32-Karta-produktu-2025.pdf).
- [Instato: dokładny model, oferta i zdjęcie](https://sklep.instato.pl/pl/p/SYFON-UMYWALKOWY-BARDZO-NISKI-MALY-MEMBRANOWY-oszczedzajacy-miejsce-WHB1-32/23062689).
- [Arena Łazienek: dokładny model, oferta i zdjęcie](https://arenalazienek.pl/pl/p/Polsyfon-umywalkowy-MCALPINE-niski%2C-bialy-WHB1-32/57988).

Zdjęcie 500×500 z rzeczywistego og:image karty Instato zostało sprawdzone HTTP200 i typem image. Oba sklepy zachowują ten sam EAN i 1 szt.; niższej ceny netto 71,46 zł ani cen historycznych nie podano jako bieżącej ceny brutto. Referencja lokalna została zaktualizowana do 87,90 zł brutto w Instato; poprzednia cena BLU nie stanowi dowodu przeceny w tym samym sklepie.

## Rzeczywiste anonimowe koszyki

| Sklep | Liczba | Materiały brutto | Kurier domowy | Razem |
| --- | ---: | ---: | ---: | ---: |
| Instato | 1 | 87,90 zł | 15,90 zł | 103,80 zł |
| Arena Łazienek | 1 | 106,19 zł | 23,00 zł | 129,19 zł |
| Instato | 3 | 263,70 zł | 15,90 zł | 279,60 zł |
| Arena Łazienek | 3 | 318,57 zł | 23,00 zł | 341,57 zł |
| Instato | 10 | 879,00 zł | 0,00 zł | 879,00 zł |
| Arena Łazienek | 10 | 1061,90 zł | 23,00 zł | 1084,90 zł |

8 natywnych koszyków (po 1, 3, 2 i 10 sztuk w każdym sklepie), kody 00-001 i 42-209. Instato zwróciło Kurier InPost / przelew bankowy 15,90 zł. Arena zwróciła Przesyłka kurierska / Przelew tradycyjny 23,00 zł. Dziesięć sztuk w Instato dostało rzeczywistą darmową dostawę, podczas gdy Arena nadal wymagała 23 zł. Nie przenosimy stałej stawki 15,90 zł na większe zamówienia. Nie użyto tańszego paczkomatu ani opublikowanego „od 16 zł”, kwoty netto, pobrania czy niepotwierdzonej darmowej dostawy. API weryfikuje dokładny EAN, can_buy, jednostkę, ceny brutto i cały koszyk z rzeczywistymi ilościami oraz kraj Polska. Brak zamówień i danych klienta.

Podstawa dostawy: retailer_basket_national, destinationScope=PL, ważność 10 minut. Sklepy potwierdziły krajowy koszyk PL, nie indywidualny adres kodu; poprawny kod użytkownika jest wymagany, ale UI zachowuje krajową podstawę. Nie przypisujemy stawce większej dokładności niż sklep.

Instato ma wskazany rzeczywisty punkt ul. Przemysłowa 60, 43-100 Tychy. [Kontakt](https://sklep.instato.pl/pl/i/Dane-kontaktowe/15), [zasady dostawy i odbioru](https://sklep.instato.pl/pl/static/czas-i-koszty-dostawy.html). Mapa zawsze prowadzi do tego punktu, nie fikcyjnej lokalnej placówki. Odbiór wymaga wcześniejszego uzgodnienia telefonicznego; nie potwierdzamy dostępności lokalnej ani darmowego kompletnego odbioru w rankingu. Arena również pozostaje z odbiorem do potwierdzenia.

W testach wykryto też starsze, nieuzasadnione zero za odbiór syfonu z BLU. [Bieżące zasady BLU](https://www.blu.com.pl/content/13-wysylka-towaru-koszty-i-terminy) obejmują transport do salonu. Oznaczono tę dokładną ofertę jako wymagającą potwierdzenia odbioru; cena internetowa i centralny zapas nie potwierdzają lokalnej dostępności ani darmowego odbioru. Natywna trasa HTTP i produkcyjny SDK odrzucają komplet w trybie odbioru dla całego tego produktu, dopóki nie ma potwierdzenia.

## Wspólny remont i sprawdzenie

Produkcja: 16 scenariuszy rzeczywistego SDK, 9 kompletnych wycen. 1 + 2 syfony w dwóch pomieszczeniach to jedno zamówienie za 279,60 zł zamiast dwóch za 295,50 zł — oszczędność jednej dostawy 15,90 zł. Wariant remontu: 3 syfony + 4 czarne uchwyty GTV NYXA 128 mm + ramki Asfora 7 pojedynczych, 2 podwójne, 1 potrójna = 414,41 zł z dostawami. Pasowanie wszystkich elementów i posiadane potrzebne przyłącza są jawnie potwierdzone; narzędzia i robocizna nie są objęte ceną materiałów. Wybrany sklep jest respektowany: pojedynczy syfon w Arenie kosztuje 129,19 zł, nawet gdy najtańsze jest Instato. Mam usuwa właściwą pozycję; nieznany model, złe przyłącze, dodatkowe części, brak kodu i niepotwierdzony odbiór nie dają pozornego kompletu.

880 testów rdzenia PASS, 1054 współdzielonego backendu PASS, zero błędów i pominięć. Pierwsze uruchomienie współbieżne ujawniło blokadę wspólnego pliku SQLite w starym teście kopii zapasowej; pełne uruchomienie sekwencyjne --test-concurrency=1 przeszło bez zmian kodu tych testów. Mobile i API typecheck PASS. Trzy źródła nowego modelu HTTP200, legacy66 prac zachowane. Testy odtwarzają rzeczywiste odpowiedzi, odrzucają netto jako brutto, różny EAN, niedostępność i zmienioną liczbę sztuk. Potwierdzenia dotyczą native HTTP, produkcyjnego SDK i odbioru interfejsu; sam zielony test nie stanowi dowodu działania.

Katalog po wdrożeniu: 184 referencje i zdjęcia, 177 aktywnych produktów, 228 ofert, 234 obserwacje, 52 aktywnych kanałów. Nowe są dwa sklepy dla tego samego produktu, nie dwa nowe SKU. Nadal 7 starszych dokładnych referencji bez aktywnej oferty. Stare65 map: 81/254 wycenionych, 173 nierozstrzygniętych wymagań; to nie liczba unikalnych brakujących produktów. Nowego wyboru i przyłączy nie przypisujemy starym projektom bez potwierdzenia.

PR88 https://github.com/jakatora/przetargai/pull/88, merge fa6044ce1a5becefe67417300186a1b590849de3. Pierwsze wdrożenie Railway 772e9d15-4343-4dbb-9cf7-5fb02ac02a31 SUCCESS. Poprawka odbioru: PR89 https://github.com/jakatora/przetargai/pull/89, merge a8b391cea488844871a93f9008a1f3262f5d72ce; Railway 49459a13-4ea3-4b17-8ffb-ceb3a4c0bdf9 SUCCESS; po wdrożeniu sprawdzono zgodność wszystkich148 plików, zachowano232 wcześniejsze obserwacje i146 innych plików. Przy pierwszym zapytaniu tuż po drugim wdrożeniu oba nowe sklepy zwróciły chwilowo quote_unavailable; backend zachował nieznaną dostawę i nie wyświetlił fałszywego zera. Ponowne rzeczywiste zapytania przeszły wszystkie16 scenariuszy. W interfejsie powtórzono pobranie po przerwie przy wdrożeniu.

Cel rozwoju aplikacji nadal aktywny.

## Odbiór interfejsu

Własny projekt proj_mvt615za3lgptjj0w utworzono przez kreator: 3 syfony, WHB1-32, pasowanie 1¼ cala/32 mm i komplet istniejących przyłączy potwierdzone. Porównanie pokazało 263,70 zł + 15,90 zł = 279,60 zł, zdjęcie i3 sztuki. Po wybraniu Areny Łazienek: 318,57 zł + 23 zł = 341,57 zł. Kod 00-001, taryfa Polska ujawniona w widoku.

Edytor odrzucił1,5 sztuki, bez zapisu. Po ustawieniu nieznanego kompletu połączeń zniknęła pełna suma, pozostała wyceniona część i komunikat o brakującej pozycji. Przywrócono potwierdzenie połączeń i zmieniono liczbę na1 oraz nazwę „Test kompletu — 1 syfon WHB1-32”: 87,90 zł + 15,90 zł = 103,80 zł. Przeładowanie potwierdziło nazwę, liczbę1, kod00-001 i ten sam wynik ze zdjęciem. Własny odbiór w Instato nie daje kompletnej ceny; karta wskazuje faktyczny adres Tychy, numer sklepu i wcześniejsze uzgodnienie telefoniczne, bez fikcyjnego punktu przy kodzie. Data sprawdzenia każdego adresu jest teraz odrębna, zamiast sztywnej daty26.10 dla całego katalogu.

Dowody AX i obrazy: work/catalog-wave89-three.jpg/-one.jpg, -three-ui/-arena-ui/-one-saved-ui/-one-reloaded-ui/-pickup-point-ui/-pickup-unconfirmed-ui/-invalid-count-ui/-unknown-joints-ui.txt. Odbiór Expo Web, bez testu fizycznego Android/iOS, bez zmiany wymiarów widoku dla zrzutu. Nie zmieniono innych projektów ani globalnego wyboru prac do wspólnego koszyka.

Istniejące ostrzeżenia konsoli Expo o shadow/pointerEvents, ikonie ruler i ustawianiu dark mode media odnotowano jako osobny temat; nie przedstawiamy tego odbioru jako braku wszystkich ostrzeżeń aplikacji. Błędy dostawy i przerwa wdrożeniowa nie zostały zamienione na darmowy pełny koszyk. Po ponownym odczycie prawdziwe API i interfejs potwierdziły wyniki.
