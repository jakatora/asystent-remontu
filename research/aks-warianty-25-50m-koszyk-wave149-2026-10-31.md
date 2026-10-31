# Kolejne warianty AKS i wspólna dostawa — 2026-10-31, wave149

Wdrożono cztery produkty ze zdjęciami oraz cztery rzeczywiste oferty ABUD. Katalog produkcyjny ma **216 referencji i wpisów zdjęć, 309 źródeł, 274 aktywne oferty dla 183 produktów**. Pozostałe 33 wcześniejsze referencje nadal nie mają potwierdzonej oferty. Cel rozwoju pozostaje aktywny.

| Wariant YDYp AKS Zielonka, 450/750 V | Kod producenta | EAN | Cena pełnej rolki |
| --- | --- | --- | --- |
| 3×1,5 mm², 25 m | 777094 | 5904617578769 | 121,70 zł |
| 3×1,5 mm², 50 m | 777095 | 5904617578752 | 242,50 zł |
| 3×2,5 mm², 50 m | 777098 | 5904617578714 | 370,10 zł |
| 3×2,5 mm², 5 m | 777215 | 5901602190951 | 42,70 zł |

Tożsamości potwierdza tabela na stronie 1 [deklaracji producenta AKS 015/2025](https://media.adeo.com/media/4774947/media.pdf), ponownie obejrzana podczas tej fali, i cztery odrębne natywne karty:

- [ABUD 6883: 3×1,5 mm², 25 m](https://www.abud.pl/product-pol-6883-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x1-5-25m.html).
- [ABUD 6892: 3×1,5 mm², 50 m](https://www.abud.pl/product-pol-6892-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x1-5-50m.html).
- [ABUD 6901: 3×2,5 mm², 50 m](https://www.abud.pl/product-pol-6901-Przewod-elektryczny-AKS-ZIELONKA-YDYP-3x2-5-50m.html).
- [ABUD 65390: 3×2,5 mm², 5 m](https://www.abud.pl/product-pol-65390-Przewod-elektryczny-3x2-5-YDYP-5m-AKS-Zielonka.html).

Zdjęcia pochodzą z tych samych kart i załadowały się w publicznym interfejsie. Natywne jednostki `op.` dla 25/50 m i `szt.` dla 5 m oznaczają pełne rolki. Zapotrzebowanie użytkownika pozostaje w metrach bieżących. Dopisano dokładne ID do istniejących allowlist; nie osłabiono walidacji GTIN, jednostek, ilości, ceny czy zapasu. Starsze EAN-y i przekroje nie są aliasowane. Produkty są dostępne jako świadomy wybór w dodatkowych materiałach koszyka, bez automatycznej zmiany projektu elektrycznego lub poziomu jakości.

## Rzeczywiste koszyki i interfejs

Anonimowe koszyki sklepowe potwierdziły:

| Koszyk | Kod testowy | Materiały | Dostawa | Razem |
| --- | --- | --- | --- | --- |
| Nowa rolka 3×2,5 mm², 5 m | 30-001 | 42,70 zł | 13,00 zł | **55,70 zł** |
| Nowa rolka 3×1,5 mm², 25 m | 30-001 | 121,70 zł | 13,00 zł | 134,70 zł |
| Dwie rolki 5 m, obydwa przekroje | 00-001 | 71,60 zł | 13,00 zł | 84,60 zł |
| Cztery nowe rolki, po jednej | 30-001 | 777,00 zł | 0,00 zł | **777,00 zł** |

Opłaty pochodzą z natywnych, niepustych koszyków oraz bieżącej taryfy Pocztex Kurier 24 dla kodu. Zero zł jest rzeczywistą wyceną, a nie wartością domyślną; małe koszyki mają płatną dostawę. Nie ustalono stałego progu darmowej wysyłki z tych przykładów. Nie złożono zamówienia, nie uruchomiono płatności ani nie przekazano kontaktu klienta.

Publiczny Edge QA używał produkcyjnego API i rzeczywistych sklepów bez interceptów. Potwierdził 55,70 zł dla jednej rolki oraz 777 zł dla czterech nowych wariantów, cztery załadowane fotografie, jedną wspólną dostawę, zachowanie pozycji i kodu po reload, PL/COI, szerokość 390 px bez overflow, zero błędów JavaScript i nieudanych żądań. Wyłącznie własny izolowany profil `web-aks-production-profile-wave149`; żadnych zmian w projektach użytkownika. Zrzuty obejrzane. Kwoty dotyczą odczytów z 2026-10-31 i mogą się zmienić przy kolejnym sprawdzeniu.

## Pozostały przypadek większego remontu

Piąty natywny koszyk, z ośmioma rolkami obu fal, ma sumę kart **2043,10 zł**, ale rzeczywistą sumę po rabacie **2022,66 zł**. Obecny moduł jawnie zwraca `price_changed` i nie potwierdza niewłaściwej sumy. Nie jest to jeszcze obsłużony zakup z rabatem. Plan i dowody są zapisane w [zakresie obsługi rabatów koszykowych](rabat-abud-koszyk-do-wdrozenia-2026-10-31.md). To priorytet kolejnej fali; rabat nie może stać się fikcyjną zmianą zwykłej ceny produktu ani opłatą dostawy.

Sprawdzono też nowe tropy dla dawnych braków. Norgips 50×30 m w Adamex ma aktualnie OutOfStock / „Produkt na zamówienie”, mimo innego fragmentu wyszukiwarki. Merkury Market GW180 ma rzeczywisty koszyk z ceną 45,99 zł, ale bez potwierdzenia dokładnego GTIN i dostawy dla samego kodu; jego transport jest regionalny według miasta. Tych ofert nie dodano do automatycznego rankingu. Nie ponawiano blokowanych kanałów Castorama/OBI/Leroy bez nowej przesłanki.

## Walidacja i wdrożenie

412/412 testów mobile clean, 39/39 scoped API (5 nowych przypadków), typecheck API/mobile i zachowane 66 legacy ID. Pełny przygotowany współdzielony backend **1063/1063 PASS**, bez pominięć, własna baza testowa. HTTP testuje surowe 2,4 m, pełną rolkę i wspólną dostawę. Stara regresja pięciu ofert nadal korzysta z pięciu zapisanych kart, a nowe cztery mają osobne fixture. Piąty rzeczywisty koszyk dokumentuje nieobsłużony rabat i wymaga jawnego odrzucenia niezgodnej sumy. Cztery znane wcześniejsze błędy starego samodzielnego zestawu API nie są zaliczane jako zielone.

Źródło **`30808ac7ec3d1bab5dc345cabac80534d72a86ec`**. [PR 140](https://github.com/jakatora/przetargai/pull/140), head `612f565a2af2a8ca4c9d3ef62efec2269cacec3c`, scalony jako `a96efb726c31f69eaaf4ee0675289d58c682d695`. Snapshot/preflight 150 plików bez nieoczekiwanego dryfu; zmieniono tylko moduł Remontu i seed 305→309. Wszystkie wcześniejsze 305 wpisów i pozostałe 148 plików zachowane. Post-SSH 150/150 zgodne, SHA256 modułu `33e16cd1b2d816ee44a981972c1b2ac42cfcf1d23797d9f7ddea498802eddd2f`.

API Railway **`655757b5-bb96-46e0-966b-a6af707aa648` SUCCESS**, utworzone 2026-10-31T13:26:27.418Z. WWW **`53487378-1e25-49e1-bf2f-8d49a58823a6` SUCCESS**, utworzone 2026-10-31T13:25:27.721Z. Web opublikowany przed API, aby prywatny relay obsługiwał nowe ID. Archiwum publiczne: 63 pliki / 17 128 378 B, wszystkie publiczne SHA256 zgodne. 76 sprawdzonych wartości vaulta bez wycieku. Relay ready, missing assets 0, dziewięć tras 200, pliki prywatne 404, niepodpisany POST 401, COOP same-origin / COEP credentialless / no-referrer. Sklepy relaya, HMAC/nonce/TTL i dotychczasowy cache v3 bez zmian. Bez nowych usług, pakietów i płatnych wywołań AI. Obce WIP zachowane.

Dowody w katalogu roboczym: `aks-native-observations-wave149.json`, `abud-native-carts-wave149.json`, `basket-discount-gap-wave149.json`, `web-aks-{local,production}-qa-wave149.json`, `web-aks-production-{single,basket,products,mobile}-wave149.png`, `catalog-summary-wave149-production.json`, `web-production-http-wave149.json`, `api-clean-tests-wave149.log`, `mobile-clean-tests-wave149.log`, `shared-tests-wave149.log`, `aks-preparation-wave149.json`, `verify-deployed-aks-wave149.log`.

Historia produkcyjna każdej z czterech nowych ofert ma dwa rzeczywiste odczyty, delta 0, bez sztucznej promocji i mieszania jednostek. Dowód `aks-live-history-wave149.json`. Po restarcie i ukończonym odświeżeniu cache v3 ma 307 obserwacji i 1344 punkty historii; wszystkie 1075 wcześniejszych punktów zachowano dokładnie. Snapshot 2026-10-31T13:30:13.934Z, SHA256 `8cd5c1c026f1f6302d1f81e19fe53c35f40ba99063ea12aaab5f899b3088d01e`, dowód `history-cache-preservation-wave149.json`.
