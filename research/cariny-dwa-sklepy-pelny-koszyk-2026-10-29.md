# Cersanit Carina: drugi sprzedawca i koszt całego koszyka

Data weryfikacji: 2026-10-29. Zakres: oryginalne deski Cersanit Carina K98-0068, K98-0069 i K98-0135, dopasowane po kodzie producenta i EAN. Źródła ofert: [standardowa](https://arenalazienek.pl/pl/p/Deska-WC-CERSANIT-CARINA%2C-biala-K98-0068/7201), [wolnoopadająca](https://arenalazienek.pl/pl/p/Deska-WC-CERSANIT-CARINA-wolnoopadajaca%2C-biala-K98-0069/7182), [SLIM](https://arenalazienek.pl/pl/p/Deska-WC-CERSANIT-CARINA-SLIM-wolnoopadajaca%2C-biala-K98-0135/26758). Zdjęcia trzech ofert zwróciły `image/jpeg`.

Arena Łazienek udostępnia natywny koszyk sklepu. Zweryfikowane ceny brutto z tego koszyka: 215,99 zł za K98-0068, 283,72 zł za K98-0069, 288,99 zł za K98-0135. Przesyłka kurierska z płatnością przelewem kosztowała 23,00 zł w siedmiu sprawdzonych wariantach, w tym koszyku trzech różnych desek. Jest to **krajowa stawka sklepu**, a nie stawka wyliczona osobno dla każdego kodu pocztowego; aplikacja powinna zachować tę informację w etykiecie wyceny. Dwie oferty mają oznaczenie magazynu producenta i wysyłki do 7 dni, a K98-0069 oznaczenie magazynu sklepu i wysyłki w 24 godziny. Odbiór osobisty wymaga potwierdzenia.

| Koszyk | Arena Łazienek z dostawą | Najkorzystniejszy wynik w aplikacji z dostawą |
|---|---:|---|
| 1 × standardowa | 238,99 zł | Arena Łazienek 238,99 zł |
| 2 × standardowa | 454,98 zł | Arena Łazienek 454,98 zł |
| 1 × wolnoopadająca | 306,72 zł | TGS 302,72 zł |
| 2 × wolnoopadająca | 590,44 zł | TGS 567,44 zł |
| 1 × SLIM | 311,99 zł | Arena Łazienek 311,99 zł |
| 2 × SLIM | 600,98 zł | TGS 594,38 zł |
| Po jednej z trzech desek | 811,70 zł | TGS 807,71 zł |
| Standardowa deska i syfon McAlpine WHB1-32 | 345,18 zł w Arenie | Arena Łazienek + Instato 342,79 zł |

Porównanie korzysta z sumy produktów i dostaw, z uwzględnieniem progów darmowej wysyłki. Ostatni wiersz potwierdza, że rozdzielenie zamówienia między dwa sklepy może być tańsze nawet po naliczeniu dwóch przesyłek. Aplikacja nie powinna łączyć podobnych desek jako zamienników bez potwierdzenia wymiarów i mocowań.

Dowód techniczny: trzy obserwacje źródłowe z SHA-256, siedem natywnych koszyków Arena Łazienek, dziewięć lokalnych żądań HTTP `/pricing/project` z prawdziwymi wycenami sklepów. Przeszło 890 testów rdzenia aplikacji i 1054 testy przygotowanego wspólnego backendu. Snapshot produkcji przed zmianą zachowuje 148 plików; nowa paczka zmienia tylko dane ofert i usługę cennika.

Wdrożenie: [PR wspólnego backendu #91](https://github.com/jakatora/przetargai/pull/91) scalony, Railway deployment `89318d0d-a482-4b04-9914-92977da3d5dd` ze statusem SUCCESS. Publiczny `/api/remont/health` zwrócił 180 aktywnych produktów, 234 aktywne oferty, 240 obserwacji i 52 aktywne sklepy. Dziesięć wywołań produkcyjnego SDK `estimateProject` przeszło, w tym porównanie dwóch sklepów, zaznaczenie tylko Areny i odmowa pełnej wyceny bez potwierdzonego dopasowania. Wyliczenia były zgodne z tabelą w czasie kontroli; przyszłe ceny mogą się zmienić przy odświeżeniu koszyków.
