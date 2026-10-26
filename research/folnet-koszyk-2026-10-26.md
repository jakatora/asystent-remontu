# Folnet — pianka Soudal i dostawa całego koszyka

Stan po weryfikacji produkcyjnej 2026-10-26: **75/103 produktów z potwierdzonymi ofertami, 28 pozostałych, 101 aktywnych ofert, 33 sklepy, 18 integracji dostawy**. Wszystkie 103 referencje mają przypisane zdjęcie. Nie oznacza to dostępności każdego produktu ani kompletnej wyceny każdego remontu.

## Produkt i rzeczywisty zakup jednostkowy

[Pierwotna karta Folnet](https://folnet.pl/pl/products/chemia-tasmy-mocowania/chemia-budowlana-soudal/pianki-pistoletowe/pianka-pistoletowa-soudafoam-low-expansion-10-8372.html): zimowa piana Soudal Soudafoam Low Expansion −10, 750 ml, EAN 5411183048522, symbol producenta 112583, natywne ID 8372 / rozmiar `onesize` (`uniw` w API). Cena **39,30 zł brutto za puszkę**, VAT 23%, stan podczas weryfikacji 17 sztuk.

Parser łączy kod kreskowy i SKU z natywnego `product_data`, formularz produktu, widoczną cenę brutto, jednostkę szt., wymiar 750 ml i pojedynczy Product/Offer JSON-LD. Polska/PLN musi być aktywna. Inny kod, pojemność, warunki rabatowe, reguły ilościowe lub brak zapasu unieważniają ofertę. Skrypty strony nie są wykonywane.

Rzeczywisty anonimowy koszyk sklepu potwierdził ilości 1/2/8 i sumy materiałów 39,30 / 78,60 / 314,40 zł. Koszyk został opróżniony, a pusty stan zweryfikowany. Nie utworzono zamówienia, konta ani płatności; nie wysyłano danych klienta.

## Dostawa

Wycena używa tego samego natywnego żądania co okno dostawy sklepu, odczytanego z [publicznego skryptu sklepu](https://folnet.pl/gfx/pol/shop.js.gzip?r=1718706231): POST `getAjax=true` do `/ajax/get-deliveries.php?mode=productAndBasket&products[8372][uniw][quantity]=N`.

Każda wycena ma świeżą anonimową sesję i pusty koszyk. Wszystkie wymagane produkty są przekazywane w jednym żądaniu. Przed odczytem dostawy cena, ilość i zapas są ponownie potwierdzane. Koszt produktów musi być równy kosztowi w żądaniu wyceny.

| Puszki | Materiały brutto | Kurier GLS | Razem |
| --- | --- | --- | --- |
| 1 | 39,30 zł | 13,99 zł | 53,29 zł |
| 2 | 78,60 zł | 13,99 zł | 92,59 zł |
| 8 | 314,40 zł | 0,00 zł | 314,40 zł |

Zero jest dopuszczone tylko dla znanego kuriera z potwierdzonym progiem darmowej dostawy, osiągniętym przez aktualny koszyk. Native API podaje próg 299 zł. Nie zapisano stawek jako zastępczego cennika.

Paczkomat od 9 zł, odbiór, pobranie i błędna odpowiedź „Dostawa elektroniczna 0 zł” nie są kurierem do domu. Samo GET bez trybu i listy produktów zwracało tę ostatnią odpowiedź nawet przy prawdziwym koszyku — test negatywny ją odrzuca. Stara [strona cennika dostaw](https://folnet.pl/pl/delivery.html) podaje inne stawki niż bieżące API; źródłem kwoty jest aktualna odpowiedź koszyka.

Podstawa to **krajowa wycena koszyka w Polsce**, `retailer_basket_national`, a nie zapytanie dla konkretnego adresu. Kod użytkownika jest walidowany przez aplikację; Folnet nie wymaga go w tym natywnym żądaniu. Testy 00-001 i 80-001 potwierdziły tę samą kwotę. UI pokazuje „taryfa Polska” i wyjaśnia potwierdzenie pełnego adresu przy zakupie.

## Odbiór, zdjęcie i użycie w kalkulatorze

[Zasady odbioru Folnet](https://folnet.pl/Odbior-osobisty-ccms-pol-30.html): brak sprzedaży stacjonarnej, wyłącznie odbiór zamówienia online po e-mailu o gotowości. Magazyn: **ul. Stefana Batorego 97, 62-081 Batorowo**, pon.–pt. 7:00–20:00. Biuro firmy w Skórzewie nie jest miejscem wydania. UI pokazuje warunki i link źródłowy; Mapy kierują na magazyn. Bezpłatny odbiór potwierdza natywna metoda `0-1`.

Na komputerze sklep Folnet nie odpowiadał w czasie, chociaż backend Railway otrzymywał HTTP 200. Zdjęcia na urządzeniu wybierają teraz sprawdzony obraz katalogowy według dokładnego ID/EAN, także `remont-<EAN>`. Dla tej puszki używane jest istniejące zdjęcie CDN Castoramy z tym samym EAN. Faktyczne wyświetlenie zdjęcia potwierdzono w aplikacji; nie podmieniano na podobną piankę.

Dotychczasowe kalkulatory okien/parapetów/drzwi liczą puszki, a referencje mają ml. Dodano jawne przeliczenie wyłącznie dwóch znanych puszek 750 ml (Tytan / Soudal), konkretnych prac i jednostek. Zapotrzebowanie jest zachowane, opakowania zaokrągla backend po zsumowaniu prac. Przykład: uszczelnienie 8 mb okien liczy 1,1 puszki = 825 ml i wymaga zakupu 2 puszek. Parapet i drzwi liczą po 1 puszce = 750 ml. Nie przyjęto przelicznika dla innej pojemności ani nieznanej pracy. Nie zmieniono chronionych definicji kalkulatorów.

Wspólny koszyk ma wybór Ekonom / Standard / Premium, wykorzystujący istniejący selektor z rolami radio. Nie dodano „Własne”, ponieważ ręczne ceny nie są ofertami sklepowymi w tym rankingu.

## Wdrożenie i sprawdzenie

Backend [PR24](https://github.com/jakatora/przetargai/pull/24), źródło `1e4d931d01c625537fb15bd1a72bd48a7fbae5d3`, merge `19256a3cc9fad96d286df38a10e50e318e6bfa6b`. Railway `94b407b7-4f30-435d-bcfc-42b76d13ee70` SUCCESS 2026-10-26T00:10:41.204Z (01:10:41 Europe/Warsaw). Świeży snapshot poprzedniego fe217e12: SHA256 `f1d91125ec015ac7343fc3e5202aae584eb25fbb1124e98f0008f2e8d63c3bbc`. Zmienione wyłącznie bundle wyceny i seed z jedną nową obserwacją; 102 wcześniejsze obserwacje zachowane dokładnie, pozostałe pliki współdzielonego serwera identyczne.

- 319 testów logiki/API/mobile oraz 1054 testy współdzielonego backendu: PASS, zero pominięć. Typecheck API i mobile: PASS. Walidacja 66 chronionych ID i jej mutacje negatywne: PASS.
- Rzeczywisty HTTP lokalnego bundla oraz produkcyjny HTTPS: 1/2/8 puszek, dwie prace 375+375 ml → 1 puszka, wybrany Folnet, odbiór i dwa kody pocztowe. Kwoty z tabeli są brutto i w groszach; brak potwierdzenia nigdy nie staje się zerem.
- Całe 103 wymagania przez produkcyjny HTTP: 75 rozpoznanych, 28 brakujących, pełna suma nieznana.
- Pierwotny koszyk trzech prac nadal 790,83 zł = 637,43 zł materiałów + 153,40 zł dostaw. Health 200, auth/me 401.
- UI: `proj_mvoi3ywyx9dt6bvaq`, „Test dostawy — Folnet Soudal 750 ml”, 8 mb okien, dwie inne pozycje oznaczone „Mam” wyłącznie w tym projekcie testowym. Wspólny koszyk Premium pokazuje zdjęcie, 2×750 ml oraz 92,59 zł z GLS; Standard pokazuje 2×Tytan 750 ml za 65,50 zł z dostawą Sewery. Przywrócono standard i oryginalne trzy wybrane prace, jedną wcześniej posiadaną pozycję, 00-001 i 790,83 zł. Nowy test pozostaje poza wyborem.

Dowody: `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/work/catalog-wave14-{production,local-live}-proof.json`, `catalog-wave14-{core,shared}-tests.log`, `catalog-wave14-research/folnet-verified-carts.json`; zrzut `outputs/folnet-koszyk-z-dostawa-20261026.png`.

Nadal do zrobienia: 28 produktów z referencyjnego katalogu, dostawy Castorama/OBI, stany i ceny lokalnych placówek, ręczne pozycje/częściowe zapasy w koszyku oraz dopasowanie innych kalkulatorów. Nie każda ogólna pozycja kalkulatora odpowiada jednej ze 103 referencji. Irbud CD60 nie został przypisany do Norgips: zdjęcie wskazuje MFO i brak dokładnego GTIN. Centrobud wąż WS-20-030 ma inny GTIN; niedostępne/403/404 karty też nie stanowią potwierdzonej oferty. Cel rozwoju pozostaje aktywny. Frontend jest testowany lokalnie w Expo; bez nowego wydania Android/iOS.
