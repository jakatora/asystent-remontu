# Klingspor P180/P220: pojedyncze arkusze lub paczki po 50 — 2026-10-29

## Problem użytkownika

Najtańszy zakup tego samego materiału zależy od liczby potrzebnych sztuk i od kosztu całego zamówienia. EAN Klingspor P180/P220 na kartach różnych sklepów oznacza ten sam wyrób, lecz Sewera sprzedaje pojedyncze arkusze, a Matiw paczki po 50. Porównanie ceny za samą sztukę bez sprawdzenia jednostki handlowej i dostawy wskazałoby błędny sklep.

## Zweryfikowane oferty

- [Matiw P180, 50 sztuk](https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P180-50szt/25771): EAN `5907560023560`, kod sklepu `000622`, natywne ID `25771`, **36,00 zł brutto za paczkę 50 sztuk**. Odczyt API `2026-10-29T19:15:35.159Z`, SHA dowodu `fb4190e988428ba6a8b101259aadf30955909ce50d5375eb95f462804b465ec4`.
- [Matiw P220, 50 sztuk](https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P220-50szt/25772): EAN `5907560027483`, kod `000632`, ID `25772`, **36,00 zł brutto za paczkę 50 sztuk**. Odczyt `2026-10-29T19:15:35.235Z`, SHA `deac8db450203ca978296359a2922f009dc8453f91206b1ca0472f459eaa7455`.
- Oba produkty `can_buy=true`, jednostka natywna `szt.` oznacza całą paczkę. Walidator wymaga dwóch dokładnych ID, kodów, EAN, gradacji, nazwy i opisu `50szt`; błędne oznaczenie paczki jako jednej kartki odrzuca ofertę.
- Zdjęcie P180 z Matiw zwróciło HTTP 200 `image/png` i zostało obejrzane. Obraz P220 udostępniony przez Matiw jest pusty, więc do tego EAN przypięto [już zweryfikowane zdjęcie P220 z Sewery](https://sklep.sewera.pl/papier-scierny-gr-220-arkusz-230x280mm-p6902). Ilustruje produkt, a ilość 50 potwierdza karta Matiw.

## Wynik rzeczywistego anonimowego koszyka

Natywny koszyk Matiw potwierdził dwie paczki po 36 zł, sumę materiałów 72 zł, kuriera 19 zł i płatność przelewem. Jest to stawka krajowa `PL`, nie wycena indywidualna dla kodu `00-001`. Sewera zwróciła stawkę pod kod kontrolny `00-001`.

| Zapotrzebowanie | Najtańszy potwierdzony zestaw | Materiały | Dostawa | Razem |
| --- | --- | ---: | ---: | ---: |
| 1 × P180 + 1 × P220 | Sewera, dwa pojedyncze arkusze | 3,21 zł | 19,90 zł | **23,11 zł** |
| 50 × P180 + 50 × P220 | Matiw, dwie paczki po 50 sztuk | 72,00 zł | 19,00 zł | **91,00 zł** |

API lokalne dla obu koszyków zwróciło `compared` i zero braków. Dla dużego zestawu sama Sewera kosztowała 198,40 zł z aktualną wyceną dostawy, więc Matiw oszczędza 107,40 zł w sprawdzonym zakresie. To porównanie konkretnych ofert i koszyków w dniu odczytu; kwoty mogą zmienić się po odświeżeniu. Aplikacja pokazuje podstawę wyceny dostawy i nie podaje tej stawki jako gwarancji dla każdego adresu.

## Kontrole i dalsza praca

Nowe źródła korzystają z istniejącego czytnika i anonimowego koszyka Shoper. Zapisano dwie nowe obserwacje bez zmiany poprzednich 262. Test HTTP sprawdza zmianę wyboru sklepu między 1 i 50 arkuszami oraz jedną dostawę na zamówienie. Dalsze produkty i sklepy należy dodawać z dokładną jednostką zakupu, zdjęciem oraz natywną wyceną dostawy; brak stawki ma pozostać jawną luką w porównaniu.

Testy: API dla tych źródeł i wcześniejszych zestawów 4/4, mobile 369/369, pricing 149/149, wspólny backend 1054/1054; API/mobile typecheck, zdjęcia 192/192, źródłowe linki 3/3 i kontrola starych ID przeszły. Szerszy historyczny pakiet API w izolowanej kopii ma znany problem ładowania części importów TypeScript pod Node 24; nie traktujemy testów celowanych jako dowodu pełnego pakietu.

Backend [PR 114](https://github.com/jakatora/przetargai/pull/114) scalono jako `54f09367befa8dc20783e63258aef56234445d11`. Railway deployment `65f74093-fa65-475d-932a-f9a3e043dffc` zakończył się `SUCCESS`. Produkcyjny HTTP potwierdził `compared/missing=0` i wybór Sewery 2311 gr dla 1+1 oraz Matiw 9100 gr dla 50+50, również w globalnym rankingu. Nowy seed ma 264 obserwacje, a migawka po wdrożeniu jest zgodna w 148/148 plikach z przygotowaną paczką; SHA modułu `59c5490e4731ac0b3474fd845cac8f5fe6229d4024b0fc31167c050b422881d8`.
