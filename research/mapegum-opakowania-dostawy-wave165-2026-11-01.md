# Mapegum WPS 5/10 kg: dodatkowe oferty i dostawa do kodu — 2026-11-01

## Zakres i źródła

Dodano dwie referencje ze zdjęciami i cztery oferty: 5 kg, kod 124805PL, GTIN 8022452242489 oraz 10 kg, kod 124810PL, GTIN 8022452242496. Obie pojemności mają oferty Rab-Dom i Sewery. Nowe ID to `mat-mapegum-wps-5kg-124805pl` i `mat-mapegum-wps-10kg-124810pl`. Starsze referencje 5/10 kg z kodami 8022452002113/8022452002120 i zapisane projekty pozostają bez zmian. Kod producenta w nazwie rozróżnia warianty. Nie dodano nowego sklepu ani automatycznej zamiany produktów.

| Oferta / źródło pierwotne | Identyfikacja i cena brutto podczas sprawdzenia |
|---|---|
| [Rab-Dom 5 kg](https://www.rabdom.pl/pl/p/MAPEI-Mapegum-WPS-5kg-HYDROIZOLACJA-PLYNNA-FOLIA/1906) | product/stock1906, SKU12552, 112,90 zł |
| [Rab-Dom 10 kg](https://www.rabdom.pl/pl/p/MAPEI-Mapegum-WPS-10kg-HYDROIZOLACJA-PLYNNA-FOLIA/9873) | product9873/stock9877, SKU2879, 199,90 zł |
| [Sewera 5 kg](https://sklep.sewera.pl/folia-w-plynie-mapegum-wps-5kg-mapei-p7751) | GTIN8022452242489, 124805PL, 112,35 zł/SZT |
| [Sewera 10 kg](https://sklep.sewera.pl/folia-w-plynie-mapegum-wps-10kg-mapei-p7754) | GTIN8022452242496, 124810PL, 225,85 zł/SZT |

Niezależne potwierdzenia GTIN i zawartości: [OBI 5 kg](https://www.obi.pl/p/6718563/mapei-hydroizolacja-mapegum-wps-5-kg), [OBI 10 kg](https://www.obi.pl/p/6718571/mapei-hydroizolacja-mapegum-wps-10-kg), [Adamex 10 kg](https://eadamex.pl/folia-w-plynie/6971-folia-w-plynie-mapegum-wps-10kg-mapei-8022452242496.html) i [E-Kowalczyk 5 kg](https://sklep-kowalczyk.pl/mapei-mapegum-wps-plynna-folia-izolacja-przeciwwilgociowa-5kg-op-124805pl.html). Te dodatkowe karty są dowodem tożsamości, nie nowymi zintegrowanymi ofertami z dostawą. Promocji CastoPro z kwietnia 2026 nie przyjęto jako aktualnego rabatu.

Obejrzano rzeczywiste etykiety na zdjęciach 5/10 kg z kart Rab-Dom, HTTP200. W repo tylko URL CDN, bez nowych plików graficznych lub wygenerowanych zdjęć. Rab-Dom: zakup niepodzielnej sztuki, package 0, ścisłe piny ID/GTIN/SKU/nazwy/producenta Mapei57. Sewera: GTIN, wariant, brutto/SZT, zapas, a następnie liczba sztuk i ceny całego koszyka wybranego oddziału. Ilość zapotrzebowania w kg; cena za całe wiadro.

## Rzeczywiste koszyki

| Zakup | Materiały | Dostawa | Razem |
|---|---|---|---|
| Rab-Dom 5 kg | 112,90 zł | 10,50 zł | 123,40 zł |
| Sewera 5 kg | 112,35 zł | 19,90 zł | 132,25 zł |
| Rab-Dom 10 kg | 199,90 zł | 10,50 zł | 210,40 zł |
| Sewera 10 kg | 225,85 zł | 23,90 zł | 249,75 zł |
| Rab-Dom 5 + 10 kg | 312,80 zł | 17,99 zł | 330,79 zł |
| Sewera 5 + 10 kg | 338,20 zł | 23,90 zł | 362,10 zł |
| Rab-Dom 5 + 10 kg + Primer G Pro 5 l | 392,70 zł | 21,00 zł | 413,70 zł |

Tańsze samo wiadro 5 kg w Sewerze przegrywa z dostawą o 8,85 zł. Oddzielne zakupy 5 i 10 kg w Rab-Dom kosztują 333,80 zł; wspólny 330,79 zł. Kwoty to obserwacje z 2026-11-01, nie stałe stawki w aplikacji.

Sewera potwierdziła koszyk i endpoint `get_order_delivery_cost` dla 30-001 oraz 00-001: `retailer_basket_postcode`, wysyłka Katowice. Dla pary wiader oba kody dały 23,90 zł, ale zapytania i dowody oddzielnie wiążą wynik z kodem. Przekazano kraj i kod, miasto/ulica puste, bez kontaktu i zamówienia. Rab-Dom ma jawną taryfę krajową PL, `retailer_basket_national`, bez indywidualnej wyceny kodu. UI i kopia planu zachowują tę różnicę. Brak ręcznych progów/stawek transportu.

5,1 kg → 2 × 5 kg za 236,30 zł z dostawą. 10,1 kg → 2 × 10 kg za 420,80 zł. Dwa projekty po 3 kg z referencją 5 kg łączą zapotrzebowanie przed zaokrągleniem i zakupem: razem dwa wiadra.

## Weryfikacja

- 106 testów adapterów/API/relay, 472 aplikacji, 179 pricing i 1064 współdzielonego backendu: **1821 PASS, 0 FAIL, 0 SKIP**. Czysty checkout; typy pricing/mobile/API przechodzą. Testy importują produkcyjne parsery i quoter oraz przechwycone elementy odpowiedzi, bez kopii stawek w logice.
- Osiem natywnych koszyków i 12 wycen przygotowanego API. Zmieniony EAN, jednostka, pojemność/SKU, blokada przewoźnika i zmiana ceny nie stają się potwierdzonym zakupem.
- 14 scenariuszy UI lokalnie i14 publicznie: 5/10 kg, przecinek i pełne wiadra, wybór sklepu, Sewera i dwa kody, zestaw z gruntem, kopia planu, zapis trzech pozycji i kodu po reload. Sumy 12340/13225/12340/23630/21040/42080/21040/33079/36210/36210/33079/41370/41370/41370 gr. Dwa zdjęcia, PL, COI, 390 px bez overflow, zero błędów JS i HTTP429. Publiczne API bez podmiany odpowiedzi. Własne profile, brak zmian projektów użytkownika.
- 66 chronionych job IDs zachowane. Walidator modułu Mapei: 13/13 URL HTTP200, zero ostrzeżeń. Bez zmian obmiarów, migracji, zależności, rich/legacy i obcego WIP. Brak testu fizycznego Androida/iOS i badań z klientami.

## Publikacja i ograniczenia

Kod aplikacji `7cd0d2c2b3c2c7af3beee03a8651adfa16545a9d`. [PR155](https://github.com/jakatora/przetargai/pull/155) MERGED, backend `142ee8c1c137039a91b4d80869382dc7b37ec25d`, merge `8ef0521f0f29d98f002b7eafbba8f2f92d1cacad`.

API `ac451977-4679-42fb-8922-37841a83a23b` i WWW `c244e627-6e6f-4001-9fd3-b533d429b612` — oba **SUCCESS**. Sześć publicznych koszyków przed WWW: 123,40 / 210,40 / 330,79 / 413,70 / 132,25 / 362,10 zł. Wszystkie mają aktualnie potwierdzone ceny odpowiednich nowych ofert, pustą listę błędów odświeżania i rzeczywiste dostawy. Sewera zachowuje `retailer_basket_postcode` i kod30-001; publiczny UI sprawdził też00-001. Snapshot po wdrożeniu: wszystkie150 plików identyczne z przygotowanym wydaniem. [Publiczny koszyk](https://asystent-remontu-web-production.up.railway.app/renovation-basket), health source7cd0d2c.

Świeży snapshot/preflight: 150 plików backendu, zmieniony moduł i seed, pozostałe148 zachowane. Pierwotne329 obserwacji bez zmian, dopisane4 →333. RuntimeSHA `e8fb84824a96d85846a592afc1782660eb86968613dd435105b1ba67e5620462`. WWW: 63 pliki/17 202 603 bajty, skan76 wartości vaulta bez wycieku. Publiczne63 pliki sprawdzone SHA256, dziewięć tras i WASM działają; nagłówki COOP/COEP/no-referrer prawidłowe, prywatne pliki404, niepodpisany endpoint401. Sześć plików serwera/config WWW identycznych z164-R2; prywatny bundle relay zawiera nowy katalog, SHA `e7fd129b0ddf9eec9efe32a9b0aea6070b25e5e86086f42804d0525208a1bfe8`. Bez nowego serwera, klucza, AI, konta, harmonogramu i płatności.

Dowody w `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/work`: `mapegum-native-proof-wave165.json`, `mapegum-project-native-proof-wave165.json`, `mapegum-cloud-before-web-proof-wave165.json`, `mapegum-{local,production}-qa-wave165.json`, `mapegum-production-purchase-plan-wave165.txt`, `catalog-identity-production-audit-wave165.json`, `web-production-http-wave165.json`, logi `*-wave165*.log`, `web-release-integrity-wave165.json`, `web-server-compatibility-wave165.json`. Profile i katalogi wydania są initializerami. Lokalny profil r1 zatrzymał błędną asercję helpera o taryfie PL; poprawiony helper r2 potwierdził14 przypadków z właściwym `postal_code`. Publiczny profil r1 przeszedł14 przypadków. Kod produktu nie wymagał tej poprawki.

Publiczny audyt katalogu: 232 referencje, 199 z aktualną ofertą, 295 aktywnych ofert; cztery odrębne SKU bez EAN, zero pominięć i fałszywych potwierdzeń. Nowe warianty nie usuwają33 wcześniejszych braków ceny. Automatyczne mieszanie opakowań Mapegum jeszcze nie jest wdrożone: to następny osobny krok z potwierdzoną rodziną, świadomym wyborem i zachowaniem GTIN/pojemności, bez aliasowania starych kodów. eTak/ABUD i pełna integracja wszystkich kodów Castoramy/OBI nie uzyskały nowego dowodu w tej partii. Cel pozostaje **ACTIVE**.
