# ABUD: koszyk, kod pocztowy i odbiór — 2026-10-27

Do katalogu nie dodano nowego SKU. Aktualny stan produkcji: **104/110 referencji z ofertą, 6 braków, 131 aktywnych ofert, 38 sklepów/punktów, 133 zapisane obserwacje (2 wyłączone), 110 URL-i zdjęć**. Odbiór ma ofertę dla 99 referencji; pozostałe pięć ofert internetowych jest wyłączone lub wymaga potwierdzenia odbioru. To nie jest komplet wszystkich produktów rynkowych ani dowód lokalnych stanów. Sześć historycznych braków: Facile 50, Toledo 2,22 m², Diall PE 20 m², Petro Grey G2, Nati Bianco Struktura, stare Archi 80 lewe.

## Potwierdzona wycena lokalna i nieudany odbiór produkcyjny

Adapter ABUD używa świeżej izolowanej sesji anonimowej, ponownie odczytuje główne karty dokładnie trzech zweryfikowanych produktów, potwierdza EAN, jednostkę zakupu i wariant onesize. Dla całego koszyka raz ustawia kod w publicznej funkcji sprawdzania kodu, dodaje pełne opakowania i sprawdza odpowiedź koszyka: dokładne produkty/ilości, ceny brutto, zapas, walutę PLN, brak kaucji/subskrypcji/bonusów. Dopiero potem pobiera natywną wycenę wszystkich przesyłek. Dopuszcza wyłącznie rozpoznanego kuriera do domu przy przedpłacie, odrzuca paczkomaty, punkty, odbiór, pobranie i lokalny HDS. Nie używa shippingCost=0 z odpowiedzi koszyka, bo to pole jest pustą stawką domyślną. Jawne zero w ofercie właściwego kuriera jest dozwolone po potwierdzeniu niepustego koszyka. Kwoty nie pochodzą z zaszytego cennika. Ważność wyceny: 10 minut, cache rozdzielony kodem i składem koszyka.

Rzeczywiste odczyty HTTP sklepu i lokalnego gotowego bundle:

| Koszyk | Materiały | Kurier do domu | Razem |
| --- | ---: | ---: | ---: |
| 2 blistry Fischer, 00-001 | 49,00 zł | 13,00 zł | 62,00 zł |
| 2 blistry Fischer, 40-001 | 49,00 zł | 13,00 zł | 62,00 zł |
| 7 blistrów Fischer, 00-001 | 171,50 zł | 0,00 zł | 171,50 zł |
| 2 blistry + 2 taśmy Tycner + kolanko PEX | 63,95 zł | 13,00 zł | 76,95 zł |

Natywna strona ABUD po kodzie 00-001 potwierdziła Pocztex Kurier 24 za 13 zł; widoczne tańsze 9,99 zł dotyczą skrytek, a nie doręczenia do domu. Lokalny wspólny koszyk regresji z dodatkowymi 4 punktami mocowania: 852,83 zł. **Nie jest to potwierdzona kwota produkcyjna.**

Railway wdrożenie 8e636ee9-37bd-4ee1-b69a-2aaafff5a5d3 ma SUCCESS od 2026-10-26T23:11:36.395Z (2026-10-27 czasu Warszawy). Jednak serwer nie nawiązuje TCP do ABUD, adres 5.149.162.35:443; timeout potwierdzono dla www, domeny głównej i klienta HTTPS IPv4. Ten sam serwer odczytał Sewerę HTTP 200. Pierwotny test wymagający produkcyjnych 62 zł **NIE przeszedł** i nie został osłabiony. API prawidłowo zwraca materiały 4900 gr, deliveryGrosze:null, best:null, quote_unavailable. Koszyk rozszerzony o ABUD również pozostaje bez pełnej sumy. Nie przeniesiono lokalnych 13 zł do produkcji jako uniwersalnej taryfy. Dostęp sieciowy ABUD pozostaje do rozwiązania; 21 zarejestrowanych adapterów nie dowodzi 21 udanych wycen.

## Punkty odbioru i prawdziwy interfejs

Dodano trzy oficjalne placówki: Piłsudskiego 25, 05-420 Józefów; Patriotów 208, 04-701 Warszawa; Przewodowa 60, 04-874 Warszawa. UI pokazuje adresy, telefony, godziny, linki do map i źródeł oraz oficjalny spis. Nie zgaduje współrzędnych, odległości ani lokalnej ceny/zapasu. Test przeglądarki wykrył brak ABUD na liście obsługiwanych sieci — uzupełniono ją, po czym faktycznie pojawiły się karty. Miasto Warszawa daje dwie karty; poprawiono licznik z mylącego 3 na **2 z 3**. Łącznie baza zawiera 14 adresów, w tym 7 Sewery.

Do istniejącego wspólnego koszyka dodano wyłącznie własną kontrolną pozycję 4 szt. mocowań. Prawidłowo widoczna była cena dwóch blistrów 49 zł i brak pełnej wyceny transportu. Następnie usunięto tylko ten dodatek i przywrócono Najtańszy zestaw, 3 pierwotne prace, Standard, jedną posiadaną pozycję i 00-001 z dostawą. Rzeczywisty UI i produkcyjny HTTP ponownie potwierdziły **637,43 + 153,40 = 790,83 zł**. Żaden projekt nie został utworzony/usunięty, obmiary i wybory modeli nie były zmieniane. Własny projekt dwóch umywalek zachował pickup, Atlantic i 1013,84 zł; karta ABUD z właściwym zdjęciem jest rozwinięta. Natywny koszyk ABUD po usunięciu własnej pozycji jest pusty, zakładka badawcza zamknięta. Oryginalny tab użytkownika nietknięty; tab 14 aplikacji zachowany, viewport przywrócony do 1280×720.

## Świeżość danych i walidacja

Po północy w Polsce wygasła oferta Northbud z ważnością do 26.10.2026; lokalny katalog poprawnie spadł do 103. Nie przesunięto daty sztucznie. Nowy rzeczywisty odczyt 2026-10-26T23:07:06.477Z potwierdził ten sam EAN 5902194954525 i 194,80 zł, z nową ważnością sklepu do 28.10.2026. Odświeżono dokładnie ten rekord; pozostałe 132 zachowano bez zmiany. Kolektor produkcyjny dodatkowo odczytał Northbud 2026-10-26T23:12:07.332Z, bez błędu. Stan kolektora 2026-10-26T23:19:04.623Z: running:false; health ok, anonimowe /auth/me 401. ABUD zachował wcześniejszą ofertę materiałową i jawny błąd połączenia; nie udawano nowego odczytu.

494 testy core/kalkulator/pricing/API PASS, 0 pominięć; 1053 testy wspólnego backendu PASS, 0 pominięć. Dodatkowo końcowe 14 testów adaptera/punktów i 11 testów wyboru sklepu/punktów PASS (powtórki części tych samych testów, nie sumować do nowego licznika). API i mobile typecheck PASS, 66 chronionych ID oraz negatywne mutacje PASS, diff check PASS. Pierwsze dodatkowe uruchomienie storeChoice bez poprawnego hooka aliasów nie znalazło @/features; prawidłowe uruchomienie z register-mobile przeszło. Nie zmieniano kodu, żeby obejść ten błąd uruchomienia.

Świeża migawka 148 plików, SHA256 782c80b29b7190e217e65d914946dc81942ea6715233d44f27e36c0b108e4bdc. Brak dryfu produkcji 2026-10-26T23:10:31.603Z. Wdrożono wyłącznie bundle remontu i jeden odświeżony rekord obserwacji, bez innych aplikacji, manifestów i migracji. Source e6f6244a73f3cf8be3c773c731d9526a91d1cfb9, [PR40](https://github.com/jakatora/przetargai/pull/40) scalony i przypięty, merge 73001a5f8a214849bf3df23d83da74034579b647. Brak zgłoszonych checks/statuses CI, nie określono ich jako zielone. Opis PR uzupełniono o nieudany odbiór produkcyjny.

Dowody w katalogu czatu C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/: work/catalog-wave40-native-proof.json, local-live-proof.json, production-first-response.json, production-availability-proof.json, cloud-diagnostic.jsonl, cloud-network.jsonl, collector-proof.json, predeploy-baseline-proof.json, northbud-refreshed.json, core-tests.log, shared-tests.log, legacy-mutation-proof.json (każda nazwa po pierwszej z prefiksem catalog-wave40-). outputs/catalog40-abud-pickup-points-20261027.png i .txt; native-cleaned, common-basket-unconfirmed-shipping, common-basket-restored, project-preserved.

## Źródła

- [Dostawa ABUD](https://www.abud.pl/Dostawa-Towaru-cinfo-pol-24.html), [publiczny skrypt natywnego koszyka](https://www.abud.pl/gfx/pol/shop.js.gzip?r=1792053849), [koszyk](https://www.abud.pl/basketedit.php).
- [Fischer 2 szt.](https://www.abud.pl/product-pol-17848-Mocowanie-umywalki-WST-10x140-Fischer-2-sztuki.html), [taśma Tycner](https://www.abud.pl/product-pol-6204-Tasma-teflonowa-12mm-x-10m-x-0-075mm-Tycner.html), [kolanko Tycner](https://www.abud.pl/product-pol-64835-Kolanko-zaciskowe-PEX-16x16mm-Tycner.html).
- [Spis placówek](https://www.abud.pl/stocks.php), [Józefów](https://www.abud.pl/ABUD-Jozefow-Pilsudskiego-25-stock-2-pol.html), [Patriotów](https://www.abud.pl/ABUD-Warszawa-Patriotow-208-stock-1-pol.html), [Przewodowa](https://www.abud.pl/ABUD-Warszawa-Przewodowa-60-stock-4-pol.html).
- [Northbud, dokładny BFO7](https://northbud.pl/ferro-bateria-prysznicowa-ferro-one-bez-prysznica-chrom-bfo7-p70291).

Pełny cel pozostaje aktywny. Pozostają sześć starych modeli, rzeczywisty dostęp serwera do ABUD, dostawa Castorama/OBI, lokalne stany/ceny, dopasowanie i wycena podejścia odpływu oraz zgodność materiałów kuchni/epoksydu. Nie utożsamiać dodania adaptera lub 104 referencji z ukończeniem aplikacji.
