# Sewera: dostępność farby według oddziału i wycena dostawy (2026-10-29)

## Problem użytkownika

Karta farby Dulux EasyCare 9 l była aktywna w katalogu Sewera, lecz automatyczna wycena dostawy zwracała `product_unavailable`. Sklep domyślnie wybiera Katowice, gdzie w chwili sprawdzenia farby nie było. Użytkownik nie mógł zobaczyć ceny całego zamówienia mimo dostępności farby w innym oddziale.

## Potwierdzenie sklepu

- [Karta Sewera — Dulux EasyCare Nieskazitelna Biel 9 l](https://sklep.sewera.pl/farba-wewnetrzna-biala-easycare-nieskazitelna-biel-9l-mat-dulux-p21385): EAN `5904078198759`, identyfikator koszyka `12450`, cena brutto **279,89 zł**. W oddziale Tarnowskie Góry produkt był dostępny (9 szt.), a [zdjęcie WebP](https://sklep.sewera.pl/photo/346399/farba-wewnetrzna-biala-easycare-nieskazitelna-biel-9l-mat-dulux.webp) zwróciło HTTP 200 i `image/webp`.
- Odczyt oddziałów w tej samej anonimowej sesji wykazał: Katowice — farba 0, Atlas GTA 18 kg 107 szt.; Tarnowskie Góry — farba 9 szt., Atlas GTA 0. Sprawdzono wszystkie siedem oddziałów z listy sklepu; żaden nie miał obu tych produktów jednocześnie. Stan magazynowy może się zmienić.
- Anonimowy koszyk Sewera z oddziału Tarnowskie Góry dla testowego kodu `00-001`: farba **279,89 zł** + kurier DHL do 10 kg **30,90 zł** = **310,79 zł**. Natywna wycena ma podstawę `retailer_basket_postcode`, źródło `/zamowienie`, oddział i SHA-256 dowodu `f2cb52a4def569c4813e0b1c3ee79df7b01d1cc97944eb753e1e55f7fc97c4d2`. Nie podano danych klienta i nie złożono zamówienia.

## Zmiana

- Źródło farby ma zweryfikowane zdjęcie i oddział wysyłkowy Tarnowskie Góry. Anonimowy checkout dopuszcza ten konkretny oddział tylko dla dokładnie sprawdzonej tożsamości produktu i EAN.
- Koszyk farby z gładzią nadal zwraca brak potwierdzonej dostawy w Sewera. Nie zastępujemy braku stawki zerem i nie nazywamy niekompletnego koszyka najtańszym.

## Weryfikacja i wdrożenie

- Typecheck API/mobile PASS, ukierunkowane testy kart i checkoutu Sewera **14/14 PASS**, testy mobilne bieżącego repozytorium **366/366 PASS**, wspólny backend **1054/1054 PASS**. Test oddziału odrzuca zmianę EAN, adresu karty i wysyłkę z niepotwierdzonej lokalizacji.
- Świeży snapshot produkcji miał 257 obserwacji i 148 plików. Wdrożenie zmieniło tylko `src/services/remont-pricing.cjs`, zachowało pozostałe 147 plików. Po wdrożeniu 148/148 plików jest identycznych z przygotowaną paczką; SHA-256 modułu `c9332eafac7fd000cb8d729524ee96a744f3d096ea5b14507975123926a03a5c`.
- Railway deployment `98d09653-a31f-41c9-9435-4b9915c3758c` SUCCESS. Backend [PR 108](https://github.com/jakatora/przetargai/pull/108) scalony.
- Produkcyjne API dla samej farby, kod testowy `00-001`: wybrana Sewera `compared`, 0 brakujących produktów, **310,79 zł** z oddziału Tarnowskie Góry. Porównanie globalne wybiera tańsze Lobo **194,80 zł** (171,90 zł farba + 22,90 zł kurier, taryfa krajowa PL), `compared`, 0 braków. Przy farbie + gładzi wybrana Sewera nadal ma `needs_delivery_costs` i `product_unavailable`.

## Granice wyniku

Podane kwoty są z chwili odczytu i dotyczą testowego kodu `00-001`. Aplikacja ponownie pyta sklep o cenę i dostawę przy wycenie kodu użytkownika. Porównanie dotyczy dostępnych, potwierdzonych koszyków; nie gwarantuje minimum we wszystkich sklepach na rynku.
