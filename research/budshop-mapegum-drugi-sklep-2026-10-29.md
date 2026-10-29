# Mapegum WPS 10 kg: drugi sklep i dostawa całego koszyka

Data sprawdzenia: 2026-10-29 14:18–14:21 UTC. Kwoty są migawką. Adapter odczytuje cenę, zapas i wycenę transportu ponownie przy porównaniu. `00-001` to kod testowy, nie domyślny kod użytkownika.

## Tożsamość i zdjęcie

- [Budshop24](https://budshop24.pl/produkt/hydroizolacja-plynna-folia-mapei-mapegum-wps-10kg/) udostępnia własny produkt Woo Store API `6240`, SKU `BS02039`, **Mapei Mapegum WPS 10 kg**, 248,99 zł brutto, trzy opakowania dostępne i [fotografię JPEG](https://budshop24.pl/wp-content/uploads/2025/08/2046500.jpg) (HTTP 200, `image/jpeg`). Wcześniejszy indeks sklepu pokazywał 249,00 zł; do aplikacji zapisano bieżące 248,99 zł z API. Nie jest to zmiana ceny istniejącej oferty, ponieważ to jej pierwsza obserwacja w katalogu.
- [Katalog producenta Mapei](https://cdnmedia.mapei.com/docs/librariesprovider15/preislisten/produktkatalog_2026.pdf?sfvrsn=d545668b_9) wiąże Mapegum WPS, szare wiadro 10 kg, z EAN `8022452002120`. Ten EAN łączy ofertę Budshop24 z wcześniejszą kartą [WinBud](https://winbud24.pl/pl/p/Mapei-Mapegum-WPS-folia-w-plynie-10kg/419). Adapter nie miesza jej z wariantem 5 lub 20 kg.
- Budshop24 pokazuje również taśmę Mapeband W 10 mb, ale żywe API oznaczyło ją jako **brak w magazynie**. Nie włączono jej do aktywnego rankingu na podstawie starej strony indeksowej.

## Natywna wycena dostawy do `00-001`

Anonimowe koszyki WooCommerce po wybraniu dostawy pod adres:

| Zestaw | Materiały | Dostawa | Razem |
| --- | ---: | ---: | ---: |
| Mapegum WPS 10 kg | 248,99 zł | DHL Średnia Paczka 18,99 zł | 267,98 zł |
| Cerplast 15 kg + Mapegum WPS 10 kg | 387,99 zł | 2 × Średnia Paczka 37,98 zł | 425,97 zł |
| Woder Duo 16 kg + Mapegum WPS 10 kg | 497,99 zł | Średnia + Duża Paczka 43,98 zł | 541,97 zł |
| Woder E 15 kg + Mapegum WPS 10 kg | 573,99 zł | Średnia + Duża Paczka 43,98 zł | 617,97 zł |
| 2 × Mapegum WPS 10 kg | 497,98 zł | 2 × Średnia Paczka 37,98 zł | 535,96 zł |
| Cerplast + Woder Duo + Woder E + Mapegum WPS | 961,99 zł | 2 × Średnia + 2 × Duża Paczka 87,96 zł | 1 049,95 zł |

Przy dwóch opakowaniach sklep oferował również paczkomat za 19,99 zł. Adapter porównuje wyłącznie wybraną dostawę pod adres; nie zastępuje nią kuriera. Czteroproduktowy koszyk miał także droższą półpaletę 175,00 zł. Zakres akceptowanych stawek obejmuje tylko sprawdzone układy paczek; inne pozostają bez potwierdzonej wyceny. Kwoty pochodzą z `cart/update-customer` dla kodu oraz `cart/select-shipping-rate`, z kontrolą cen brutto każdej linii, ilości, rabatów, podatków, stawki i końcowego totalu. Nie podano danych osobowych i nie wykonano checkoutu.

## Weryfikacja

Żywa próba adaptera 2026-10-29 14:21 UTC potwierdziła cztery produkty i jedną wycenę: `96199 + 8796 = 104995` gr, `retailer_basket_postcode`, `destinationScope=postal_code`. Test HTTP projektu scala cztery prace w ten koszyk. Testy sprawdzają sześć odpowiedzi natywnych koszyków oraz odmowę przy zmianie ceny, sumy, wyborze paczkomatu i próbie checkoutu. Testy aplikacji: **919/919 PASS**, bez pominięć; API i mobile typecheck PASS.

Stan produkcji i wynik porównania obu sklepów: do uzupełnienia po wdrożeniu.
