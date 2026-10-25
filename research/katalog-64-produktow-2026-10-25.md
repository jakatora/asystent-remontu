# Katalog 64/103 — Paradyż U117 i Modna Łazienka — 2026-10-25

Po sprawdzeniu produkcyjnego HTTPS: **64 produkty z potwierdzonymi ofertami, 39 brakujących, 90 aktywnych ofert, 31 sklepów, 17 integracji automatycznej dostawy**. Zdjęcia są przypisane do wszystkich 103 pozycji. Lista nadal obejmuje obecny katalog referencyjny, a nie cały rynek. Cel uzupełnienia wszystkich produktów pozostaje aktywny.

## Nowy produkt i jednostka zakupu

Paradyż U117 Grey, gres szkliwiony rektyfikowany mat 59,8×59,8 cm, EAN **5904584158261**, Modna Łazienka, produkt **34158**.

- Karta: https://modnalazienka.pl/u117-grey-gres-szkl-rekt-mat-598x598-34158
- Druga niezależna karta tego EAN: https://plytki24.pl/ennis/36967-ennis-u117-grey-gres-szklrektmat598x598-gati-5904584158261.html — HTTP 200; nie zaimportowano niesprawdzonej oferty tego sklepu.
- Cena reklamowana na głównej karcie: **75,03 zł/m²**. Fizyczne opakowanie: **1,43 m², 4 płytki**. Wyraźnie podana i potwierdzona w koszyku cena paczki: **107,29 zł brutto**. Dwie paczki: **214,58 zł za 2,86 m²**. Sklep nalicza dwukrotność zaokrąglonej ceny paczki, co zostało sprawdzone bezpośrednio; nie zaokrąglamy ponownie iloczynu ceny m² i całego metrażu.
- Identyfikator referencyjny zachowany: `mat-gres-rekt-paradyz-u117-grey-60x60`. W `materials.ts` poprawiono wcześniejsze zastępcze opakowanie 1 m² na rzeczywistą paczkę 1,43 m². Cena za paczkę i za m² są rozdzielone. Ta zmiana sklepu referencyjnego nie jest historią obniżki tej samej oferty.
- Zdjęcie pochodzi z głównej karty produktu; źródło, miniatura i JSON-LD mają zgodny plik tego wariantu. HEAD zdjęcia HTTP 200, image/jpeg.

## Odczyt i dostawa

`modna-product.ts` porównuje główny EAN, nagłówek, kanoniczny URL, MPN produktu, markę, fizyczny rozmiar paczki, minimum, liczbę płytek, formularz ilości, stan paczek i m², cenę paczki widoczną/ukrytą/JSON-LD, walutę oraz zdjęcie. Dopuszcza wyłącznie sprawdzony szablon fizycznej paczki czterech płytek. Nie wykonuje kodu JS sklepu: z `product_json` odczytuje jednoznaczne pola liczbowe.

`modna-delivery.ts` tworzy oddzielny anonimowy koszyk. Jedyna mutacja to frontendowy `POST /cart_edit` z czterema ograniczonymi polami: `update_cart`, `product_id`, `cart_quantity_real_unit_<id>`, `product_single_set_<id>`. Token CSRF pochodzi z tej samej anonimowej karty, razem z własnymi cookies, Origin i Referer. Nie jest tokenem użytkownika i nie trafia do wyniku ani dowodu.

Odczytywane są pełny koszyk oraz formularz dostępnych metod przez **GET /order/**. Formularz zamówienia nie jest wysyłany; nie wprowadzono danych klienta, nie zaakceptowano polityk, nie złożono zamówienia i nie wykonano płatności. Porównywane są wszystkie identyfikatory, ilości paczek/m², jednostki, stany, cena jednostkowa, wartość wierszy, suma i zgodność jednej serii przy kilku paczkach. Kurier i dostępny przelew bankowy bez dopłaty muszą być zgodne z koszykiem i krajem Polska. Dodatkowa opłata Przelewy24 1,29% i pobranie +89 zł nie są mieszane z ceną dla przelewu.

Transport jest odczytywany każdorazowo z koszyka, bez wpisania stałej stawki w kodzie. W dowodzie wynosił **229 zł za jedną paletę**:

| Potrzeba materiału | Zakup | Materiały | Dostawa | Razem |
|---|---|---:|---:|---:|
| 0,70 + 0,73 m² z dwóch pomieszczeń | 1 paczka | 107,29 zł | 229,00 zł | **336,29 zł** |
| 2,86 m² | 2 paczki | 214,58 zł | 229,00 zł | **443,58 zł** |
| 2,87 m², własny odbiór | 3 paczki | 321,87 zł | bez transportu | **321,87 zł** |

Zakres: `retailer_basket_national`, Polska. Nie jest to indywidualna wycena dla kodu ani potwierdzenie dojazdu ciężarówki do pełnego adresu. Potwierdzanie rzeczywistej dostawy dla kodu nadal dotyczy Sewery i Cezara. Źródła transportu: https://modnalazienka.pl/page/transport oraz https://modnalazienka.pl/page/terms. Według sklepu transport jest ciężarowy i wymaga samodzielnego wniesienia.

## Walidacja i wdrożenie

- **287** testów cen/API/klienta, **20** testów seedów oraz **55** regresji współdzielonego backendu: **362 PASS, 0 skip**. Typecheck API i mobile: PASS. Kontrola 66 identyfikatorów prac: PASS. Osiem nowych adresów źródłowych: HTTP 200.
- Mutacje sprawdzają błędny EAN, opakowanie, liczbę płytek, minimum, markę/tożsamość, cenę, walutę, dostępność, ilość, zapas, sumę koszyka, kuriera, kraj i dopłatę metody płatności. Transport odrzuca niepoprawne ilości, inny sklep i nieprawidłowy CSRF przed żądaniem. Fixture zawiera 27,5 kB rzeczywistych fragmentów, bez danych klienta i analityki, z tokenem zastąpionym.
- Produkcyjny HTTPS potwierdził powyższe kwoty i konsolidację. Wszystkie 64 wycenione produkty razem mają plan odbioru. Wszystkie 103 pozycje pozostają w odpowiedzi: 64 wycenione, 39 brakujących, brak fałszywego pełnego kosztu.
- Stary koszyk trzech prac nadal **790,83 zł = 637,43 + 153,40**. Wybór konkretnego sklepu pozostaje respektowany. Health 200, auth/me 401.
- PR https://github.com/jakatora/przetargai/pull/19 merged i attached. Źródło `e3cdc317abeb3e4a5859247e9578b6416ff48b93`, main `2bea20ffaf3307289be2b0f55562f3fe9d9c651b`.
- Railway `096e99a1-b52c-4f85-8613-bf7557d011f0`: **SUCCESS** od 2026-10-25 21:45:19 Europe/Warsaw. Świeży odczyt nowej oferty 21:45:49, active=true, error=null. Wdrożenie zachowuje aktualny wspólny backend `8b0ce1e7` i zmienia tylko moduł Remontu oraz jedną nową obserwację.

Dowody w katalogu zadania `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/`: `work/catalog-wave8-production-proof.json`, `outputs/asystent-remontu-katalog-64-dowod-20261025.json`, `outputs/modna-paradyz-jedna-paczka-20261025.png`, `outputs/modna-paradyz-dwie-paczki-20261025.png`, `outputs/asystent-remontu-koszyk-64-suma-20261025.png`. Browser potwierdził produkt i ceny jednej/dwóch paczek, dostępny transport oraz metody płatności. Własną testową pozycję usunięto i potwierdzono pusty koszyk. Podgląd aplikacji zachował trzy wybrane prace, jedną posiadaną pozycję, kod 00-001 i 790,83 zł; na liście jest Modna Łazienka. Nie wykonano nowego wydania Android/iOS.

Nadal do pracy: 39 brakujących wariantów i opakowań, dostawy Castorama/OBI, lokalne stany i ceny sklepów stacjonarnych, limity zapasów w planach odbioru, częściowo posiadane materiały, ręczne pozycje i zgodność zamienników. Wyszukiwarka `/product_search?term=EAN` Modnej Łazienki zwróciła 502 dla Petro/Nati; nie dowodzi to braku produktów w sklepie. Nie powielać tej samej nieskutecznej ścieżki jako dowodu dostępności.
