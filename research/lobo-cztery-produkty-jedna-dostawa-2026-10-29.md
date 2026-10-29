# Cztery produkty malarskie, jedna dostawa Lobo (2026-10-29)

## Potrzeba użytkownika

Folia ochronna Blue Dolphin była w katalogu w [Sewera](https://sklep.sewera.pl/folia-malarska-gruba-4x5m-cfep2004932-blue-dolphin-p21034) i [Rab-Dom](https://www.rabdom.pl/pl/p/Folia-ochronna-malarska-Blue-Dolphin-GRUBA-4m-x-5m/3751). Przy zakupie farby, taśmy i gruntu w Lobo osobna folia wymagała drugiej dostawy. Użytkownik potrzebuje ceny za cały zestaw, nie rankingu pojedynczych produktów.

## Potwierdzone źródło i koszyk

- [Lobo](https://lobo.pl/blue-dolphin-folia-malarska-gruba-4x5m) sprzedaje dokładnie folię Blue Dolphin Gruba 4 × 5 m, EAN `5907758504932`. Natywne Shoper Front API w dniu 2026-10-29 zwróciło produkt `11389`, kod `s3.566CF380`, `can_buy=true`, jednostkę `szt.` i cenę brutto **4,49 zł**. Fotografia Lobo odpowiedziała HTTP 200 `image/webp`.
- Anonimowy natywny koszyk przyjął 2 puszki Dulux Rapidry 1 l, 1 rolkę taśmy Blue Dolphin 30 mm × 50 m, 1 opakowanie Atlas Uni-Grunt 5 kg oraz 1 folię 4 × 5 m. Materiały: **158,36 zł**. Jedna dostawa kurierska InPost przy przedpłacie: **22,90 zł**. Razem: **181,26 zł**. Paczkomat, odbiór, pobranie i lokalna dostawa Poznań nie zastąpiły kuriera do domu. Nie podano danych klienta i nie złożono zamówienia.
- Obserwacja folii ma czas `2026-10-29T16:16:10.277Z` i SHA-256 surowej odpowiedzi API `c0db197e84715b7413c4302909a7f22003975500bdd0555729ba1b3c0bb7011c`.

## Wynik dla testowego kodu 00-001

| Produkcyjny stan porównania | Materiały | Dostawy | Potwierdzona suma |
|---|---:|---:|---:|
| Przed dodaniem folii Lobo: Lobo + Rab-Dom | 154,37 zł | 33,40 zł | 187,77 zł |
| Po dodaniu folii Lobo: jeden sklep | 158,36 zł | 22,90 zł | **181,26 zł** |

Różnica dla tego zestawu wynosi **6,51 zł**. Produkcyjne `POST /api/remont/pricing/project` po wdrożeniu zwraca dla wybranego Lobo `status=compared`, `missing=0`, jedną dostawę i 181,26 zł. Globalny ranking wybiera ten sam najtańszy **potwierdzony** koszyk, ale zachowuje `status=needs_delivery_costs`: ABUD zwrócił `quote_unavailable`, a jedna z prób dodatkowego koszyka Sewery `quote_timeout`. Nie dowodzi to minimum całego rynku. Stawka Lobo ma podstawę `retailer_basket_national` i `destinationScope=PL` — nie jest osobną wyceną dla kodu 00-001. Cena, dostępność i koszt dostawy mogą się zmienić.

## Weryfikacja kodu

- Test mieszanej sesji Shoper obejmuje cztery EAN, pięć sztuk łącznie, jedną dostawę do domu i pominięcie tańszego paczkomatu. **926/926** testów aplikacji oraz **1053/1053** testy wspólnego backendu PASS bez pominięć. Typecheck API i mobile PASS.
- Świeży snapshot produkcji przed wdrożeniem: 252 obserwacje i 148 plików. Przygotowana paczka zmienia tylko `src/data/remont-verified-offers.json` oraz `src/services/remont-pricing.cjs`, zachowując pozostałe 146 plików. SHA-256 modułu cenowego: `f9ca9165398968fe7d926210a4e30413160a65e4e9a6d275b1670cdc967d94a2`.
- Railway deployment `2449d1ce-332f-4e16-bae4-64e277cd5ecf` ma status **SUCCESS**. Snapshot po wdrożeniu jest zgodny z przygotowaną paczką w **148/148 plikach** i zawiera 253 obserwacje. Produkcyjne zdrowie: 253 źródła, 246 aktywnych ofert, 181 aktywnych produktów; folia Lobo `active=true`. Backend [PR 104](https://github.com/jakatora/przetargai/pull/104) został scalony.

Następny etap: uzupełniać dokładne produkty i zdjęcia oraz wyjaśnić brak potwierdzonej dostawy dla pozostałych sklepów. Nie zastępować brakującej wyceny stawką domyślną ani nie nazywać potwierdzonego koszyka globalnie najtańszym.
