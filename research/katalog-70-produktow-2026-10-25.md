# Katalog 70/103 — sześć produktów LiderzyCen — 2026-10-25

Po odbiorze produkcyjnego HTTPS: **70 produktów z potwierdzonymi ofertami, 33 brakujące, 96 aktywnych ofert, 31 sklepów i 17 integracji automatycznej dostawy**. Zdjęcia są przypisane do wszystkich 103 pozycji. To pokrycie obecnego katalogu referencyjnego; cel uzupełnienia katalogu pozostaje aktywny.

## Nowe produkty i rzeczywiste opakowania

Każdy produkt ma potwierdzony główny EAN, identyfikator produktu, SKU sklepu, cenę brutto i jednostkę zakupu. W tych sześciu ofertach jedna natywna `szt.` oznacza wskazaną fizyczną paczkę albo pojedynczy zawór. Cena nie jest przeliczana z reklamowej ceny za m².

| Produkt | EAN | Zawartość zakupu | Cena brutto |
|---|---|---|---:|
| Classen Dąb Niasa AC5 | 4003992571974 | 1,973 m² | 112,42 zł |
| Oakland AC4 | 5063022887917 | 2,51 m² | 65,69 zł |
| Volden XPS Smart 3 mm | 5063022038289 | 10 m² | 71,06 zł |
| GoodHome Guigliano beige | 3663602870821 | 1 m², 9 płytek | 71,02 zł |
| Ferro Z270E z filtrem, chrom | 5901095614033 | 1 szt., 1/2 × 3/8 cala | 34,54 zł |
| GoodHome SPC Marvo | 5063022676757 | 2,235 m² | 150,82 zł |

Główne karty i źródła zdjęć:

- https://liderzycen.pl/pl/p/Panele-podlogowe-laminowane-wodoodporne-Classen-Dab-Niasa-AC5-1%2C973-m2/31535
- https://liderzycen.pl/pl/p/Panele-laminowane-Oakland-wodoodporne-AC4-2%2C51-m2/185472
- https://liderzycen.pl/pl/p/Podklad-podlogowy-pod-panele-laminowane-Volden-XPS-Smart-3-mm-10-m2/31327
- https://liderzycen.pl/pl/p/Gres-mrozoodporny-szkliwiony-Guigliano-GoodHome-18%2C5-x-59%2C8-cm-beige-1-m2/31407
- https://liderzycen.pl/pl/p/Zawor-katowy-z-filtrem-Ferro-12-x-38/49055
- https://liderzycen.pl/pl/p/Panele-podlogowe-winylowe-GoodHome-SPC-Marvo-2%2C235-m2/185474

Drugie referencje tych EAN pozostają w istniejącym katalogu. Dla Niasy dodatkowo odczytano https://eadamex.pl/panele-podlogowe/11020-panele-podlogowe-laminowane-dab-niasa-expedition-classen-ac5-1973m2-op-4003992571974.html — potwierdza tożsamość i paczkę 1,973 m², lecz wskazuje brak stanu/zamówienie, dlatego nie zaimportowano ceny jako aktywnej oferty. Wcześniejsza karta panele-sklepy zwracała HTTP 500; zastąpiono ją w walidacji referencją Adamex, bez obchodzenia błędu i bez zaimportowania jej ceny.

## Dostawa całego koszyka

Stawki pobrano z oddzielnych anonimowych koszyków sklepu, po dodaniu rzeczywistych ilości. Nie są wpisane w kodzie jako stały cennik. Sprawdzono jedną i dwie paczki każdego produktu oraz wspólny koszyk sześciu produktów. Nie wprowadzano danych klienta, nie składano zamówienia ani nie wykonano płatności. Własną testową pozycję usunięto w przeglądarce i potwierdzono pusty koszyk.

| Zakup | Materiały | Dostawa | Razem |
|---|---:|---:|---:|
| Niasa: jedna paczka 1,973 m² | 112,42 zł | 22,00 zł | **134,42 zł** |
| Niasa: dwie paczki 3,946 m² | 224,84 zł | 44,00 zł | **268,84 zł** |
| Guigliano: jedna paczka | 71,02 zł | 600,00 zł | **671,02 zł** |
| Po jednej paczce/sztuce wszystkich sześciu produktów | 505,55 zł | 600,00 zł | **1 105,55 zł** |

Ciężki gres zmienia dostępny transport całego koszyka. Nie można przenosić 22 zł z paneli na zestaw z płytkami. Niasa 0,9 + 1,073 m² z dwóch pomieszczeń konsoliduje się do jednej paczki; potrzeba 3,947 m² wymaga trzech paczek.

Zakres wyceny LiderzyCen to **`retailer_basket_national`, Polska**. Kod 00-001 był testowym ustawieniem aplikacji; API sklepu nie potwierdza indywidualnej obsługi tego kodu bez pełnego checkoutu. UI pokazuje podstawę taryfy krajowej. Brakująca wycena transportu nadal nie jest traktowana jako zero. Potwierdzanie dostawy zależnej od kodu pozostaje osobną możliwością Sewery i Cezara.

## Zabezpieczenia i walidacja

`confirmShoperPurchaseUnit` wiąże cenę z identyfikatorem produktu, natywną nazwą jednostki, `floating_point=false`, SKU oraz — gdy skonfigurowano — opisem zawartości paczki/wariantu. Ten sam warunek działa przy odświeżeniu ceny i przed dodaniem produktu do anonimowego koszyka. Odczyt gotowego koszyka ponownie sprawdza jednostkę, ilość, ceny wierszy i sumę. Zmiana jednostki na m² albo zakup ułamkowej sztuki zostaje odrzucona. Dotychczasowe kontrole EAN, marki, nazwy i opakowania pozostają aktywne.

- **291 testów logiki i HTTP + 20 testów seedów + 55 regresji współdzielonego backendu = 366 PASS, 0 skip**. Typecheck API i mobile: PASS. Kontrola 66 identyfikatorów prac: PASS. Dziewiętnaście adresów źródłowych: HTTP 200, w tym sześć kart, sześć zdjęć, sześć publicznych API produktu i niezależna referencja Niasy.
- Produkcyjny HTTPS potwierdził kwoty Niasy, konsolidację pomieszczeń, zaokrąglenie trzech paczek, cały koszyk sześciu produktów i respektowanie wyboru konkretnego sklepu. Wszystkie 70 wycenionych produktów mają plan odbioru. Przy żądaniu wszystkich 103 pozycji odpowiedź zachowuje 70 wycenionych i 33 brakujące, bez fałszywego pełnego kosztu.
- Dotychczasowy koszyk trzech prac zachował **790,83 zł = 637,43 zł materiałów + 153,40 zł dostaw**, kod 00-001 i jedną posiadaną pozycję. Health 200, auth/me 401. Sześć nowych źródeł odświeżono 2026-10-25 22:20:38–39 Europe/Warsaw: `active=true`, `error=null`.
- PR https://github.com/jakatora/przetargai/pull/20 scalony i przypięty. Źródło `3eff8610c33e80028b807bf13d4d24e868561a77`, main `5f235142acf8bba131dd118434f88a1132e8a60d`.
- Railway **`63c09228-1340-4fec-b63c-988fbf637f64`: SUCCESS od 2026-10-25 22:20:08 Europe/Warsaw**. Wspólny backend zmienia jedynie moduł Remontu i sześć nowych obserwacji; poprzednie 92 obserwacje zachowano. Nie wykonano nowego wydania Android/iOS.

Dowody w `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/`: `work/catalog-wave9-production-proof.json`, `work/catalog-wave9-delivery-proof.json`, `outputs/asystent-remontu-katalog-70-dowod-20261025.json`, `outputs/liderzy-niasa-jedna-paczka-20261025.png`, `outputs/liderzy-niasa-dwie-paczki-20261025.png`, `outputs/asystent-remontu-koszyk-70-suma-20261025.png`.

## Dalsza praca

Pozostały 33 warianty z obecnego katalogu. Natywne wyszukiwanie LiderzyCen po EAN znalazło oferty pomijane przez wyszukiwarkę ogólną. Trzy dostępne kandydatury wymagają dalszego potwierdzenia: kotwa 10×182, zawias Metro 3D 14 mm oraz lewe drzwi Credis 80. Sklep wpisuje własną nazwę w pole producenta; nie wolno przypisać jej jako zweryfikowanej marki producenta. Przy drzwiach trzeba jawnie rozróżnić stronę otwierania. Ofert z `can_buy=false` nie dodano jako dostępnych.

Poza katalogiem pozostają: dostawy Castorama/OBI, rzeczywiste lokalne ceny i stany sklepów stacjonarnych, limity zapasów przy odbiorze, częściowo posiadane materiały, ręczne pozycje koszyka i zgodność zamienników. Dla dużego remontu algorytm nadal jawnie informuje o sprawdzeniu wybranych kombinacji, bez obietnicy minimum w całym rynku.
