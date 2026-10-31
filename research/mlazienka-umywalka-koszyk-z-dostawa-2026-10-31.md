# mŁazienka: dokładna umywalka i koszyk z dostawą — 2026-10-31

## Problem i zmiana

Przed zmianą produkcyjny `/api/remont/pricing/project` nie znajdował aktywnej oferty umywalki EAN `5901771226987`: koszyk wybranego sklepu i koszyk łączony miały `partial`, `missingProductCount:1`. Dodano mŁazienka z aktualną kartą produktu, prawdziwym anonimowym koszykiem, stanem magazynu i wybraną dostawą. Nie zmieniono ID zapisanego wyboru umywalki ani historycznego Facile 50.

## Tożsamość, cena, zdjęcie

- [Karta mŁazienka](https://www.mlazienka.pl/umywalka-505x40-cm-polokragla-scienna-bialy-polysk-k36031-cersanit-ovida-785642.html): Cersanit Ovida K36031, EAN `5901771226987`, 50,5 × 40 cm, jedna sztuka, 257,00 zł brutto; odczyt `2026-10-31T04:53:03.786Z`. Oba powtórzone JSON-LD, widoczna cena i formularz produktu muszą być zgodne.
- [Producent](https://www.cersanit.com.pl/lazienka/umywalka-wiszaca-ovida-50,3252.html): Ovida K36-031, ten sam EAN co nazwa handlowa Atlantic New 50. Tożsamość udokumentowana również we wcześniejszym `research/umywalka-atlantic-wybor-2026-10-26.md`.
- [Dotychczasowa karta Castoramy](https://www.castorama.pl/umywalka-cersanit-atlantic-new-50-cm/5901771226987_CAPL.prd) pozostaje osobnym źródłem. Jej historyczne 158 zł nie jest aktualną ceną porównania. Różnicy cen dwóch sklepów nie oznaczamy jako podwyżki tej samej oferty.
- [Dokładne zdjęcie K36031](https://static.mlazienka.pl/files/produkty/cache/400x400/producers/crs/zle/k36031_6f13aa54.jpg): zwykły GET HTTP 200, `image/jpeg`, 4253 bajty; Próba HEAD z Node zwróciła 403, natomiast GET i walidator URL potwierdziły 200; sam nieudany HEAD nie przesądza o dostępności zdjęcia. Repo przechowuje URL, bez pliku binarnego.

## Rzeczywista wycena dostawy

[Publiczny skrypt koszyka](https://www.mlazienka.pl/cache/3732e758432979f5637b628610eabf8e.js) potwierdza sekwencję formularzy:

1. GET dokładnej karty; tożsamość, gross, SKU K36031 i formularz `product_id=785642`, `subcategory_id=81`.
2. Anonimowe POST `/koszyk,dodaj.html` i GET `/koszyk.html`.
3. Potwierdzenie wszystkich pozycji, liczby sztuk, ceny jednostkowej, kwoty pozycji i dostępności. Koszyk jednej sztuki podaje 4 sztuki magazynowe.
4. Wyłącznie POST `/koszyk,zapiszV2.html` z pozycjami, `shipment=1` (kurier), `payment=15`, `selected-payment=15` (zwykły przelew) i `section=summary`.
5. Nowy GET koszyka, potwierdzenie zaznaczonego kuriera i płatności, nieaktywnych usług opcjonalnych oraz obu pełnych podsumowań. Formularz `/koszyk,kasa.html` nie jest wysyłany; brak danych klienta, zgód i zamówień.
6. [Aktualne koszty dostawy](https://www.mlazienka.pl/koszty-dostawy) potwierdzają kuriera 0 zł dla średnich produktów, w tym umywalek; zagranica wyceniana indywidualnie. Cytat ma zakres `PL`, `retailer_basket_national`, TTL 10 minut. Nie twierdzimy, że sklep obliczył go dla konkretnego kodu pocztowego.

Natywne HTTP: 1 sztuka 257,00 + 0,00 = 257,00 zł; 2 sztuki 514,00 + 0,00 = 514,00 zł. Przy 5 sztukach koszyk zmienia dostępność na „do 7 dni”; integracja zwraca `insufficient_stock` zamiast zapewniać dostępność z magazynu. Kolejny odczyt źródła odświeża stan, a dane wejściowe użytkownika nie mogą wybierać innego produktu ani endpointu.

## Sprawdzenie całego koszyka

Lokalny HTTP z przygotowanego produkcyjnego bundle, testowy kod `00-001`:

| Materiał | Ilość | Materiały |
|---|---:|---:|
| Ovida 50, mŁazienka | 2 szt. | 514,00 zł |
| Rigips papierowa 50 mm × 75 m, Sewera | 1 rolka | 21,94 zł |
| Blue Dolphin niebieska 30 mm × 50 m, Sewera | 1 rolka | 14,72 zł |
| **Razem** | | **550,66 zł** |

Kurier mŁazienka 0 zł + Sewera 19,90 zł = **570,56 zł**; `compared`, brakujące produkty 0, dwa sklepy. Odrębnie dwie umywalki w wybranym sklepie: 514 zł z dostawą. Pięć umywalek: brak kompletnego potwierdzonego wariantu. To porównanie dostępnych, zweryfikowanych ofert dla tego zestawu i ilości, nie minimum całego rynku ani komplet wyposażenia łazienki.

## Castorama i OBI — nadal do podłączenia

2026-10-31 Castorama zwracała HTTP 503 dla sprawdzanej karty, a OBI puste 404 z CloudFront także na stronie głównej, wyszukiwaniu i pomocy. Nie jest to dowód usunięcia produktów. Narzędzia przeglądarkowe CUA i node_repl nie uruchamiały sesji z błędem `failed to write kernel assets ... os error 3`. Sprawdzenie nazw kluczy w vaulcie nie wykazało integracji partnerskiej tych sklepów. Nie włączono zgadywanych taryf.

[Castorama o dostawie](https://www.castorama.pl/informacje/zamow-z-dostawa) i [OBI o dostawie](https://www.obi.pl/info/uslugi/dostawa) uzależniają koszt od koszyka i warunków dostawy. Nadal potrzebny działający, zweryfikowany dostęp do ich właściwych koszyków.

## Walidacja i wdrożenie

API focused 19/19 (w tym 6 nowych testów mŁazienka), mobile 372/372, pricing 156/156, wspólny backend 1060/1060 bez skipów, API/mobile typecheck, legacy 66 ID: PASS. Testy odrzucają m.in. inny EAN/SKU, konflikt powtórzonego JSON-LD, inną ilość, niepotwierdzone zero, odbiór osobisty, niezgodną płatność, dopłatę, opcjonalną usługę, brak polityki i błędną końcową sumę.

Kod aplikacji: `16f5453`. Przygotowanie ze świeżego snapshotu produkcji: 149 plików (w międzyczasie pojawiła się inna usługa `pytanieDoSwz.js`); zmieniono tylko seed 278→279 obserwacji i bundle remontu, pozostałe 147 plików zachowane. SHA bundle: `0a05364dfef0afe9f72d17c25bbccc841bcc4ac19a3727a69ac48e2d5598a6c8`. Obce zmiany robocze aplikacji nie weszły do wydania.

Walidator źródeł: cztery nowe URL-e mŁazienka (karta, obraz, polityka i skrypt) HTTP 200. Historyczne źródła kontrolne Castoramy zwracają 503, OBI 404, producenta 403; to opisane ograniczenie dostępu, nie zaliczony pełny audyt wszystkich linków. Backend [PR125](https://github.com/jakatora/przetargai/pull/125) scalony jako `01b276d2dedf8c42d1a12f030dc28154261ef43e`; próba podpięcia PR do czatu odrzucona przez limit 100 załączników. Przed wdrożeniem drugi snapshot potwierdził brak zmian we wszystkich 149 plikach produkcji. Railway deployment `135893e9-ef6f-4f7a-aa11-f087f1c21ad0`: SUCCESS. Produkcyjny HTTPS potwierdził te same kwoty co lokalny: dwie umywalki 514 zł z dostawą, cały opisany zestaw 570,56 zł, `compared/missing0`; pięć sztuk: `best:null`, brakujący produkt 1. Snapshot po wdrożeniu: wszystkie 149 plików zgodne z przygotowaniem, 279 obserwacji, SHA bundle bez zmian. Health: 244 aktywne oferty, 164 produkty; mŁazienka w `automaticStores`. Aplikacja mobilna nie została w tej fali opublikowana w sklepach. Cel rozwoju pozostaje aktywny.
