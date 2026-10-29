# Skrót zakupów: pełna kwota tylko dla właściwej dostawy

Data: 2026-10-29. Zakres: ekran skrótu zakupów na kartach Przegląd, Zakupy i Budżet.

## Problem

Skrót uznawał koszyk za kompletny, jeżeli sklepową wycenę dostawy oznaczono jako `retailer` i jej data ważności była w przyszłości. Nie porównywał kwoty z natywnej wyceny z opłatą w koszyku ani nie wiązał wyceny dla konkretnego kodu pocztowego z kodem użytkownika. Niepełny lub niespójny wynik mógł więc wyglądać jak pełna cena zakupów.

## Zmiana

Przed pokazaniem pełnej kwoty skrót sprawdza teraz dla każdego sklepu: nieujemną kwotę w groszach równą opłacie w wycenie, poprawny przedział czasu ważności do 10 minut oraz zakres dostawy `PL` lub dokładnie kod pocztowy użytkownika. Niespójna wycena pozostawia materiały widoczne, ale nie pokazuje pełnej kwoty i kroków zakupów. Poprawiono też opis: posiadane i kupione materiały są pomijane w koszyku.

## Dowód

- `pnpm --filter ./artifacts/mobile typecheck` — PASS.
- Testy skrótu i dostępnej części koszyka — 12/12 PASS, w tym nowy test złego kodu, innej opłaty i błędnego czasu.
- Pełny zestaw testów mobilnych przez lokalny preloader TypeScript — 370/370 PASS.
- Rzeczywisty HTTP produkcyjnego `/api/remont/pricing/project`, kod testowy `00-001`: Sewera, po jednym arkuszu z pięciu gradacji, 2794 gr razem (1990 gr dostawa); Matiw, po 50 arkuszy, 20124 gr razem (1900 gr dostawa). Obie odpowiedzi dają `complete` w zmienionym kodzie aplikacji. Po podmianie kodu lub opłaty obie dają `shipping_unknown` i nie ujawniają pełnej sumy.

Matiw zwraca krajową stawkę dostawy `PL`, Sewera wycenę dla kodu `00-001`. To dowód poprawnego użycia dwóch typów wycen, nie gwarancja cen dla dowolnego adresu ani całego rynku.
