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

Końcowo 26 testów źródeł, adapterów i podpisanego HTTP PASS, w tym 6 nowych testów Soudalu i 7 kanału między usługami; 8 istniejących testów ABUD PASS po zbundlowaniu przez tę samą bibliotekę co produkcyjny serwis. Ten sposób unika wcześniejszego konfliktu runnera TSX ESM/CJS z modułami mobile, bez zmiany pakietów projektu. 390 testów mobile PASS i oba typecheck PASS także w czystym checkout. Rzeczywisty lokalny i produkcyjny HTTP potwierdza pięć wariantów z powyższymi sumami. Publiczny interfejs przeszedł odbiór opisany poniżej.

## Źródła

- https://www.abud.pl/product-pol-27095-Soudal-klej-do-wykladzin-podlogowych-26A-5kg.html
- https://www.abud.pl/Dostawa-Towaru-cinfo-pol-24.html
- https://chemiadoparkietu25.pl/product-pol-25914-Soudal-26A-klej-do-wykladzin-PCV-winylu-linoleum-dywanowych-5-kg.html
- https://chemiadoparkietu25.pl/basketedit.php oraz https://chemiadoparkietu25.pl/graphql/v1/
- https://chemiadoparkietu25.pl/pol-delivery.html
- https://www.soudal.pl/sites/default/files/soudal_api/document/F0039177_0001.pdf

Dowody sesji: `work/abud-soudal-native-{1,2}-wave141.json`, `work/chemia-soudal-native-{1,2}-wave141.json`, `work/chemia-shipping-schema-wave141.json`, `work/soudal-http-local-wave141.json`. Nie powielamy cookies ani nagłówków sesji w fixture projektu.

## Odbiór produkcyjny i połączenia między usługami

Pierwszy moduł backendu (`00e9ef6`, PR130) wdrożono, ale rzeczywisty test produkcji wykazał `UND_ERR_CONNECT_TIMEOUT` do obu sklepów. Diagnoza wewnątrz wspólnego backendu potwierdziła poprawny DNS i timeout także dla natywnego HTTPS po IPv4. Ten sam odczyt z istniejącego serwera webowego działał HTTP200 dla obu domen, również zwykłym `fetch`. Sam lokalny test ani `SUCCESS` wdrożenia nie były wystarczającym dowodem działania dostawy.

Przygotowano prywatny kanał wycen i odświeżania cen na tym drugim istniejącym serwerze. Nie powstaje kolejna usługa. Backend wysyła wyłącznie listę produktów/kod albo identyfikator przejrzanej karty. Wykorzystywane są te same ścisłe natywne adaptery; klient nie może podać adresu URL, innego sklepu, żądania GraphQL ani operacji zamówienia. Osobne role `client`/`server` zapobiegają przekazywaniu zapytań z powrotem do siebie.

Obie strony sprawdzają HMAC-SHA256, dokładną treść, czas i losowy nonce. Podmieniona odpowiedź lub ciało, stary podpis i powtórzenie żądania są odrzucane. Transport ma limity 64 KiB oraz kolejkę 3 równoległych operacji z ograniczoną liczbą i czasem oczekiwania. Klucz jest wyłącznie zmienną usług i wpisem w zewnętrznym vaulcie, nigdy częścią eksportu przeglądarki ani adresu URL. Publiczny endpoint bez autoryzacji nie pobiera niczego ze sklepów. Healthcheck webu wymaga prywatnego modułu, gdy włączono jego rolę.

Kanał obsługuje również aktualne obserwacje cen, nie tylko dostawę. Odczyt zachowuje EAN, adres pierwotnej karty, czas i SHA dowodu sklepu. Dzięki temu zmieniona cena nie blokuje użytkownika przy starym ziarnie i może zostać porównana z jego poprzednim odświeżeniem. Nie zmienia się zakres potwierdzenia ani oryginalna ważność wyceny.

Testy rzeczywistego podpisanego HTTP obejmują odrzucenia, replay, podmianę odpowiedzi, dozwolone źródła i zmiany cen. Obie części wdrożono ponownie i odebrano na produkcji; wynik poniżej.

Drugi odbiór pokazał już prawidłowe podpisane odpowiedzi i bieżące ceny, lecz silnik odrzucał wyceny przez `checkedAt` o **2–3 ms w przyszłości** względem zegara backendu. Potwierdzono to diagnostyką istniejącego modułu w osobnym procesie, bez zmieniania plików serwera. Klient prywatnego kanału wyrównuje teraz wyłącznie niewielką różnicę zegarów w uwierzytelnionej odpowiedzi: cofa `checkedAt` do chwili odbioru i skraca `expiresAt` o dokładnie tę samą różnicę. Nie wydłuża ważności, nie zmienia kwot i nie rozluźnia walidacji innych sklepów. Różnica ponad 5 s lub nieprawidłowa ważność nadal powoduje odrzucenie. Siódmy test podpisanego HTTP obejmuje tę regresję oraz zbyt odległy przyszły czas.

## Końcowy odbiór produkcji — 2026-10-31

Publiczna aplikacja: https://asystent-remontu-web-production.up.railway.app . Kod aplikacji: `00e9ef6d6c80c86026c4c210be1bf716cb87b085`, `fc657ed7ab7a034973fce4de06d2ad815446d131`, `9dc4de5391d08a975fd3179acac15b77fa871d01`. Ostatnia zmiana dotyczy wyłącznie backendu; frontend wskazuje źródło `fc657ed7ab7a034973fce4de06d2ad815446d131`.

- Wspólny backend: PR130 https://github.com/jakatora/przetargai/pull/130, PR131 https://github.com/jakatora/przetargai/pull/131 i PR132 https://github.com/jakatora/przetargai/pull/132 połączone. Końcowy merge `7b33199236912cc4259cd56308077da1917c07a3`.
- Railway API `f28960a5-b7a8-4a98-a6d1-f7155f322f22` i web `6d2da1de-5612-4ce9-842e-3c1f50c92822`: SUCCESS. Produkcyjne 150/150 plików zgodne z przygotowanym wydaniem; 287 obserwacji. Przy ostatniej poprawce zmieniono tylko moduł Remontu, pozostałe 149 plików zachowano bajt w bajt, w tym równoległe zmiany SWZ i migrację `016_swz_tresc_strony.sql`. SHA256 modułu: `3033bd0f2ee6e5f7a57a105dd86a47428c2d3b67d93610786b77f84ffa4a68d0`.
- Publiczny HTTP: cały koszyk **993,00 zł**, Chemia 1/2 wiadra **106,50/200,00 zł**, ABUD 1/2 wiadra **118,20/210,40 zł**, z dostawą dla `30-001`. Jawny brak dostawy Bricomana zachowany. Odświeżenie potwierdziło 4 oferty (Bricoman, Chemia, ABUD, eWinyl), bez błędów i z tą samą sumą.
- Regresja istniejącego ABUD: mocowanie Fischer WST, EAN8590369454948, dwie fizyczne sztuki to jeden blister; aktualna cena **24,50 zł + 13,00 zł dostawy = 37,50 zł**. Rzeczywisty HTTP z odświeżeniem cen: `compared`, zakres kodu `30-001`, zero nieudanych ofert.
- Regresja rolki z Osakrylem nadal **868,35 zł**, dwóch szerokości **1222,00 zł**; niepełne dane pozostają niepełną wyceną. Soudal za 993 zł jest innym świadomie dobranym klejem i zużyciem, więc różnica nie jest podwyżką ceny tego samego produktu.
- Playwright + Edge na publicznej stronie: dwa projekty utworzone przez interfejs, jawny wybór Soudalu 600 g/m², suma 993 zł i alternatywa 1003,40 zł z różnicą 10,40 zł. Zdjęcia Soudal 1200 px i Orion 600 px załadowane. Zero błędów strony lub nieudanych żądań, bez przepełnienia przy 1250 i 390 px; po przeładowaniu zachowane dwa projekty i kod. Profile testowe są odrębne od danych użytkownika.
- 63/63 publicznych assetów zgodne z SHA; health `quoteRelayReady: true`, `missingAssetCount: 0`; 8 tras HTTP200. Moduł prywatny, pliki serwera i dotfiles HTTP404; prywatny POST bez podpisu HTTP401. Skan 76 długich wartości vaulta: zero wycieków. Sekret `REMONT_QUOTE_RELAY_SECRET` wyłącznie w vaulcie i zmiennych dwóch usług.
- Pełny wspólny backend **1063/1063 PASS**, bez skipów; 4 testy hosta, 66 zgodności dawnych ID i wymienione 26 + 8 + 390 PASS. Pierwszy równoległy przebieg backendu trafił na blokadę inicjalizacji SQLite WAL. Końcowy zwykły `npm test` przeszedł po jednorazowym otwarciu i zamknięciu wyłącznie izolowanej testowej bazy, z potwierdzeniem ścieżki wewnątrz katalogu testowego wydania. Nie zmieniano kodu innego projektu. Wcześniejsze problemy globalnego runnera API TSX pozostają opisanym ograniczeniem; nie deklarujemy PASS tego runnera.

Dowody sesji: `work/soudal-http-production-wave141.json`, `work/soudal-refresh-production-wave141.json`, `work/legacy-abud-production-wave141.json`, `work/web-soudal-production-qa-wave141.json`, `work/web-production-http-wave141.json`, `work/private-relay-production-wave141.json`, `work/shared-tests-wave141-r3.log` oraz zrzuty `work/web-soudal-production-*-wave141.png`.

Katalog: **204 referencje, 204 wpisy zdjęć, 287 źródeł/obserwacji, 252 aktywne oferty dla 171 produktów; 33 referencje bez aktywnej oferty**. Cel dalszego rozwoju pozostaje aktywny. Następne zadania: brakujące dokładne oferty, sprawdzenie dostępu Castorama/OBI z istniejącej usługi webowej (nowy dowód różnic sieciowych), oraz eksport i przenoszenie zapisów projektów. Dostawy Castorama/OBI nadal nie są podłączone. Nie dodano jeszcze backupu/migracji localhost → publiczny origin ani wydania w sklepach mobilnych.
