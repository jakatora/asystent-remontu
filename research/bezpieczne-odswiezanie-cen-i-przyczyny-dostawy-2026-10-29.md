# Odświeżanie cen i przyczyny niepełnego porównania

Data: 2026-10-29. Kod `00-001` jest przykładem testowym; aplikacja bierze kod od użytkownika.

## Problem użytkownika

Przy ręcznym odświeżeniu cen ekran „Gdzie najtaniej” pokazywał poprzednią wycenę z informacją o sprawdzaniu, ale skrót na ekranie Plan nadal mógł przedstawiać ją jako bieżący koszt zakupów. Ponowne sprawdzenie może wykryć zmianę ceny, dostawy albo zakończyć się błędem. Skrót pełnej kwoty musi w tym czasie zniknąć; po udanym odczycie wraca z nową wyceną.

Poprawka czyści migawkę skrótu przy każdym rozpoczęciu wyceny, także przy `refreshPrices`. Poprzednia wycena pozostaje widoczna w porównaniu z jednoznacznym ostrzeżeniem, że koszt zostanie potwierdzony po sprawdzeniu. W razie błędu nie przywracamy starej kwoty w skrócie. Nie zmieniono rachunku cen, stawek ani danych sprzedawców.

## Braki w przykładowym koszyku malarskim

Lokalny ekran działającej aplikacji dla czterech materiałów pokazał potwierdzony koszyk 305,37 zł materiałów + 59,40 zł dostaw = 364,77 zł w trzech sklepach. Porównanie miało ograniczony zakres; inne kombinacje mogą być tańsze. Rozwinięta lista wskazała brak integracji kalkulatora dostawy Castoramy i OBI oraz przekroczenie czasu wyceny innych wariantów Sewery, Lobo i Rab-Dom. Interfejs rozróżnia teraz `quote_timeout`, `quote_limit` i `invalid_quote` zamiast ogólnego komunikatu o niepowodzeniu.

## Dowód

Na żywym lokalnym web buildzie przed zmianą Plan pokazywał pełne 364,77 zł. Po naciśnięciu „Odśwież ceny” porównanie oznaczyło kwotę jako poprzednią; natychmiastowe przejście do Planu nie pokazało już jej jako aktualnej. Zmiana komunikatów pojawiła się w rozwiniętej liście sklepów: dla Sewery, Lobo i Rab-Dom wprost „Nie zdążyliśmy potwierdzić dostawy tego wariantu”. Typecheck mobilny PASS, testy mobilne 370/370 PASS. Testy uruchomiono przez dostępny lokalny `tsx` i preloader `__DEV__=false`, ponieważ skrót `pnpm test` w tej instalacji nie widzi pliku wykonywalnego `tsx`.

## Dalej

Potrzebne są natywne, potwierdzone wyceny Castoramy i OBI albo ich jawne ograniczenie w rankingu oraz szybsze sprawdzanie większej liczby pełnych kombinacji. 364,77 zł nie stanowi gwarancji minimum całego rynku.
