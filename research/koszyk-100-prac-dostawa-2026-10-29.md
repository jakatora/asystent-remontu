# Koszyk całego remontu do 100 prac — 2026-10-29

## Problem użytkownika

Przy remoncie wielu pomieszczeń aplikacja pozwalała wybrać najwyżej 20 prac. Zbiorczy wybór pomijał dalsze prace, więc widoczny koszt materiałów i dostawy mógł nie obejmować całego remontu.

## Zmiana

- Koszyk przyjmuje do 100 prac z obmiarami oraz jeden osobny etap materiałów dodatkowych. Wybór zbiorczy, zapis i ponowne otwarcie zachowują wszystkie wybrane prace.
- Serwer przyjmuje 101 etapów i do 1000 wierszy materiałowych. Po przekroczeniu granicy zwraca `basket_limit_exceeded`; interfejs pokazuje limit po polsku lub angielsku. Nie obcina etapów ani pozycji w wycenie.
- Materiały z różnych prac są sumowane przed doborem opakowań, a potwierdzona dostawa jest doliczana do zamówienia sklepu. Dla wielu produktów algorytm może sprawdzić ograniczoną liczbę pełnych wariantów; istniejący komunikat w interfejsie wyraźnie to oznacza.

## Weryfikacja

- Test aplikacji: 35 prac w różnych pomieszczeniach zachowuje wszystkie 35 etapów i wymagania materiałowe po odczycie zapisanego wyboru.
- Test HTTP: 100 prac jest wycenionych jako pełny koszyk; dodatkowy etap przechodzi jako 101., a 102 etapy i ponad 1000 pozycji otrzymują jawny błąd.
- Produkcyjne API dla reprezentatywnego kodu `00-001`: 100 prac + dodatkowy etap, łącznie 101 etapów, `compared`, brakujących produktów 0. Jeden pakiet akrylu Soudal G-K w Realbud: materiały 15,01 zł + dostawa kurierem 25,00 zł = 40,01 zł. To sprawdzenie zakresu i pojedynczego sklepu; stawka Realbud jest krajowa, a nie indywidualna dla tego kodu.
- Testy: mobile 368/368, silnik wyceny 149/149, wspólny backend 1054/1054, typecheck mobile i API oraz Expo Web export.
- Produkcyjny snapshot: 258 obserwacji, 148 plików; paczka wdrożeniowa zmieniła tylko `src/services/remont-pricing.cjs`, pozostałe 147 plików pozostało identycznych. Po wdrożeniu 148/148 plików zgodnych, SHA modułu `f6a43f7546af6cb9c9010c9af8537a5188217ecea8b776422bbf696cd93aa920`.
- Backend: [PR 111](https://github.com/jakatora/przetargai/pull/111) scalony jako `bee2b558513be9c3d31c38885de5a80bf6d11988`; Railway deployment `3957727c-3538-4fca-8223-34f86359cba5` zakończony `SUCCESS`.

## Dalsza praca

Limit 100 prac i 1000 wierszy jest nadal granicą. Porównanie do 200 różnych produktów i 64 sklepów ma ograniczony zakres; przy ponad 20 różnych produktach wynik może być najtańszy tylko wśród sprawdzonych pełnych wariantów. Rozwijać katalog dokładnych produktów i zdjęć, wyceny dostaw kolejnych sklepów oraz czytelność planu zakupów dla dużych remontów. Nie określać niepełnego porównania jako absolutnie najtańszego na rynku.
