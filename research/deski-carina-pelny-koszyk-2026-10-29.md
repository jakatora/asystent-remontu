# Deski Cersanit Carina — koszt całego zestawu z dostawą

Sprawdzenie: 2026-10-29. Zadanie rozwojowe pozostaje otwarte: ta partia obejmuje dokładnie trzy oryginalne modele desek i jednego sprzedawcę z potwierdzonym koszykiem. Nie przedstawiamy ich jako najtańszych na całym rynku.

## Zidentyfikowane produkty

| Kod Cersanit | EAN | Wariant i wymiary | Produkt | Cena TGS za sztukę |
| --- | --- | --- | --- | ---: |
| K98-0068 | 5907720651077 | standardowa, 36,1 × 43,4 cm | [TGS](https://tgs.pl/pl/p/Cersanit-Carina-deska-wc-duroplastowa/12739) | 226,80 zł |
| K98-0069 | 5907720651084 | wolnoopadająca z wypinaniem, 36,1 × 43,8 cm | [TGS](https://tgs.pl/pl/p/Cersanit-Carina-deska-wolnoopadajaca-z-latwym-wypinaniem/4896) | 283,72 zł |
| K98-0135 | 5902115712524 | SLIM, wolnoopadająca z wypinaniem, 35,7 × 44,8 cm | [TGS](https://tgs.pl/pl/p/Cersanit-Carina-deska-wc-slim-antybakteryjna%2Cwolnoopadajaca%2Clatwe-wypinanie%2Cduroplastowa/12740) | 297,19 zł |

Wymiary i rozróżnienie wariantów: [katalog Cersanit 2025/2026](https://www.cersanit.com.pl/katalogi/cersanit_general_catalogue_2025_2026_pl/) oraz [strona producenta modelu SLIM](https://www.cersanit.com.pl/lazienka/deska-carina-slim-duroplastowa-antybakteryjna-wolnoopadajaca-z-funkcja-latwego-wypinania-jednym-przyciskiem,190.html). Zdjęcia pochodzą z tych samych trzech kart TGS i są przypięte do dokładnych kodów i EAN. Natywne API sklepu zwróciło te same identyfikatory i ceny brutto. Standardowy wariant sklep oznacza jako dostępny na zamówienie; dostępność i termin należy ponownie sprawdzić przed zakupem.

Odrzucono oferty opisane jako „do Carina”, gdy karta wskazywała zamiennik lub niezgodne dane producenta i EAN. Nie łączymy ceny oryginału i zamiennika w jednym produkcie.

## Koszt dostawy całego zamówienia

Poniższe kwoty pochodzą z dziesięciu anonimowych koszyków TGS odczytanych 2026-10-29, bez danych odbiorcy i bez złożenia zamówienia. Metoda dostawy: kurier InPost, płatność przelewem tradycyjnym. Sklep zwrócił taryfę ogólnopolską; dla tej oferty kod pocztowy nie zmienił wyświetlonej taryfy. Przed zakupem aplikacja odświeża ofertę i koszt koszyka; brak odpowiedzi lub niepotwierdzony odbiór osobisty nie daje pozornej ceny całkowitej.

| Koszyk | Produkty | Dostawa | Razem |
| --- | ---: | ---: | ---: |
| 1 × K98-0068 | 226,80 zł | 19,00 zł | **245,80 zł** |
| 1 × K98-0069 | 283,72 zł | 19,00 zł | **302,72 zł** |
| 1 × K98-0135 | 297,19 zł | 19,00 zł | **316,19 zł** |
| 2 × K98-0068 | 453,60 zł | 24,00 zł | **477,60 zł** |
| 2 × K98-0069 | 567,44 zł | 0,00 zł | **567,44 zł** |
| 2 × K98-0135 | 594,38 zł | 0,00 zł | **594,38 zł** |
| Po jednej sztuce z każdego modelu | 807,71 zł | 0,00 zł | **807,71 zł** |

Dwie deski standardowe w dwóch pomieszczeniach są jednym zamówieniem za 477,60 zł — dostawa jest liczona raz. Jedna seria może zawierać kilka wariantów, ale każda miska wymaga osobnego potwierdzenia zgodności. Kwoty są obserwacją z 2026-10-29, nie gwarancją przyszłej ceny.

## Zachowanie w aplikacji

- Kalkulator przyjmuje 1–10 całych desek, dokładny kod, zgodność wszystkich misek oraz potwierdzenie, że zawiasy, śruby i podkładki są kompletne i pasują. Pyta także, czy użytkownik ma odpowiednie narzędzie do montażu. Nie zgaduje ceny brakujących części ani narzędzia.
- Zmiana kodu lub liczby desek kasuje poprzednie potwierdzenie zgodności, mocowań i narzędzia. Do czasu ponownego potwierdzenia całkowita cena zestawu pozostaje niepełna.
- Kupienie lub posiadanie własnej deski, brak kodu, niewłaściwa miska, brak mocowań, brak kodu pocztowego i niepotwierdzony odbiór osobisty są osobnymi scenariuszami bez mylącej pełnej ceny.
- Zdjęcie, kod EAN i źródło oferty są widoczne w projekcie. Wspólny koszyk grupuje sztuki z różnych pomieszczeń oraz nalicza dostawę dla całego zamówienia.

Interfejs przetestowano w projekcie `proj_mvtcq8i11aydwb93l`: 2 × standardowa dało 477,60 zł; po zmianie na SLIM wycena stała się niepełna; po ponownym potwierdzeniu 2 × SLIM dało 594,38 zł i wynik przetrwał odświeżenie strony. Dodatkowo „muszę kupić narzędzie” zablokowało pełną sumę i pokazało jedną pozycję bez wyceny. Po jawnym potwierdzeniu posiadanego narzędzia suma 594,38 zł wróciła; licznik zakupów starego projektu został skorygowany z 0/2 do 0/1, bez kasowania historii zakupu. Zrzuty: `work/catalog-wave90-two-seats.jpg`, `work/catalog-wave90-slim-two.jpg` i `work/catalog-wave90-tool-guard-price.jpg` w katalogu roboczym tego zadania.

## Weryfikacja

- Testy aplikacji: **890 zaliczonych, 0 błędów**; TypeScript dla mobile i API bez błędów.
- Testy wspólnego backendu: **1054 zaliczone, 0 błędów**.
- Produkcja po wdrożeniu: **16 scenariuszy SDK, 9 z kompletną ceną z dostawą**; wszystkie oczekiwane sumy zgadzają się co do grosza. Nowy release obejmuje wyłącznie dwie zmienione pozycje katalogu, pozostałe 146 plików backendu zachowano. Oferta wyświetlana jako krajowa taryfa koszyka, nie jako indywidualna wycena dla adresu.
- Pokrycie po tej partii: **187 referencji ze zdjęciami, 180 aktywnych produktów, 231 aktywnych ofert, 52 aktywne sklepy, 7 dotychczasowych referencji bez aktywnej oferty**. Audyt 65 historycznych map: 256 wymagań, 81 wycenionych i 175 niewycenionych; są to wymagania w scenariuszach, a nie liczba różnych produktów do dodania. Nowa linia narzędzia wymaga jawnego potwierdzenia. 11 starych scenariuszy ma pełną wycenę. Nowe wybory desek są sprawdzone osobno.

## Dalszy rozwój

Następne partie powinny obejmować brakujące produkty w najczęściej wybieranych pracach, konkretny wariant narzędzia dla użytkowników, którzy go nie mają, i drugi sklep dla dokładnie tych samych EAN desek, o ile jego koszyk i dostawa są weryfikowalne. Warto też skrócić kreator.
