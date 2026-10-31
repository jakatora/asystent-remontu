# Elektro-Plast: produkty, zdjęcia i dostawa wspólnego koszyka — 2026-10-31, wave152

Dodano cztery dostępne produkty sprzedawane pojedynczo. Każdy ma odrębny GTIN, prawdziwe zdjęcie sklepu i odczyt dostępności. Są osobno wybierane w dodatkowych materiałach wspólnego koszyka. Nie zastępują automatycznie żadnego modelu ani pakietu; ID prac, obmiary, formuły i lista istniejących materiałów pozostają zgodne z zapisanymi projektami.

| Produkt | Kod producenta | GTIN | Cena brutto / szt. | Stan przy odczycie |
| --- | --- | --- | --- | --- |
| Puszka PK-60F PRO głęboka z wkrętami | 0285-01 | 5901752632141 | 1,39 zł | 503 szt. |
| Pierścień Ø60×12 mm z wkrętami | 028402-01 | 5901752638945 | 2,29 zł | 367 szt. |
| Pierścień Ø60×24 mm z wkrętami | 028403-01 | 5901752638952 | 2,89 zł | 273 szt. |
| Puszka PK-60F LUX pogłębiana z wkrętami | 0206-51 | 5907569154098 | 2,29 zł | 656 szt. |

Źródła to bieżące karty HIPPER (odczyty 2026-10-31T14:47Z) i dokument producenta [EPN 2024, strony 6 i 8](https://www.elektro-plast.com.pl/download/EPN_CENNIK_2024_05.02.2024.pdf). Dokument potwierdza indeksy, GTIN-y, rodzaj i wariant; jego stare ceny netto nie są używane jako cena konsumencka. Opakowania zbiorcze 50/60 szt. nie zmieniają jednostki sprzedaży sklepu. Natywny koszyk potwierdził zamówienie poniżej tych ilości.

Karty:

- [PRO 0285-01](https://hipper.pl/puszka-podtynkowa-laczeniowa-60-mm-pro-z-wkretami-elektro-plast-956340504)
- [Pierścień 12 mm](https://hipper.pl/pierscien-dystansowy-do-puszki-60-x-12-mm-z-wkretami-elektro-plast-956230239)
- [Pierścień 24 mm](https://hipper.pl/pierscien-dystansowy-do-puszki-60-x-24-mm-z-wkretami-elektro-plast-956230245)
- [LUX 0206-51](https://hipper.pl/puszka-podtynkowa-60-mm-lux-z-wkretami-elektro-plast-956340465)

Pierścienie są akcesoriami kategorii `electrical-box-spacer`, a nie puszkami. PRO i LUX są różnymi modelami. Dotychczasowy pakiet 10 szt. 0285-01L / GTIN 5901752637337 pozostaje bez zmiany tożsamości i aktywnej oferty. Nie aliasowano jego kodu do jednej sztuki. Nowe zdjęcia są zdalnymi adresami sklepu; brak nowych plików graficznych w repo.

## Rzeczywisty koszt całości

Koszyk 10 puszek PRO, 2 pierścieni 12 mm, 3 pierścieni 24 mm i 4 puszek LUX: **36,31 zł materiały + 18,90 zł Kurier InPost = 55,21 zł**. Wycena HIPPER jest krajowa, dla Polski, przy płatności z góry. UI odróżnia ją od wyceny dla konkretnego kodu. Nie deklarujemy odrębnego sprawdzenia lokalizacji dla tej stawki.

Po dodaniu jednej rolki AKS YDYp 3×2,5 mm² 25 m, GTIN 5904617578721:

| Podział zakupów | Materiały | Dostawy | Razem |
| --- | --- | --- | --- |
| Wszystko w HIPPER | 225,31 zł | 37,80 zł | 263,11 zł |
| Przewód ABUD, cztery produkty EPN w HIPPER | 229,01 zł | 0,00 zł + 18,90 zł | **247,91 zł** |

Wariant w dwóch sklepach kosztuje łącznie **15,20 zł mniej**, mimo wyższej ceny materiałów o 3,70 zł. Natywny koszyk HIPPER osobno potwierdził wzrost dostawy do 37,80 zł przy dołączeniu przewodu (13 prawdziwych żądań HTTP, bez danych klienta, złożenia zamówienia lub płatności). Pierwsza asercja E2E błędnie zakładała zachowanie kosztu 18,90 zł i nie przeszła; nie zmieniano na jej podstawie algorytmu ani ceny. Po sprawdzeniu rzeczywistego koszyka skorygowano oczekiwania testu. Aplikacja już prawidłowo wskazywała zestaw 247,91 zł.

## Weryfikacja i publikacja

- 418/418 testów aplikacji, 1064/1064 wspólnego backendu, bez pominięć; nowy test parsera czterech natywnych kart; typecheck mobile/API w głównym i czystym checkout oraz 66 legacy IDs PASS.
- Testy jednostki zakupu odrzucają 50 szt. jako jednostkę natywną oraz GTIN dziesięciopaku przypisany do nowej karty. Test aplikacji zachowuje ilość w sztukach i rozróżnia funkcje pierścieni/puszek.
- Gotowy lokalny pakiet web i izolowany aktualny backend z prawdziwymi sklepami: 55,21 zł dla czterech produktów i 247,91 zł dla pięciu. Alternatywa HIPPER 263,11 zł, cztery nowe zdjęcia załadowane, pięć pozycji i kod 30-001 zachowane po przeładowaniu, brak błędów strony i 429, PL, 390 px bez przepełnienia, crossOriginIsolated=true.
- Świeży snapshot API: 150 plików, zmienione wyłącznie `src/data/remont-verified-offers.json` i `src/services/remont-pricing.cjs`, pozostałe 148 zachowane identycznie. 309 wcześniejszych obserwacji zachowanych, dodane 4: 313 źródeł. CORS Retry-After z wave151 zachowany.
- Source aplikacji `b3558a3bc44eb15aba44581952ad4765decf8a3b`. Moduł API SHA256 `163d3f2df3e41f2e2689d46cfd4add68853c2711b0ccda09f826af042ec81ae8`. Shared PR [143](https://github.com/jakatora/przetargai/pull/143), merge `e21d2c32773c092c70dcab0bb0e29285810e5f26`.
- Pakiet web: 63 zasoby / 17137928 B, poprawne SHA, 76 wartości z vaulta bez wycieku, prywatny relay poza publicznym archiwum.

API deployment `2b17206f-9f05-440d-9ef8-ad88af96e1ca` SUCCESS, utworzony 2026-10-31T14:58:45.051Z. Kontrola SSH po wdrożeniu: 150/150 plików zgodnych z przygotowanym pakietem. Web deployment `5c1b7dea-301b-4a03-93e5-4441e3248ea4` SUCCESS, utworzony 2026-10-31T15:00:57.582Z. Publiczny HTTP potwierdził właściwy commit, 63/63 SHA zasobów, 9 tras 200, prywatne pliki 404, niepodpisany przekaźnik 401 i prawidłowe COOP/COEP/no-referrer.

Publiczne E2E bez przechwytywania cen i dostaw, wykonane na tym wdrożeniu: 55,21 zł dla czterech nowych produktów, 247,91 zł dla pełnego zestawu z przewodem i alternatywa HIPPER 263,11 zł. Cztery unikalne nowe zdjęcia rzeczywiście załadowane, pięć pozycji i 30-001 zachowane po przeładowaniu. Zero błędów strony i 429, widok 390 px bez przepełnienia, PL i crossOriginIsolated=true. Dowód `epn-production-qa-wave152.json`, ekran `epn-production-mobile-wave152.png`.

Dowody poza repo: `work/box-new-products-wave152.json`, `box-native-cart-wave152.json`, `box-wire-native-cart-wave152.json`, `epn-local-qa-wave152.json`, `epn-preparation-wave152.json`, `web-release-integrity-wave152.json`, `web-production-http-wave152.json`, `mobile-tests-wave152.log`, `shared-tests-wave152.log`. Produkcyjny katalog, 2026-10-31T15:01:12.915Z: 220 referencji / 220 wpisów zdjęć, 313 źródeł, 278 aktywnych ofert dla 187 produktów, nadal 33 wcześniejsze pozycje bez aktywnej oferty. Dowód `catalog-summary-wave152-production.json`.

W tym etapie nie potwierdzono aktywnych ofert dla wcześniejszych braków: Bricomarché Fola wymaga dostępu sklepowego (natywne HTTP 403), pojedyncza puszka ma inny GTIN niż brakujący dziesięciopak. Nie użyto kopii `.lol`, nieznanych domen CloudFront, niedostępnych towarów ani obcych walut jako dostępnych ofert PL. Cel dalszego rozwoju pozostaje ACTIVE.

Uwaga o artefaktach technicznych: skopiowany helper przygotowania początkowo używał nazwy raportu `discount-preparation-wave150.json`. Raport wave152 zachowano pod poprawną nazwą `epn-preparation-wave152.json`; poprzednie, niezmienione katalogi baseline/prepared wave150 ponownie porównano: 150 plików, zmieniony wyłącznie moduł cen, 309 obserwacji, SHA 7160c3d7… zgodne. Raport150 jawnie oznacza nową datę ponownej weryfikacji oraz brak oryginalnego znacznika czasu. Pozostałe dowody wave150 i pliki produkcyjne nie były nadpisane.
