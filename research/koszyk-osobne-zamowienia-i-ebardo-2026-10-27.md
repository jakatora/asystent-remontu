# 2026-10-27 — osobne zamówienia, eBardo i prawidłowe m² winylu

## Problem użytkownika i wynik

Najtańsze produkty nie gwarantują najniższego kosztu zakupów. W rzeczywistym anonimowym koszyku LiderzyCen panele Oakland (5paczek), podkład Volden (2opakowania) i taśma Arbiton (1rolka) dają482,90zł materiałów. Wspólna wysyłka kosztuje600zł. Osobne zamówienie paneli ma dostawę110zł, a podkład razem z taśmą22zł. Te same produkty i ilości mają więc132zł dostawy, o468zł mniej. Nie dzielimy kwoty transportu matematycznie: każda opłata pochodzi z oddzielnego potwierdzonego koszyka sklepu.

Źródła: natywne karty [Oakland](https://liderzycen.pl/pl/p/Panele-laminowane-Oakland-wodoodporne-AC4-2%2C51-m2/185472), [taśma Arbiton](https://liderzycen.pl/pl/p/Tasma-aluminiowa-do-laczenia-podkladow-Arbiton-Izo-Floor-Tape-25-m/31334) i API sklepu. Dowód pełnego zestawu i podkoszyków: work/catalog-wave55-liderzy-options-proof.json; potwierdzone stawki to Kurier Drzwi600, Kurier P2 110 i Kurier Standard22. Nie zastąpiono taryf reklamową ceną pojedynczej paczki.

Pełny jawnie dobrany zestaw do podłogi10m², z jednym profilem Cezar1m, posiadanymi odpowiednimi mocowaniami, zestawem Wolfcraft i7m taśmy, dla testowego kodu00-001:

| Wybrana folia | Materiały | Dostawy po podziale | Razem | Wcześniej, jedno zamówienie na sklep |
|---|---:|---:|---:|---:|
| Conpar100m² z eBardo | 727,35zł | 195,98zł | 923,33zł | 1391,33zł |
| Ecovil P100m², oddzielny wybór | 672,35zł | 195,98zł | 868,33zł | 1336,33zł |

Produkcja55b potwierdziła te kwoty i dwa wymagane zamówienia w LiderzyCen, z niezmienionymi ilościami. Nie obejmują piły, miary, robocizny ani innych prac remontu. To najtańsze z potwierdzonych badanych wariantów, bez gwarancji dla całego rynku. Kod00-001 jest przykładem QA, nie adresem właściciela. Wyceny mają ważność maksymalnie10min.

## Nowe oferty i niezależne źródła

- Ta sama folia Conpar, EAN5902096430103: [eBardo](https://ebardo.pl/pl/p/Folia-paroizolacyjna-Conpar-0%2C2mm-2mx50m/86), [niezależna karta Parotec](https://parotec.pl/product-pol-18078-Folia-paroizolacyjna-zolta-CONPAR-0-2-mm-T30.html), [producent](https://conkret.com.pl/conkret-products/folia-budowlana-conpar/). API eBardo: produkt/stock86, SKUFPAR-02C, jednostka szt., jedna rolka2×50m=100m², brutto160zł; nie130,08netto. Dodatkowa oferta tego samego produktu, bez zmiany jego tożsamości.
- Ecovil P, EAN5902096431131: [eBardo](https://ebardo.pl/pl/p/Folia-paroizolacyjna-Ecovil-0%2C2mm-2mx50m-100m2/534) i niezależny [katalog Simeplast2024](https://simeplast.pl/wp-content/uploads/2024/03/katalog-produktow-02.2024.pdf), s.74/PDF73, potwierdzają rolkę2×50m. Produkt/stock534, SKU11-01, jednostka szt., brutto105zł; nie85,37netto. Karta sklepu podaje0,20mm±50%, natomiast Conpar ma±30%. Osobny produkt w wyborze folii, bez automatycznej podmiany i bez deklarowania uniwersalnej zgodności z każdą podłogą lub hydroizolacji. Parametr jest widoczny także po wyborze.
- eBardo zwraca GLS25zł dla pojedynczej rolki i dla wspólnego koszyka obu folii265zł. Dwie rolki razem mają290zł z jedną dostawą; dzielenie na dwa zamówienia byłoby droższe i nie jest wybierane. Nie użyto pobrania z dopłatą ani taryfy paletowej. Zdjęcie Ecovil pochodzi z tej samej karty, HEAD200image.

Folnet z Railway nadal kończy połączenie timeoutem. DNS wskazuje IPv4, a kontrolne HTTPS IPv4 również nie odpowiada; brak IPv6. Nie osłabiono TLS, nie podmieniono adresu serwera i nie zgadywano stawki. Porównanie korzysta z dostępnej wyceny eBardo dla tego samego Conparu. Lokalny Folnet119,50+13,99 nadal jest osobnym potwierdzonym wariantem tam, gdzie połączenie działa; nie udajemy jego dostępności na produkcji.

## Obliczenia i zasady zakupów

Winyl click miał ten sam błąd jednostek co wcześniejszy laminat: liczba paczek była opisana jako m². Teraz10m²+dotychczasowy10% zapas daje11m² zapotrzebowania, potem dopiero paczki. Lokalna deklarowana paczka2m² daje6paczek/12m². Wybrany [Marvo2,235m²](https://liderzycen.pl/pl/p/Panele-podlogowe-winylowe-GoodHome-SPC-Marvo-2%2C235-m2/185474) daje5paczek,754,10+110dostawy=864,10zł za same panele. Dwa pokoje po1m² sumują się do2,2m² i jednej paczki150,82+22=172,82zł. Na granicy2,032m²×1,1=2,2352m² potrzebne są2paczki, nie1. Stare JSON-y z rawQuantity6 są odczytywane ponownie z zapisanych pomiarów, bez zapisu do DB. Niedostateczne dawne „Mam/Kupione” nie usuwa poprawionego zapotrzebowania.10% to zachowane założenie zakupowe, nie uniwersalna norma.

Usunięto nieprawdziwe ogólne twierdzenie, że SPC nie wymaga aklimatyzacji. [Instrukcja producenta Arbiton](https://arbiton.com/pl/sposoby-ukladania-paneli) pokazuje zależność od temperatury transportu; UI odsyła do instrukcji wybranego modelu, bez przenoszenia liczb jednego modelu na inne.

## Podział zamówień i wybór użytkownika

Nowy order-partitions porównuje rzeczywiste koszyki dla podzbiorów produktów we wszystkich obsługiwanych sklepach. Cała ilość jednego SKU pozostaje w jednym zamówieniu. Nie omijamy minimum zakupu ani limitu zapasu przez rozdzielenie sztuk. Dla maks.5produktów szukamy wśród wszystkich podziałów; większe zamówienia mają ograniczone próbkowanie i jawne searchLimited. Zachowano globalny limit80 odczytów, cache, kolejkę i deadline20s. Niepotwierdzone, przeterminowane, przyszłe, z niezgodnym kodem lub bez dowodu stawki nie obniżają ceny. Łączna wycena wygasa najpóźniej z pierwszą składową; zachowuje osobne źródła, kwoty, produkty i hash dowodów.

Użytkownik wybiera „Najtaniej, także osobne zamówienia” albo „Jedno zamówienie w każdym sklepie”. Flaga allowSeparateOrders jest jawna w API; brak flagi zachowuje jedno zamówienie dla starszych klientów. Nowy klient potrafi pokazać wymagany podział i zachowuje jawnefalse przy zmianie kodu/odbioru. Kosztorys pokazuje dostawy i produkty osobno dla każdego zamówienia oraz oszczędność. Ogólne podsumowanie zakupów również ostrzega, że cena wymaga osobnych zamówień.

## Walidacja i zakres

613 testów kalkulatora/API PASS0skip,1054 współdzielonego backendu PASS0skip, typecheck mobile/API PASS. Nowe testy obejmują rzeczywisty HTTP z podziałem, zgodność ilości, pojedynczy koszyk gdy tańszy, odrzucenie nieaktualnych/niepotwierdzonych stawek, limit zapasu, ograniczone duże porównanie i starszego klienta/explicitfalse. Legacy66 i negatywne mutacje PASS; pięć nowych źródeł200/0ostrzeżeń. Castorama Marvo zwróciła503, więc nowe komentarze ilości wskazują sprawdzoną kartę LiderzyCen; nie odnowiono dat Castoramy.

Backend PR53 (oferty), PR54 (podział), PR55 (preferencja i zgodność klienta) są dołączone do chatu i scalone. Każde wydanie zaczynało od świeżego snapshotu produkcji. Oferta55 zachowuje181 dawnych obserwacji i146 innych plików;55b/55c zachowują183 obserwacje i147 innych plików. Nie zmieniono auth, migracji001–014 ani danych innych aplikacji. Nie było zamówień, danych klienta ani płatności.

Katalog147referencji/zdjęć,123produkty z ofertą,162aktywne oferty,24braki,183zarejestrowane obserwacje,2disabled,19wygasłych ręcznych potwierdzeń.43sklepy zarejestrowane,40aktywne. Te same65map pomiarów:83/240wierszy wycenione,157niewycenionych,8pełnych scenariuszy MATERIAŁÓW. To nie procent gotowości. Nadal trzeba uzupełnić24oferty, pozostałe zestawy GK/tapet/instalacji/narzędzi, dobór pozostałych akcesoriów winylu i prawdziwe ceny/zapasy lokalnych placówek. Pełny cel pozostaje aktywny.


## Końcowa kontrola produkcji55c

2026-10-27T09:50:33.521Z: Railway0ef1dc9d-6ab2-4c44-881a-fec1dfc456bf SUCCESS, PR55 merge a65fb56dcc7e4039fe32c09ccb4f190405151121. Wszystkie148 plików na serwerze odpowiadają sprawdzonemu wydaniu. Rzeczywisty HTTP:923,33złConpar/868,33złEcovil z podziałem; starszy klient i explicitfalse mają1336,33złEcovil bez ukrytego podziału. Żądanie bez tokena /auth/me nadal401. Dowody:work/catalog-wave55c-production-proof.json, catalog-wave55c-preference-proof.json i catalog-wave55-final-release-proof.json.


UI: własny projekt proj_mvqec9oc87qg6thn4, 18 projektów zachowanych. Przełącznik jednego zamówienia pokazuje1336,33zł i pozostaje wybrany po reload (aria-checked=true). Powrót do osobnych zamówień pokazuje868,33zł, rozpisuje5paczek paneli w pierwszym oraz2podkłady+1taśmę w drugim i468zł oszczędności. Zakładka Zakupy również pokazuje868,33zł i warunek dwóch zamówień. Naprawiono odczyt bool preferencji z istniejącego storage i jej zachowanie przy wyborze kanału sklepu. Nie zmieniono bazy projektów ani migracji. Expo8082 bez restartu. Końcowe zrzuty: outputs/catalog55-lowest-total-20261027.png oraz outputs/catalog55-separate-orders-20261027.png w katalogu pomocniczym Codex. Dodatkowe10 testów podsumowania/wyboru sklepu i końcowy mobiletypecheck PASS po zmianie odczytu preferencji.
