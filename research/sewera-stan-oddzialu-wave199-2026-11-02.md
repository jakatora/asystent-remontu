# Sewera: rzeczywisty zapas oddziału i koszyk — W199, 2026-11-02

## Wykryty problem i zmiana

Anonimowy koszyk Sewery przyjął jedną listwę Profigips 34×34 mm / 2,5 m, pokazał prawidłową cenę 5,73 PLN i sumę, lecz w wybranym oddziale Katowice zgłosił brak towaru. Pole ilości miało `max="0,0000"`, a wiersz `basket-no-product` zawierał „Towar nie może zostać zamówiony - brak w magazynie!”. Karta bez wybrania tego oddziału pokazywała 37 sztuk.

Dotychczas `confirmSeweraBasket` rozpoznawał tylko komunikat o częściowym niedoborze „W magazynie znajdują się jedynie ...”. Pełny brak przechodził kontrolę, po czym `/zamowienie` przekierowywało do strony głównej, bez formularza dostawy. To nie dowodziło darmowego transportu ani możliwości zakupu.

Poprawka sprawdza także rzeczywisty limit ilości w potwierdzonym wierszu oraz jawny komunikat pełnego braku. Zero jest brakiem zapasu; nie jest kosztem dostawy. Zwracany jest dotychczasowy błąd `insufficient_stock` z `maxPackages:0`. Istniejący adapter wiąże ten limit z ofertą, oddziałem, ilością, ceną i kodem pocztowym. Kontrola całej sumy nadal następuje przed przekazaniem niedoborów. Sprzeczne komunikaty, nieprawidłowe limity, inne SKU, kwoty lub oddział wymagają ponownego sprawdzenia; nie otrzymują potwierdzonej wyceny.

Źródło rzeczywistego koszyka: https://sklep.sewera.pl/naroznik-do-mokrych-tynkow-34x34mm-2-5m-profigips-p16477 , kod sprzedawcy 427185. To nie jest EAN.

Fixture zawiera jedynie publiczny wiersz/tabelę koszyka i nazwę wybranego oddziału, bez cookies, identyfikatorów sesji i danych klienta. Cztery nowe testy importują rzeczywisty parser; trzy testy wykazały błąd przed zmianą. Osobno poprawiono konstrukcję kontrolowanej zmiany sumy w teście: natywny HTML zawiera `<strong>`, więc pierwotna podmiana bez tego tagu niczego nie zmieniała. Kontrolowane mutacje nie są obserwacjami cen rynkowych.

## Weryfikacja kandydatów produktów

- Adamex: https://eadamex.pl/narozniki-i-listwy-do-styropianu/29826-naroznik-z-siatka-alu-25m-7-7cm-zolty-budmat-5900308102411.html — dokładny GTIN 5900308102411, natywnie stan 0, `allow_oosp:0`, brak przycisku kupna; tylko kontakt z konsultantem.
- BMB: https://bmbtechnologie.pl/produkt/naroznik-aluminiowy-z-siatka-7x7-25-mb.html — ten sam GTIN, produkt 12865, niedostępny, brak kupna.
- Realbud: trop GTIN 5902114832438 / SKU 56654 z wyników wyszukiwania nie istnieje już w bieżącym API produktu 6595 (404), a natywne wyszukiwanie sklepu zwróciło 0 produktów. Nie importowano starej ceny.
- Sewera: Profigips 34×34 mm / 2,5 m kod 427185, 5,73 PLN/szt. i 50×50 mm / 2,5 m kod 399955, 4,43 PLN/szt. mają widoczne karty i zdjęcia, ale wymagają potwierdzenia zapasu i transportu danego oddziału. Nie dodano ich jako czynnych zamienników tynków gipsowych.

Ważne ustalenie techniczne: [deklaracja producenta SMT 09/2023](https://profigips.com/wp-content/uploads/2023/04/DWU-09_2023-Stalowe-narozniki-do-tynkow_SMT.pdf) rekomenduje stalowe profile wyłącznie do tynków cementowo-wapiennych wewnątrz. Przeczytano skan strony deklaracji, ponieważ warstwa tekstowa PDF była pusta. Opis sklepu wspominający również gips nie rozszerza zastosowania określonego przez producenta. [Karta Profigips 34 mm](https://profigips.com/produkt/naroznik-do-mokrych-tynkow-34-mm/) potwierdza długości i typ SMT. Nie zastąpiono automatycznie profilu aluminiowego stalowym.

Osobny trop do gipsu: [Profigips PMT](https://profigips.com/produkt/naroznik-profigips-do-tynkow/), 6 mm / 2,5 lub 3 m. Bieżąca kategoria producenta [eBardo](https://ebardo.pl/pl/c/Naroznik-do-tynkow-mokrych-PCV/238) nie udostępniła produktów do kupienia. Dalsze poszukiwanie aktywnej oferty pozostaje otwarte.

## Stan odbioru

Cztery nowe regresje przechodzą po poprawce. Odbiór pełnych regresji, świeżych koszyków i wdrożenie pozostają do wykonania. Katalog i seed nie zostały rozszerzone ofertami niedostępnymi. Artefakty robocze: `G:/Projekty/asystent-remontu-work/wave199-20261102`.
