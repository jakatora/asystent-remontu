# Budshop24: Woder Duo 16 kg i wspólny koszyk z Cerplastem

Data obserwacji: 2026-10-29. Kwoty są migawką; adapter pobiera cenę, dostępność i koszt transportu ponownie przed porównaniem. Kod testowy `00-001` nie jest kodem użytkownika aplikacji.

## Tożsamość produktu

- [Karta Budshop24](https://budshop24.pl/produkt/atlas-woder-duo-16kg-hydroizolacja-dwuskladnikowa/) i własne WooCommerce Store API sklepu pokazują Atlas Woder Duo 16 kg, ID `7381`, SKU `BS00293`, 249,00 zł brutto, 3 sztuki w magazynie i [zdjęcie JPEG](https://budshop24.pl/wp-content/uploads/2025/08/2044418.jpg) (HTTP 200). API zwraca w nazwie encję HTML `&#8211;`, natomiast aplikacja wyświetla zwykły łącznik. Kontrola adaptera wiąże oba dokładne zapisy z jedną recenzowaną kartą; nie przyjmie wariantu 32 kg.
- [Grupa PSB](https://www.grupapsb.com.pl/produkt/hydroizolacja-dwuskladnikowa-elastyczna-woder-duo-16-kg-atlas-5905400195088.html) potwierdza EAN `5905400195088`, markę i opakowanie 16 kg. Ten sam EAN ma już w katalogu oferta Sewery. EAN nie pochodzi z API Budshop24, dlatego jawnie opieramy go na dwóch niezależnych kartach dokładnego wariantu.

## Jedna wycena transportu dla całego zestawu

Żywe anonimowe koszyki WooCommerce do `00-001` z 2026-10-29 13:39–13:40 UTC:

| Koszyk | Produkty | Dostawa | Razem |
| --- | ---: | ---: | ---: |
| Woder Duo 16 kg | 249,00 zł | DHL Duża Paczka 24,99 zł | 273,99 zł |
| Cerplast 15 kg + Woder Duo 16 kg | 388,00 zł | Średnia Paczka + Duża Paczka 43,98 zł | 431,98 zł |

Wspólny koszyk składa się z jednego zamówienia sklepowego i dwóch paczek w jednej wycenie. Cena 43,98 zł pochodzi z `cart/update-customer` dla podanego kodu oraz `cart/select-shipping-rate`; suma po wyborze transportu pozostała 431,98 zł. Metoda płatności Przelewy24 jest dostępna. Nie podano danych klienta, nie zaakceptowano warunków, nie złożono ani nie opłacono zamówienia. [Zasady dostawy sklepu](https://budshop24.pl/dostawy/) wyjaśniają, że kwota zależy od koszyka; aplikacja nie zastępuje jej stałą stawką.

Adapter ogranicza trasy do dwóch recenzowanych identyfikatorów produktów oraz trzech sprawdzonych wariantów dostawy, weryfikuje cenę brutto każdej pozycji, brak rabatu i opłat dodatkowych, ilości, kod pocztowy, wybraną metodę i sumę. Niespójność wyklucza koszyk z potwierdzonego rankingu. Test HTTP dwóch prac remontowych potwierdził połączenie ich w jeden koszyk Budshop24 i jedną wycenę dostawy. Testy aplikacji 911/911, bez błędów i pominięć; kontrola typów API oraz mobile przeszła. Żywa próba adaptera zakończyła się wynikiem 38800 + 4398 = 43198 gr, `destinationScope=postal_code`.
