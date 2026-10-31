# Soudal 26A: dwa rzeczywiste koszyki i dostawa — 2026-10-31

Dodano ofertę ABUD dokładnie tego samego wiadra Soudal 26A 5 kg, EAN **5411183028395**, oraz automatyczną wycenę dostawy ChemiaDoParkietu25. Obie oferty można porównać w całym remoncie bez ręcznych stawek. Nie wprowadzono zamiennika Osakryl ani zamiany 5 kg na 1 kg. Liczba referencji pozostaje 204; liczba źródeł/obserwacji rośnie 286 → 287. Zdjęcie Soudal pochodzi teraz z aktualnej karty sklepu, z potwierdzonym EAN.

## Rzeczywiste koszyki

Anonimowe koszyki sklepów 2026-10-31, potwierdzone dla 00-001 i przez HTTP kalkulatora dla 30-001:

| Sklep | Wiadra | Materiały | Kurier | Razem |
|---|---:|---:|---:|---:|
| ChemiaDoParkietu25 | 1 × 5 kg | 93,50 zł | 13,00 zł, InPost Kurier | **106,50 zł** |
| ABUD | 1 × 5 kg | 105,20 zł | 13,00 zł, Pocztex Kurier 24 | **118,20 zł** |
| ChemiaDoParkietu25 | 2 × 5 kg | 187,00 zł | 13,00 zł, InPost Kurier | **200,00 zł** |
| ABUD | 2 × 5 kg | 210,40 zł | 0,00 zł, Pocztex Kurier 24 | **210,40 zł** |

Darmowa dostawa ABUD nie jest kodowaną taryfą dla dowolnego zamówienia. Każda cena pochodzi z całego bieżącego koszyka. Taniej jest kupić dwa wymagane wiadra w ChemiaDoParkietu25 pomimo płatnego kuriera. Silnik nie dokupuje zbędnych wiader dla progu darmowej przesyłki.

Wspólny zestaw dwóch pokoi 3 × 1,8 m i 2,2 × 1,8 m: Orion szerokość 2 m, odcinek 5,4 m (docinki 3,1 + 2,3 m) za 594 zł; Soudal dobrany na 600 g/m² + 5% zapasu daje 5,8968 kg, więc dwa wiadra za 187 zł. Materiały **781 zł**, dostawy eWinyl 199 zł + ChemiaDoParkietu25 13 zł, suma **993 zł**. Wariant z ABUD: **1003,40 zł**. Wymagane przygotowanie podłoża i zakończeń w przykładzie jest już zapewnione; narzędzia/robocizna są poza tą sumą.

Brak dostawy Bricomana pozostaje jawny (`needs_delivery_costs`, `missingDeliveryStores: Bricoman`), mimo znalezienia kompletnego wycenionego koszyka. Nie zmieniono tej ochrony na deklarację minimum całego rynku. Wybór konkretnego ABUD potwierdza oba jego koszyki (`compared`).

## Weryfikacja i ochrona wyceny

- Native form i niezależny kod producenta potwierdzają produkt, EAN, opakowanie, cenę brutto, jednostkę sztuki wiadra oraz ilości co 1. Obecna karta ChemiaDoParkietu25 używa standardowych kontrolek HTML z `form="projector_form"`. Parser sprawdza unikalne ID i rzeczywistego właściciela formularza; obcy formularz lub duplikat ID są odrzucane. To przywraca także prawdziwe odświeżanie tej oferty.
- ChemiaDoParkietu25: wyłącznie pinowany produkt 25914 / `uniw`, anonimowe `basketchange.php`, odczyt `shippingCountries` oraz `shipping` z `forcedRegion: 1143020003` i kodem użytkownika. Publiczny schemat sklepu potwierdza te pola; odpowiedź potwierdza wybrany kraj Polska. Znane kurierowe prepaid InPost/DPD są odróżnione od tańszego paczkomatu, pobrania i odbioru. Wskazówka `shippingCost: 9.95` z koszyka nie jest traktowana jako kurier za 9,95 zł.
- Wspólny validator IdoSell sprawdza wszystkie wiersze, ceny jednostkowe i sumy w groszach, liczbę wiader, dostępny stan, brak kaucji, dodatków i subskrypcji. Refaktor zachowuje wcześniejsze kontrole ABUD. Rzeczywisty koszyk Chemia wskazał stan 6 wiader; większa niepotwierdzona ilość nie otrzymuje kompletnej wyceny.
- Wyceny mają TTL 10 minut i obejmują rzeczywisty koszyk dla wskazanego kodu. Nie złożono zamówienia, nie przesłano danych klienta ani akceptacji. Brak płatności lub płatnego AI.
- Zdjęcie, notatka doboru i data ceny referencyjnej Soudal zostały zaktualizowane. Zużycie 400–600 g/m² jest zgodne z kartą Soudal; nie zastępuje zakresu innego kleju. Zmiana sklepu lub różnica dostawy nie jest zmianą historycznej ceny produktu.

19 testów źródeł/adapterów PASS, w tym 6 nowych; 8 istniejących testów ABUD PASS po zbundlowaniu przez tę samą bibliotekę co produkcyjny serwis. Ten sposób unika wcześniejszego konfliktu runnera TSX ESM/CJS z modułami mobile, bez zmiany pakietów projektu. 390 testów mobile PASS i oba typecheck PASS. Rzeczywisty lokalny HTTP potwierdza pięć wariantów z powyższymi sumami. Wdrożenie wymaga ponadto odbioru wspólnego backendu i publicznego interfejsu.

## Źródła

- https://www.abud.pl/product-pol-27095-Soudal-klej-do-wykladzin-podlogowych-26A-5kg.html
- https://www.abud.pl/Dostawa-Towaru-cinfo-pol-24.html
- https://chemiadoparkietu25.pl/product-pol-25914-Soudal-26A-klej-do-wykladzin-PCV-winylu-linoleum-dywanowych-5-kg.html
- https://chemiadoparkietu25.pl/basketedit.php oraz https://chemiadoparkietu25.pl/graphql/v1/
- https://chemiadoparkietu25.pl/pol-delivery.html
- https://www.soudal.pl/sites/default/files/soudal_api/document/F0039177_0001.pdf

Dowody sesji: `work/abud-soudal-native-{1,2}-wave141.json`, `work/chemia-soudal-native-{1,2}-wave141.json`, `work/chemia-shipping-schema-wave141.json`, `work/soudal-http-local-wave141.json`. Nie powielamy cookies ani nagłówków sesji w fixture projektu.
