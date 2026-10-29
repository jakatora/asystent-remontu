# Atlas Cerplast 15 kg: drugi sklep i wspólny koszyk

Data weryfikacji: 2026-10-29. Ceny są odświeżane z kart i koszyka sklepu; poniższe kwoty są migawką, a nie stałym cennikiem.

## Tożsamość produktu

- EAN `5905400530032`, podkład Atlas Cerplast CP-00-15, zamknięte opakowanie 15 kg.
- [Karta E-Kowalczyk](https://sklep-kowalczyk.pl/atlas-cerplast-podklad-grunt-pod-tynk-op-15kg-cp-00-15-52413.html) podaje ten sam EAN w głównym formularzu produktu. Cena brutto odczytana 2026-10-29 12:39 UTC: 140,97 zł. Zdjęcie produktu z głównej galerii sklepu zwraca `200 image/png`.
- [Karta Sewery](https://sklep.sewera.pl/podkladowa-masa-tynkarska-cerplast-15kg-atlas-p9884) jest drugim źródłem dokładnie tego EAN w katalogu. Samo porównanie cen materiału nie wyznacza najtańszego całego remontu, ponieważ dochodzą dostawy poszczególnych sklepów.

## Rzeczywisty koszyk na 00-001

Anonimowy koszyk E-Kowalczyk z trzema pełnymi opakowaniami: Cerplast 15 kg, Koelner WS-3595 1000 szt. i Koelner FX-06K040 200 szt. Magento potwierdziło dokładne SKU, ilości, ceny brutto, PLN oraz domowego kuriera InPost z przedpłatą. Materiały kosztowały 206,17 zł, dostawa 16,99 zł, razem 223,16 zł. Koszyk nie składał zamówienia ani nie przekazywał danych klienta.

Produkcyjny `POST /api/remont/pricing/project` po wdrożeniu `d3034a6b-d046-4fe5-83fb-40c54abf473e` zwrócił dla tego samego zestawu i kodu `00-001`: `missingProductCount=0`, `best.totalGrosze=22316`, `basis=retailer_basket_postcode`, `destinationScope=postal_code`. W porównaniu wszystkich sklepów najlepsza potwierdzona oferta jest taka sama. Odpowiedź globalna ma status `needs_delivery_costs` przy dostępności części alternatyw bez potwierdzonego kosztu dostawy; nie przedstawiać wyniku jako gwarantowanego minimum całego rynku.

## Zabezpieczenia i testy

Adapter odrzuca inny EAN, markę, kategorię, jednostkę, wielkość opakowania, nazwę, cenę w koszyku, dodatkową opłatę, walutę, inną ilość, brak kuriera i niewłaściwy kod. Zdjęcie, cena i opakowanie pochodzą z głównej karty i natywnego koszyka. Test lokalnej trasy HTTP używa zapisanych odpowiedzi sklepu i potwierdza jedną dostawę na cały zestaw. Pełny zestaw testów aplikacji: 903/903; backend współdzielony: 1054/1054; kontrole typów API i mobile: poprawne. Po wdrożeniu porównano 148/148 plików usługi z paczką wdrożeniową. Zachowano 243 wcześniejsze obserwacje i dodano jedną nową.
