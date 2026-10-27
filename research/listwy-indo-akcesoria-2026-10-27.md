# Arbiton INDO: cztery akcesoria, fotografie i wspólna dostawa

Stan na 2026-10-27. Dodano cztery dokładne produkty i cztery oferty istniejącego sklepu TopBoden. Są dostępne w wyszukiwaniu dodatkowych materiałów wspólnego koszyka. Ta zmiana nie kończy automatycznej receptury montażu listew: nie wylicza jeszcze narożników z rzutu pomieszczenia, stron zakończeń ani mocowań/kleju do danego podłoża.

## Produkty

| Produkt, INDO biały połysk 01 | EAN | Kupowane opakowanie | Brutto |
| --- | --- | --- | ---: |
| Narożniki wewnętrzne | 5905167726037 | 2 takie same sztuki | 8,00 zł |
| Narożniki zewnętrzne | 5905167726198 | 2 takie same sztuki | 8,00 zł |
| Łączniki | 5905167725870 | 2 takie same sztuki | 10,00 zł |
| Zakończenia lewe i prawe | 5905167726358 | 1 lewe + 1 prawe, 1 komplet | 8,00 zł |

EAN, kolor i zgodność z serią potwierdzono w kartach producenta: [wewnętrzne](https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/naroznik-wew-indo-bialy-polysk-1-arbiton), [zewnętrzne](https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/naroznik-zew-indo-bialy-polysk-1-arbiton), [łączniki](https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/lacznik-indo-bialy-polysk-1-arbiton), [zakończenia](https://arbiton.com/pl/listwy-przypodlogowe/akcesoria/zakonczenie-l-p-indo-bialy-polysk-1-arbiton). To akcesoria biały połysk, nie biały mat ani elementy innych serii.

Dokładne oferty TopBoden:

- [Narożniki wewnętrzne](https://topboden.pl/listwy-przypodlogowe/indo-naroznik-wewnetrzny-bialy-polysk-01-opakowanie-foliowe).
- [Narożniki zewnętrzne](https://topboden.pl/listwy-przypodlogowe/indo-naroznik-zewnetrzny-bialy-polysk-01-opakowanie-foliowe).
- [Łączniki](https://topboden.pl/listwy-przypodlogowe/indo-lacznik-bialy-polysk-01-opakowanie-foliowe).
- [Zakończenia L+P](https://topboden.pl/listwy-przypodlogowe/indo-zakonczenie-prawe-lewe-bialy-polysk-01-opakowanie-foliowe).

Każda nowa fotografia pochodzi z aktualnej karty dokładnego EAN i zwróciła HTTP 200 image/webp. Fotografie są adresami CDN, bez plików binarnych w repozytorium.

## Jednostki, ceny i zapas sklepu

API i główna karta wiążą UUID, EAN, markę, opakowanie i tę samą cenę brutto. Akcesoria mają natywną jednostkę opk., podczas gdy istniejąca listwa jest wyceniana za cały odcinek 2,5 m, z jednostką bazową mb. Stan akcesoriów oznacza liczbę opakowań: trzy opakowania narożników zawierają sześć sztuk. Nie mnożymy ponownie ceny ani wymaganego stanu przez dwa. Kontrola metrowych listew i partii po 10 odcinków pozostaje odrębna.

W przypadku zakończeń 1 kpl oznacza jedną parę L+P. Kupujący podaje komplety po osobnym policzeniu stron: 3 lewe i 1 prawe wymagają 3 kompletów. Nie wolno podzielić sumy różnych stron przez dwa. Opis produktu wyjaśnia tę zasadę; automatyczny formularz osobnych stron jest nadal do dodania.

Karty akcesoriów używają tytułu SEO w JSON-LD. Nowa obsługa dotyczy tylko czterech przejrzanych UUID/EAN i wymaga zgodności tego tytułu pomiędzy API, kartą i JSON-LD, marki oraz fotografii właściwego EAN. Nie rozluźniono reguły nazw dla pozostałych produktów. Zmiana jednostki, EAN, wielkości opakowania, waluty, koloru lub tożsamości rekordu ceny jest odrzucana.

Zachowano wszystkie 204 poprzednie obserwacje i daty; dopisano cztery, do 208. Nie odświeżono dat starych ręcznych potwierdzeń bez nowego dowodu.

## Rzeczywiste porównania

Wybrane zakupy kontrolne: 5 narożników wewnętrznych, 3 zewnętrzne, 5 łączników, 3 komplety L+P. Aplikacja kupuje odpowiednio 3, 2, 3 i 3 opakowania. Same akcesoria: 94,00 zł + 29,99 zł dostawy = 123,99 zł.

Po dodaniu zapotrzebowania na 22,5 m istniejącej listwy INDO sklep wymaga 10 odcinków po 2,5 m, czyli 25 m. Listwy kosztują 319,80 zł; cały wybrany zakup 413,80 zł + jedna dostawa 29,99 zł = 443,79 zł. To wycena wskazanych zakupów, bez kleju, mocowań, narzędzi i robocizny, a nie pełny koszt montażu.

Lokalny skompilowany serwis i produkcja przeszły po cztery rzeczywiste porównania HTTP. Potwierdzono połączenie dwóch list zapotrzebowania przed doborem opakowań, samodzielny koszyk akcesoriów, jawny wybór TopBoden oraz brak pełnej sumy przy wyborze WinBud, który nie ma tych ofert. Dziesięć brakujących wierszy tego ostatniego przypadku to powtórzenia pięciu produktów w dwóch listach.

Transport pochodzi z aktualnej [krajowej taryfy TopBoden](https://topboden.pl/dostawa-i-platnosc) i odpowiadającej jej macierzy API dla całego zamówienia. Nie jest taryfą zależną od konkretnego kodu. 00-001 to kod kontrolny. Odczyty sklepu były wyłącznie GET; nie podawano danych klienta i nie składano zamówienia.

## Wdrożenie i odbiór

- 675 testów kalkulatora/rdzenia/API i 1054 testy współdzielonego backendu: PASS, 0 pominiętych. Mobile/API typecheck oraz walidacja 66 historycznych prac i 3 negatywnych mutacji: PASS.
- [PR 65](https://github.com/jakatora/przetargai/pull/65), scalony do b8c4b22d824dba3737736a15d0403ce71df3ebb5. Brak zgłoszonych workflow CI; testy uruchomiono lokalnie.
- Railway 2dd0ceca-198e-48c0-9f74-e9638bb210f9: SUCCESS 2026-10-27T16:12:33.377Z. Wszystkie 148 plików produkcji mają SHA zgodne z przejrzanym wydaniem. Zmieniono tylko bundle remontu i seed; zachowano 146 innych plików.
- W działającym UI wyszukano cztery nowe EAN, dodano akcesoria i 22,5 m listew, potwierdzono 443,79 zł, zdjęcia oraz partię 10 odcinków. Po teście usunięto pięć własnych pozycji i przywrócono trzy wcześniejsze prace oraz poprzednie ustawienia. Nie edytowano danych projektów.

Dowody robocze: catalog-wave64-production-proof.json, catalog-wave64-deployed-files-proof.json, catalog-wave64-current-audit-proof.json, catalog64-confirmed-ax.txt. Zrzuty w outputs zadania: catalog64-indo-koszyk-20261027.png oraz catalog64-indo-zdjecia-20261027.png.

## Pozostały zakres

Katalog ma 165 referencji ze zdjęciami, 141 produktów z aktywnymi ofertami, 187 aktywnych ofert, 208 źródeł i 47 aktywnych sklepów z 50 zarejestrowanych. Pozostają 24 wcześniejsze braki (18 wygasłych potwierdzeń i 6 wymagających oferty). Sprawdzenie dokładnych EAN u LiderzyCen nie znalazło aktualnie kupowalnej alternatywy; dostępnych cen przy can_buy:false nie włączono do rankingu. Odczyt dwóch kart OBI z serwera zwrócił 404, mimo widocznej treści w wyszukiwarce; nie przedstawiono tego jako działającej integracji.

65 dawnych map obmiarów nadal ma 82/244 wycenione wiersze i 162 do uzupełnienia (77 bez zapytania, 79 bez produktu, 6 bez oferty). Nie podmieniono starych modeli ani nie dopisano pomiarów użytkownika. Pozostają pełna receptura listew, pozostałe prace i warianty, szersze wyceny dostawy oraz faktyczne ceny i stany pobliskich placówek. Goal ACTIVE.
