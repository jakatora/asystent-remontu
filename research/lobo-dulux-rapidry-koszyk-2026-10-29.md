# Dulux Rapidry biały mat 1 l: oferta Lobo i dostawa całego koszyka (2026-10-29)

## Problem użytkownika

Referencyjna farba Dulux Rapidry biały mat 1 l (EAN 5904078222379) miała zdjęcie, ale po wycofaniu oferty ABUD nie miała aktywnego sprzedawcy z potwierdzoną dostawą. Ranking pełnego remontu nie mógł uwzględnić tej farby.

## Potwierdzenie produktu i koszyka

- [Lobo](https://lobo.pl/dulux-rapidry-farba-do-drewna-metalu-pcv-mat-bialy-1l) publikuje dokładny EAN 5904078222379, wariant biały mat 1 l i zdjęcie. [Grupa PSB](https://www.grupapsb.com.pl/produkt/farba-do-drewna-metalu-i-pcv-rapidry-1-l-bialy-mat-dulux-5904078222379.html) niezależnie potwierdza tożsamość opakowania. Zdjęcie Lobo odpowiedziało HTTP 200 `image/webp`.
- Publiczne Shoper Front API Lobo zwróciło produkt 55967, kod `S7.005777249`, cenę brutto 49,99 zł, jednostkę `szt.` i `can_buy=true`. Natywny anonimowy koszyk przyjął dwie puszki, zachował ilość oraz sumę materiałów 99,98 zł.
- Koszyk zwrócił InPost Kurier 22,90 zł dla dwóch puszek. Paczkomat 18,99 zł, odbiór osobisty, pobranie oraz lokalna dostawa do Poznania nie są przedstawiane jako dostawa kurierska do domu. Opis metody kurierskiej wspomina, że palety nie obejmują wniesienia; sama metoda pozostaje przesyłką kurierską. Wyjątek interpretacji dotyczy tylko Lobo.
- Dla jednej puszki sklep naliczył kuriera 20,90 zł. Wycena jest zależna od pełnego koszyka i aktualizowana po zmianie liczby opakowań. Sklep zwraca taryfę krajową dla Polski, nie odrębną stawkę wyliczoną z kodu pocztowego. API oznacza ją `retailer_basket_national` oraz `destinationScope=PL`.
- [Kochamy Drewno](https://kochamy-drewno.pl/product-pol-25652-Dulux-Rapidry-Szybkoschnaca-farba-do-drewna-metalu-BIALA-BIALY-MAT-1L.html) ma niższą cenę na stronie, lecz natywny koszyk zgłosił `reservation_stocksown=0`; nie została dodana jako potwierdzona oferta.

## Produkcyjny wynik

Wdrożenie Railway `2efeade5-4ade-4a6e-9efc-699e85750cf0` ma status SUCCESS. Po wdrożeniu snapshot 148/148 plików zgadza się z przygotowaną paczką; zmieniły się tylko katalog zweryfikowanych ofert i bundle Asystenta Remontu. SHA-256 bundle: `0e35d77b1913094000c25637f418a8c7ee6240c1de3a0fd0357288c14b4e22e9`. Backend [PR 101](https://github.com/jakatora/przetargai/pull/101) scalony jako `a133f1a9c8396e0c367202c1b2babccf178808da`.

Produkcyjne `POST /api/remont/pricing/project`, 2026-10-29:

| Koszyk | Kod testowy | Materiały | Dostawa do domu | Razem | Wynik |
|---|---|---:|---:|---:|---|
| Dulux Rapidry 1 l, 1 puszka | `30-001` | 49,99 zł | 20,90 zł | **70,89 zł** | `compared`, `missing=0` |
| Dulux Rapidry 1 l, 2 puszki | `00-001` | 99,98 zł | 22,90 zł | **122,88 zł** | `compared`, `missing=0` |

Różnica opłaty wynika z liczby puszek, nie jest dowodem różnicy między kodami pocztowymi. Krajowa taryfa pozostaje ważna tylko dla obecnego koszyka i chwili sprawdzenia.

## Weryfikacja i zakres

Testy aplikacji i serwisu cenowego 925/925 PASS, testy wspólnego backendu 1053/1053 PASS, typecheck API i mobile PASS. Test selekcji dostawy sprawdza kuriera InPost, odrzucenie paczkomatu i nieznanego modułu. Testy po pierwszej zmianie wykryły niepożądany wpływ na inne sklepy; regułę ograniczono do Lobo i pełny zestaw przeszedł ponownie. Żywy koszyk i produkcyjne HTTP potwierdziły zachowanie niezależnie od fixture.

Stan produkcji: 250 źródeł, 243 aktywne oferty, 181 aktywnych produktów. Kolejne prace obejmują dokładne produkty bez aktywnych ofert oraz sklepy wymagające potwierdzonego dostępu do cen i wycen dostawy. Ceny i koszty są kwotami brutto; żadna płatność ani zamówienie nie zostały złożone.
