# Arbiton 6 m² i rzeczywista dostawa DekoratorMarket — 2026-10-31

## Potrzeba użytkownika

Przed zmianą produkcyjny koszyk z Arbiton Secura Thermo Aquastop Smart EAN `5905167826942` miał `partial`, brakujący produkt 1. Kronodom deklaruje obecnie zerowy stan (`clientSaleUnit.availQnt:0`, `productAvailable:false`), a Rodimax nie ma potwierdzonego checkoutu. Audyt: 198 referencji, 199 wpisów zdjęć, 279 źródeł/obserwacji; 34 referencje bez aktywnej oferty. To stan przed zmianą, nie deklaracja, że wszystkie pozostałe sklepy mają potwierdzoną dostawę.

Dodano sklep DekoratorMarket, dokładną paczkę tego samego produktu i natywne wyliczanie całego zamówienia. Zachowano ID materiału i wcześniejsze źródła. Nie zamieniono podkładu na inną grubość lub serię.

## Źródła produktu, ceny i zdjęcia

- [Dokładna karta sklepu](https://dekoratormarket.pl/arbiton-secura-thermo-aquastop-smart-podklad-pod-panele-6m2-p-1367.html): produkt 1367, Arbiton, EAN `5905167826942`, jedna paczka 6 m², cena 41,50 zł brutto za sztukę/paczkę. Odczyt `2026-10-31T05:08:25.565Z`; SHA HTML `99ba6b780841c498eeb48d46db97f3ffdc8b35f47c256f2b439eb26e035104e3`.
- [Karta producenta](https://arbiton.com/pl/podklady-pod-panele/podklady-pod-panele-laminowane/arbiton-secura-thermo-aquastop-smart-podklady-pod-panele-laminowane): potwierdza serię Thermo Aquastop Smart i opakowanie 6 m². Porównano również [dokładną kartę Kronodom](https://kronodom.pl/podklad-pod-panele-arbiton-secura-thermo-aquastop-smart-16mm-1opk.6m2-czerwona-harmonijka).
- [Zdjęcie z karty sklepu](https://dekoratormarket.pl/images/securathermominia.png): GET HTTP 200, `image/png`, 167772 bajty. API zwraca ten URL. W katalogu mobilnym zachowano wcześniejsze dokładne zdjęcie producenta i uaktualniono źródło identyfikacji. Bez plików binarnych w repo.

Parser porównuje jawny EAN, produkt 1367, markę, nazwę, pokrycie, cenę brutto, jednostkę sprzedaży `szt.`, metadane, dostępność i reguły ilości. Ikona magazynu z CSS `--ilosc:5.0` nie jest liczbą paczek. Cena 6,92 zł/m² jest zaokrągleniem prezentacji; w referencji zapisano iloraz `41.50 / 6`, a pełną paczkę i należność liczymy z 4150 groszy.

## Automatyczna dostawa

[Zasady wysyłki](https://dekoratormarket.pl/zasady-wysylki-pm-16.html) wskazują zależność od liczby i gabarytu towarów. Cena „od 25 zł” z karty nie zastępuje wyceny koszyka.

Integracja czyta wyłącznie przejrzane operacje [publicznego skryptu sklepu](https://dekoratormarket.pl/javascript/skrypty.php) i [skryptu koszyka](https://dekoratormarket.pl/javascript/koszyk.php): sprawdzenie ilości, dodanie produktu 1367, wybór kraju PL, kuriera „PODKŁADY I LISTWY” ID 1 i przedpłaty przelewem ID 1. Tokeny operacji pochodzą ze skryptów tej samej anonimowej sesji. Nie ma dowolnego endpointu ani pól klienta, zgód, płatności lub składania zamówienia.

Po operacjach ponownie odczytywany jest koszyk. Muszą zgadzać się wszystkie pozycje, paczki, kwoty brutto, kraj, wybrane metody oraz oba podsumowania AJAX i końcowe podsumowanie HTML. Sklep powtarza ID `CenaWysylki1` dla kuriera i przelewu: odczyt ograniczono do właściwych kontenerów. Pusta opłata za przelew nie może oznaczać zerowego kosztu kuriera.

Weryfikacja natywnego HTTP i lokalnego endpointu z przygotowanego bundle:

| Paczki | Powierzchnia | Materiały | Kurier | Całość |
|---:|---:|---:|---:|---:|
| 2 | 12 m² | 83,00 zł | 25,00 zł | 108,00 zł |
| 43 | 258 m² | 1784,50 zł | 25,00 zł | 1809,50 zł |
| 44 | 264 m² | 1826,00 zł | 0,00 zł | 1826,00 zł |

Próg darmowej dostawy powyżej 1790 zł potwierdzono w koszyku 2026-10-31. Sam pusty koszt kuriera nie jest dowodem darmowej wysyłki. Cytaty mają zakres krajowy `PL`, `retailer_basket_national`, TTL 10 minut. Nie wysyłamy kodu pocztowego do tego sklepu i nie opisujemy taryfy krajowej jako wyceny dla konkretnego kodu. Dostawę Sewery w zestawie poniżej sprawdzono dla testowego `00-001`.

## Cały zestaw i poprawny status porównania

Lokalny HTTP z rzeczywistymi koszykami: 2 umywalki Ovida 50 (514 zł), papierowa Rigips 75 m (21,94 zł), Blue Dolphin 30 mm × 50 m (14,72 zł), 2 paczki Arbiton (83 zł). Materiały 633,66 zł; dostawy DekoratorMarket 25 zł + mŁazienka 0 zł + Sewera 19,90 zł = **678,56 zł**, 3 sklepy, 4 produkty, `compared/missing0`.

Test wykazał też błąd statusu: pełny, potwierdzony zestaw był oznaczany `needs_delivery_costs` z powodu odrzuconego, niedostępnego zamówienia Kronodom. Poprawiono status i listę oczekiwanych dostaw tak, aby nie oczekiwać wyceny dla niemożliwego zamówienia. Powód odrzucenia nadal pozostaje w `unavailableStores`; mobilne ograniczenie zakresu porównania nadal jest widoczne. Nie usunięto ostrzeżeń o niepodłączonych integracjach ani rzeczywiście nieznanej wycenie innego zamówienia tego samego sklepu.

Nie jest to kompletny remont ani minimum całego rynku. To najtańszy potwierdzony wariant w zakresie porównywanych ofert dla opisanej listy i ilości.

## Sprawdzenie i wydanie

API focused 17/17 (6 nowych), pricing 158/158 (2 nowe regresje statusu), mobile 372/372, API/mobile typecheck i legacy 66 ID: PASS. Odrzucane są m.in. zły EAN, paczka, jednostka, waluta, cena, stan, zmieniona ilość, odbiór osobisty, obcy kraj, niezaznaczony kurier, dopłata do przelewu i niezgodne podsumowania.

Kod aplikacji `5d8c9d2`, `8a75ee7` i `eb3ca59`; backend [PR126](https://github.com/jakatora/przetargai/pull/126). Próba przypięcia PR do czatu odrzucona limitem 100 załączników. Wydanie ze świeżego snapshotu produkcji 149 plików; zmiana tylko seed 279→280 i bundle remontu, pozostałe 147 plików zachowane. Obce WIP aplikacji nie weszły do wydania. Pełne testy wspólnego backendu końcowego bundle: 1060/1060 PASS bez skipów. PR126 MERGED `e8be82433ffb3d058c16d5fcf7e883ad38020207`. Preflight tuż przed deploy potwierdził zgodność wszystkich 149 plików z bazą. SHA końcowego bundle: `cd6eac129dad4af8729bde2f1055b64c32a6000761aa7f9e4dcc503c4794dd53`. Railway `54d9a5a1-c55c-42e6-8d1f-257e40fb8b7e`: SUCCESS. Produkcyjny HTTPS potwierdził mały koszyk 108 zł, cały opisany zestaw 678,56 zł (`compared`, brakujących produktów 0, brak oczekiwanych dostaw) i oba progi: 43 paczki 1809,50 zł z kurierem25 zł, 44 paczki 1826 zł z kurierem0 zł. Snapshot po wdrożeniu: wszystkie149 plików zgodne z przygotowaniem,280 obserwacji, identyczny SHA bundle. Audyt po deploy:245 aktywnych ofert/165 produktów,33 referencje bez aktywnej oferty (przed zmianą34). Walidacja8 URL-i: HTTP200. Mobile nieopublikowane w sklepach w tej fali. Cel pozostaje aktywny.
