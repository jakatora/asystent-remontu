# Dulux Rapidry i Blue Dolphin: jeden koszyk Lobo (2026-10-29)

## Problem użytkownika

Farba Dulux Rapidry była dostępna w Lobo, a taśma Blue Dolphin 30 mm × 50 m w innych sklepach. Porównanie mogło wskazać dwa zamówienia i dwie opłaty kurierskie. Użytkownik potrzebuje najtańszej pełnej sumy dla konkretnych ilości, nie porównania samych cen produktów.

## Nowa oferta

- [Lobo](https://lobo.pl/blue-dolphin-tasma-papierowa-niebieska-30mm-x-50m) publikuje taśmę Blue Dolphin EAN 5907758515952, 30 mm × 50 m. Natywne Shoper Front API potwierdza produkt 5220, kod `s3.566758515952`, jednostkę `szt.`, `can_buy=true` i 15,99 zł brutto za całą rolkę. [Rab-Dom](https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-do-wnetrz-i-na-zewnatrz-30mm-x-50m-niebieska/2526) niezależnie potwierdza ten sam EAN i rozmiar.
- Fotografia produktu Lobo odpowiedziała HTTP 200 `image/webp`. Oferta ma własny URL zdjęcia; istniejące zdjęcie referencyjnej taśmy w aplikacji pozostaje dostępne.
- Żywy, anonimowy koszyk Lobo przyjął dwie puszki Dulux Rapidry i jedną rolkę taśmy. Adapter potwierdził obie pozycje, ilości, ceny brutto, sumę materiałów i jedną dostawę kurierską. Nie wysłano danych klienta ani zamówienia.

## Wynik dla pełnego zestawu

Produkcyjne `POST /api/remont/pricing/project` dla kodu testowego `00-001`, 2026-10-29:

| Stan porównania | Sklepy | Materiały | Dostawa do domu | Całość |
|---|---|---:|---:|---:|
| Przed dodaniem taśmy Lobo | Lobo + Rab-Dom | 111,97 zł | 33,40 zł | **145,37 zł** |
| Po dodaniu taśmy Lobo | Lobo | 115,97 zł | 22,90 zł | **138,87 zł** |

Oszczędność dla tego zestawu: **6,50 zł**. Po wdrożeniu zarówno globalne porównanie, jak i wybór Lobo zwróciły `status=compared`, `missing=0`, jedną dostawę i sumę 138,87 zł. Lobo podaje taryfę krajową PL (`retailer_basket_national`, `destinationScope=PL`), a nie stawkę indywidualnie wyliczaną z kodu. Cena, dostępność i koszt zależą od chwili oraz ilości w koszyku.

## Weryfikacja i wdrożenie

- Test mieszanej sesji Shoper potwierdza dwa EAN, dwie puszki, jedną rolkę i odrzucenie tańszego paczkomatu jako dostawy do domu. Pełny zestaw: 926/926 testów aplikacji i silnika cenowego PASS, 1053/1053 testy wspólnego backendu PASS, typecheck API/mobile PASS.
- Nowa obserwacja ceny ma czas `2026-10-29T15:53:44.842Z` i SHA-256 treści API. Świeży snapshot produkcji przed wdrożeniem zawierał 250 obserwacji i 148 plików. Paczka zmieniła tylko `src/data/remont-verified-offers.json` i `src/services/remont-pricing.cjs`.
- Railway deployment `12a26c18-1ae9-435b-87a3-41c1becd1f98` SUCCESS. Snapshot po wdrożeniu: 148/148 plików zgodnych z przygotowaną paczką, 251 obserwacji, SHA-256 bundle `21625673e5d37939ec932700b4cc40750f6e0bd186778c8b77320ca481a4c516`.
- Backend [PR 102](https://github.com/jakatora/przetargai/pull/102) scalony jako `3c9c016be32093387034ef7bf5a637a029ec6084`. Produkcyjne zdrowie: 251 źródeł, 244 aktywne oferty, 181 aktywnych produktów, taśma Lobo aktywna.

Następny etap: dodawać dokładne produkty i sklepy z potwierdzoną dostawą całego koszyka oraz zmniejszać liczbę referencji bez aktywnej oferty. Nie zakładać, że jedna taryfa krajowa dowodzi różnych kosztów dla różnych kodów pocztowych.
