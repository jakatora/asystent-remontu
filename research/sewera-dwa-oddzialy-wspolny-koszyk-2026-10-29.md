# Dwa oddziały Sewery w jednym planie zakupów (2026-10-29)

## Potrzeba użytkownika

Farba Dulux EasyCare 9 l i gładź Atlas GTA 18 kg są dostępne w Sewera, ale w różnych oddziałach. Jedno zamówienie nie ma potwierdzonej dostępności obu produktów. Użytkownik potrzebuje ceny **całego zestawu z obiema dostawami**, żeby móc uczciwie porównać Sewera z innymi sklepami.

## Rzeczywisty koszyk i oddziały

- [Farba Dulux EasyCare 9 l](https://sklep.sewera.pl/farba-wewnetrzna-biala-easycare-nieskazitelna-biel-9l-mat-dulux-p21385): oddział Tarnowskie Góry, 279,89 zł brutto + kurier DHL 30,90 zł dla testowego kodu `00-001`.
- [Gładź Atlas GTA 18 kg](https://sklep.sewera.pl/atlas-gta-gotowa-gladz-polimerowa-18kg-p6321): oddział Katowice, 65,90 zł brutto + kurier InPost 23,90 zł dla tego samego kodu.
- Dwa osobne, anonimowe zamówienia: **345,79 zł materiałów + 54,80 zł dostaw = 400,59 zł**. Obie ceny, ilości i opłaty pochodzą z koszyków sklepu; nie podano danych klienta i nie złożono zamówienia. Dowody SHA-256 zamówień: `f2cb52a4def569c4813e0b1c3ee79df7b01d1cc97944eb753e1e55f7fc97c4d2`, `db98a2285854f48e1ef3e6327e9d7e16c87075790f99ee091d6794ea63bf9b21`. Skrót połączonego dowodu: `7d98ee2cd87933284c409c3220f918a810db54cfed9bba1bbc60035c8564b1dd`.
- [Grunt Śnieżki 5 l](https://sklep.sewera.pl/sniezka-grunt-ekspresowy-5l-gleboko-penetrujacy-p14581) sprawdzono w siedmiu oddziałach Sewery: 0 sztuk w każdym. Nie dodano niekupowalnej oferty do porównania trzech produktów.

## Zmiana w aplikacji

- Źródło gładzi ma zweryfikowany oddział wysyłkowy Katowice. Dla dokładnie dwóch produktów z różnymi, sprawdzonymi oddziałami checkout wskazuje konieczność dwóch zamówień.
- Po włączeniu osobnych zamówień aplikacja wycenia każdy koszyk niezależnie, weryfikuje pełny podział opakowań i sumuje obie rzeczywiste opłaty. Brak jednej wyceny nie staje się kosztem 0 zł ani pełną sumą.
- Ekran zakupów pokazuje oddział przy każdym zamówieniu i wyjaśnia, dlaczego trzeba je złożyć oddzielnie. Wybranie jednego zamówienia na sklep zachowuje komunikat o braku potwierdzonej wspólnej dostawy.

## Weryfikacja

- Rzeczywiste koszyki Sewery potwierdziły **400,59 zł** dla testowego kodu. Kontrola tożsamości produktu i oddziału działa przed wysłaniem żądania do sklepu.
- Typecheck biblioteki wycen, API i aplikacji mobilnej PASS; testy logiki wycen **149/149**, mobilne **366/366**, wspólnego backendu **1054/1054**, ukierunkowane testy Sewery **15/15**.
- Świeży snapshot produkcji: 257 obserwacji i 148 plików. Przygotowana paczka zmienia tylko `src/services/remont-pricing.cjs`, zachowuje pozostałe 147 plików. SHA-256 modułu `889bedc2ae6041ce1d4732b448b501904602c45c3af9b6bc349df2d1c0ee366e`.
- Railway deployment `1617f555-3afb-4d28-800c-36ff068f6495` ma status SUCCESS. Po wdrożeniu **148/148 plików** jest identycznych z przygotowaną paczką. Backend [PR 109](https://github.com/jakatora/przetargai/pull/109) scalony.
- Produkcyjne `POST /api/remont/pricing/project` dla kodu testowego `00-001`: wybrana Sewera z osobnymi zamówieniami `compared`, 0 braków, **400,59 zł**. Każda część ma własną kwotę, oddział i opłatę. Wybrana Sewera przy ustawieniu „jedno zamówienie/sklep” ma `needs_delivery_costs`, bez pełnej kwoty i z powodem `requires_separate_dispatch`.
- Globalne porównanie tych samych dwóch produktów ma `compared`, 0 braków i wybiera tańszy plan **Lobo 194,80 zł + Sewera 89,80 zł = 284,60 zł** z dostawami. Stawka Lobo jest taryfą krajową dla Polski, a stawka Sewery pochodzi z koszyka dla kodu pocztowego.

## Zakres wyniku

Kwoty dotyczą testowego kodu `00-001` i chwili odczytu. Dla kodu użytkownika aplikacja pobiera nowe stawki. Dwa zamówienia Sewery są kompletną, sprawdzoną alternatywą; o najtańszym zestawie decyduje porównanie wszystkich potwierdzonych planów z dostawą. Nadal mogą istnieć tańsze warianty w sklepach bez potwierdzonej wyceny.
