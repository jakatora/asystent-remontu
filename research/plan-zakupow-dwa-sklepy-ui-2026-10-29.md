# Czytelny plan zakupów w kilku sklepach (2026-10-29)

## Problem

Produkcyjny koszyk farby Dulux EasyCare 9 l i gładzi Atlas GTA 18 kg dla testowego kodu `00-001` kosztuje **284,60 zł** przy podziale Lobo + Sewera. Jeden koszyk Lobo kosztuje **298,70 zł**. Ekran pokazywał łączną kwotę i szczegółowe karty sklepów, lecz dla dwóch sklepów domyślnie chował listy produktów. Użytkownik musiał sam powiązać produkty z odpowiednimi zamówieniami.

## Zmiana

- Przy potwierdzonym planie dostawy z więcej niż jednego sklepu ekran pokazuje kroki zakupowe: sklep, jego pełną sumę, dostawę, nazwy produktów i liczbę zamówień. Liczba zamówień uwzględnia sytuację, gdy jeden sklep wymaga kilku osobnych koszyków.
- Dla maksymalnie dwóch sklepów i trzech produktów w każdym lista produktów jest od razu rozwinięta. Użytkownik widzi zdjęcia, opakowania oraz dostępne linki do ofert bez dodatkowych kliknięć. Dłuższe listy pozostają zwijane.
- Ostrzeżenie `Porównanie niepełne` nadal jest widoczne przed planem, kiedy konkurencyjnych koszyków nie dało się wycenić. Plan nie zmienia kwot, rankingu ani zasad wyceny: pokazuje liczby otrzymane z backendu i nigdy nie podstawia zera za brakującą dostawę.
- Układ korzysta z istniejących kolorów i typografii aplikacji, tekstów PL/EN oraz elementów dotykowych o wysokości co najmniej 48 px.

## Sprawdzenie

- Mobile TypeScript typecheck PASS po usunięciu tymczasowej trasy podglądowej; `git diff --check` PASS.
- Lokalny podgląd Expo Web w Chromium przy **390 × 844 px** z reprezentatywnym, testowym koszykiem 2 sklepów pokazał poprawny układ: 284,60 zł razem, Lobo 194,80 zł, Sewera 89,80 zł, ostrzeżenie przed krokami, zdjęcia i linki w rozwiniętych kartach. Plik z podglądem: `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/work/remont-ui-wave112-delivery.png`. Trasa `__qa-delivery` służyła tylko lokalnemu podglądowi i została usunięta przed commitem.
- Dane w podglądzie odwzorowują wcześniejszy produkcyjny wynik, ale sam podgląd nie jest nowym pomiarem cen ani testem istniejącego projektu użytkownika. Natywnego okna przeglądarki Codex nie dało się przejąć (`browser.user is unavailable`); lokalny Chromium potwierdził render komponentu.

Następny kierunek: weryfikować ten przepływ na prawdziwych koszykach większych niż 3 produkty oraz rozszerzać zweryfikowany katalog sklepów i dostaw. Cel rozwoju aplikacji pozostaje aktywny.
