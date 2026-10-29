# Budshop24: Atlas Woder E 15 kg i pełny koszyk remontu

Data sprawdzenia: 2026-10-29 13:58–14:03 UTC. Kwoty są migawką. Adapter ponownie sprawdza cenę, stan magazynowy i wycenę dostawy przed porównaniem. `00-001` jest kodem testowym, nie domyślnym kodem użytkownika.

## Produkt i zdjęcie

- [Budshop24](https://budshop24.pl/produkt/szybkoschnaca-folia-w-plynie-woder-e-15kg-atlas/) udostępnia w swoim Store API produkt `6484`, SKU `BS00295`, Atlas Woder E 15 kg, 325,00 zł brutto, 5 sztuk dostępnych i [zdjęcie PNG](https://budshop24.pl/wp-content/uploads/2025/08/2047356.png) (HTTP 200, `image/png`). Karta API używa encji `&#8211;`; adapter sprawdza dokładnie zapis karty i koszyka, a w aplikacji pokazuje czytelny łącznik.
- [Remontownia24](https://remontownia24.pl/atlas-woder-e-szybkoschnaca-folia-w-plynie-15-kg%2C61%2C2509.html) i [PSB Mrówka](https://mrowka.com.pl/produkt/folia-w-plynie-woder-e-szybkoschnaca-15-kg-atlas-5905400514506.html) potwierdzają EAN `5905400514506` dla opakowania 15 kg. Ten EAN łączy nową ofertę Budshop24 z produktem już obecnym w katalogu Sewery.
- Starszy wynik wyszukiwarki pokazywał 299,99 zł; cena w żywym API sklepu wynosiła 325,00 zł. Nie oznaczamy tego jako zmiany ceny w aplikacji, bo nie było wcześniejszej obserwacji tej oferty.

## Dostawa całego koszyka do kodu `00-001`

Kwoty po wyborze krajowej dostawy pod adres w anonimowym koszyku WooCommerce:

| Zestaw | Produkty | Dostawa | Razem |
| --- | ---: | ---: | ---: |
| Woder E 15 kg | 325,00 zł | DHL Duża Paczka 24,99 zł | 349,99 zł |
| Cerplast 15 kg + Woder E 15 kg | 464,00 zł | Średnia + Duża Paczka 43,98 zł | 507,98 zł |
| Woder Duo 16 kg + Woder E 15 kg | 574,00 zł | 2 × Duża Paczka 49,98 zł | 623,98 zł |
| Cerplast + Woder Duo + Woder E | 713,00 zł | Średnia + 2 × Duża Paczka 68,97 zł | 781,97 zł |
| 2 × Woder E | 650,00 zł | 2 × Duża Paczka 49,98 zł | 699,98 zł |
| Cerplast + 2 × Woder E | 789,00 zł | Średnia + 2 × Duża Paczka 68,97 zł | 857,97 zł |

Zewnętrzny koszyk wycenia także paczkomat za 19,99 zł dla pojedynczego Woder E. Adapter używa stawki doręczenia pod adres; nie miesza odbioru w paczkomacie z dostawą domową. Sprawdza dokładne ilości i ceny brutto każdej linii, koszty i podatki transportu, brak kuponów/dodatkowych opłat, kod pocztowy, metodę oraz końcową sumę. Dopuszcza tylko pięć sprawdzonych wariantów paczek; przy innym układzie zwraca brak potwierdzonej dostawy. Nie przesyła danych osobowych ani nie składa zamówienia.

## Weryfikacja

Żywa próba adaptera 2026-10-29 14:03 UTC potwierdziła trzy produkty i jedną dostawę: `71300 + 6897 = 78197` gr, `retailer_basket_postcode`, `destinationScope=postal_code`. Testy odpowiedzi sklepu obejmują 7 układów koszyka, ilości 2 sztuk, zmiany ceny, niespójne sumy, nieznaną stawkę i zablokowany checkout. Test HTTP projektu łączy trzy prace w jeden koszyk. Pełny zestaw testów aplikacji: **915/915 PASS**, zero pominięć; API i mobile typecheck PASS.

Stan wdrożenia i produkcyjny wynik porównania: do uzupełnienia po publikacji.
