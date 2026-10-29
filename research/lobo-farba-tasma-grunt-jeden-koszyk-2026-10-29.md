# Dulux, Blue Dolphin i Atlas: jeden koszyk Lobo (2026-10-29)

## Problem użytkownika

Atlas Uni-Grunt 5 kg był dostępny w aplikacji w innych sklepach, więc przy wspólnym remoncie farba, taśma i grunt mogły wymagać dwóch zamówień i dwóch opłat kurierskich. Porównanie powinno uwzględniać dokładne ilości, opakowania oraz łączny koszt dostawy.

## Sprawdzony produkt i zdjęcie

- [Lobo](https://lobo.pl/atlas-emulsja-gruntujaca-uni-grunt-5kg) sprzedaje Atlas Uni-Grunt 5 kg, EAN `5905400520026`. Natywne Shoper Front API w dniu 2026-10-29 potwierdziło produkt `20533`, kod `CHEMIK-GRU-02`, jednostkę zakupu `szt.`, `can_buy=true`, cenę brutto **37,90 zł** i możliwość dodania do koszyka. [Sewera](https://sklep.sewera.pl/atlas-uni-grunt-5kg-emulsja-gruntujaca-p9772) niezależnie publikuje ten sam EAN i opakowanie.
- Fotografia WebP z karty Lobo odpowiedziała HTTP 200 `image/webp`. Oferta ma własny adres zdjęcia. Obserwacja ceny została zapisana z czasem `2026-10-29T16:06:32.330Z` i SHA-256 surowej odpowiedzi API `d8020f32d0dc0b46b63bc4e5725b6904abb35f51f6c201b515cbc88a29f07a62`.

## Pełny zestaw dla testowego kodu 00-001

Anonimowy koszyk Lobo przyjął **2 × Dulux Rapidry 1 l, 1 × taśma Blue Dolphin 30 mm × 50 m i 1 × Atlas Uni-Grunt 5 kg**. Materiały kosztowały 153,87 zł, jedna przedpłacona dostawa kurierska InPost 22,90 zł, razem **176,77 zł**. Paczkomat, odbiór osobisty, pobranie i lokalna dostawa Poznań nie zastąpiły kuriera do domu. Nie przekazano danych klienta ani nie złożono zamówienia.

| Produkcyjny stan porównania | Materiały | Dostawy | Potwierdzona suma |
|---|---:|---:|---:|
| Przed dodaniem oferty Lobo: Lobo + Sewera | 153,20 zł | 42,80 zł | 196,00 zł |
| Po dodaniu oferty Lobo: jeden sklep | 153,87 zł | 22,90 zł | **176,77 zł** |

Różnica dla sprawdzonego zestawu wynosi **19,23 zł**. Produkcyjne `POST /api/remont/pricing/project` po wdrożeniu zwraca dla wybranego Lobo `status=compared`, `missing=0`, jedną dostawę i 176,77 zł. Globalne porównanie wybiera ten sam najtańszy **potwierdzony** koszyk, ale zachowuje `status=needs_delivery_costs`, ponieważ ABUD zwraca `quote_unavailable`. Nie ma dowodu, że to najniższa cena spośród wszystkich możliwych sklepów. Dostawa Lobo ma podstawę `retailer_basket_national` i `destinationScope=PL`: jest aktualną taryfą krajową, nie odrębną stawką dla kodu 00-001. Ceny i dostępność mogą się zmieniać.

## Weryfikacja i wdrożenie

- Test mieszanej sesji Shoper sprawdza wszystkie trzy EAN, ilości, sumę materiałów, jeden kurier do domu oraz odrzucenie tańszego paczkomatu. Zestaw aplikacji: **926/926 PASS**, bez pominięć; wspólny backend **1053/1053 PASS**, bez pominięć; typecheck API i mobile PASS.
- Paczka powstała z czystej kopii kodu i świeżego snapshotu produkcji: 251 obserwacji i 148 plików. Zmieniły się tylko `src/data/remont-verified-offers.json` i `src/services/remont-pricing.cjs`; pozostałe 146 plików zachowano. Po wdrożeniu snapshot produkcji jest zgodny z przygotowaną paczką **148/148 plików** i zawiera 252 obserwacje; SHA-256 modułu cenowego `035712e6c0f158aa8524a56e0513c99f2df89e13ddcb20c2cd148612d6691fe2`.
- Railway deployment `c7f462b4-a6bc-414b-9f82-29d135573092` ma status **SUCCESS**. Produkcyjne zdrowie: 252 źródła, 245 aktywnych ofert, 181 aktywnych produktów; nowy grunt Lobo `active=true`. Backend [PR 103](https://github.com/jakatora/przetargai/pull/103) został scalony. Zmiana kodu aplikacji jest na gałęzi `codex/remont-zakupy-20261024`.

Następny etap: dodawać dokładne produkty i sklepy z koszykiem obejmującym całą potrzebną ilość oraz usuwać brak wyceny dostawy ABUD bez wymyślania stawki. Dla każdego kodu pocztowego użytkownika utrzymywać rozróżnienie między stawką krajową a wyceną sklepu dla konkretnego kodu.
