# Akryl G-K w trzech sklepach: wybór według ceny z dostawą — 2026-10-29

## Problem użytkownika

Najniższa cena samego produktu może prowadzić do droższego zakupu po doliczeniu dostawy. Akryl Soudal do płyt G-K 280 ml był wcześniej porównywany tylko z ofertą Realbud, co ograniczało wybór w koszyku całego remontu.

## Zmiana

- Dodano potwierdzone oferty tego samego produktu, EAN `5411183157248`, z [Lobo](https://lobo.pl/soudal-akryl-do-plyt-g-k-280ml-bialy) i [Sewery](https://sklep.sewera.pl/soudal-akryl-do-plyt-gk-bialy-280ml-p13819). Katalog ma teraz trzy oferty tego EAN, łącznie z Realbud. Identyfikacja Lobo opiera się także na natywnym Shoper ID `43829`, kodzie `ij.u137686` i jednostce `szt.`.
- Zdjęcie materiału w aplikacji pochodzi teraz z dokładnej oferty Lobo; obraz WebP zwrócił HTTP 200 i został sprawdzony wizualnie. Audyt katalogu zdjęć: 190/190.
- Dodano obserwacje cen i dostępności obu sklepów z 2026-10-29, bez ręcznie wpisanych stawek dostawy. Koszt dostawy nadal pochodzi z anonimowego koszyka sklepu dla aktualnego zestawu i kodu pocztowego użytkownika. Dla Lobo cennik w koszyku jest krajowy, dla Sewery zależy od kodu.

## Przykład rzeczywistej wyceny

Dla testowego kodu `00-001` i jednej tuby akrylu G-K:

| Sklep | Materiał | Dostawa | Razem |
| --- | ---: | ---: | ---: |
| Lobo | 11,99 zł | 20,90 zł | 32,89 zł |
| Sewera | 12,94 zł | 19,90 zł | **32,84 zł** |
| Realbud | 15,01 zł | 25,00 zł | 40,01 zł |

Lobo ma tańszy produkt, lecz Sewera daje o 0,05 zł tańszy zakup z dostawą. Dwa różne akryle Soudal (G-K i uniwersalny) we wspólnym koszyku Sewery: materiały 22,84 zł + jedna dostawa 19,90 zł = **42,74 zł**. Potwierdzony koszyk Realbud dla tych samych dwóch produktów wynosi 56,00 zł. Są to wyniki anonimowych koszyków w sprawdzonych sklepach, nie gwarancja najniższej ceny całego rynku; wycena może się zmienić i dla innego kodu będzie obliczana ponownie.

## Kontrole i wdrożenie

- Odczyt źródeł potwierdził EAN, dostępność i ceny brutto: Lobo 1199 gr (`2026-10-29T18:33:02.600Z`, SHA dowodu `ca9afb206fec3874fb9dc4eb5d7ed6b4f3b95380a175fd9e25f8ec1e84b05eee`); Sewera 1294 gr (`2026-10-29T18:33:03.935Z`, SHA `51967a120a559e3a3941477b7866285f118bd613e3760d1a2cecc812f9598205`).
- Test koszyka dla jednej i dwóch pozycji oraz wycena produkcyjna po wdrożeniu: `compared`, `missingProductCount=0`. Wynik wybrany: Sewera 3284 gr dla jednej i 4274 gr dla dwóch pozycji.
- API/mobile typecheck, mobile 368/368, pricing 149/149, wspólny backend 1054/1054, audyt zdjęć 190/190 i Expo Web export przeszły. Kontrola legacy IDs przeszła.
- Backend [PR 112](https://github.com/jakatora/przetargai/pull/112) scalony jako `eebb5c6bb65855e61bdd9ba0d81699b58ac8e158`; Railway deployment `080a377e-f851-4149-8a12-5f14305169b8` zakończony `SUCCESS`. Wdrożone 148/148 plików odpowiada przygotowanej paczce, 260 obserwacji; SHA modułu `9368baf0afb559e15219d39354c99c5747830e6314e8f908280faeaf600770ed`.

## Dalsza praca

Dodawać kolejne produkty i sklepy tylko z potwierdzoną tożsamością i zdjęciem, sprawdzać realne koszyki dla kodu użytkownika oraz utrzymywać rozróżnienie między pełną wyceną a brakiem ceny dostawy lub dostępności. Ranking może podawać najtańszy zestaw w zakresie potwierdzonych ofert, a nie całego rynku.
