# Budshop24: Atlas Cerplast 15 kg z wyceną dostawy dla kodu pocztowego

Data weryfikacji: 2026-10-29. Kwoty są migawką; oferta i koszyk są ponownie pobierane przed porównaniem.

## Dokładny produkt

- [Karta Budshop24](https://budshop24.pl/produkt/cerplast-podkladowa-masa-tynkarska-15kg-baza-biala-atlas/) i jej publiczny WooCommerce Store API `/wp-json/wc/store/v1/products/4808` podają: Atlas Cerplast, baza biała, 15 kg, ID 4808, SKU `BS00215`, 139,00 zł brutto, stan 1 szt., zdjęcie JPEG (HTTP 200). API nie publikuje EAN.
- [Oferta tego samego sprzedawcy na Allegro](https://allegro.pl/produkt/atlas-podkladowa-masa-tynkarska-cerplast-15-kg-819f3488-d980-4f3c-9643-2b523e4e8ba1) łączy wariant „15 kg (baza biała)” z EAN `5905400530032`. Niezależnie ten EAN publikuje [Ekobud](https://ekobudsklep.pl/Tynki/3323-srodek-gruntujacy-podklad-tynkarski-cerplast-15kg-atlas-5905400530032.html). Aplikacja wiąże kod sklepu z tym EAN wyłącznie dla sprawdzonego białego wariantu 15 kg; nie przenosi kodu na 5, 10 ani 25 kg.

## Natywny koszyk

Anonimowe WooCommerce Store API sklepu dla jednej sztuki i `00-001` (2026-10-29 13:15 UTC): materiały 139,00 zł, kurier „DHL – Średnia Paczka” 18,99 zł, łącznie 157,99 zł brutto. Zwrotne dane koszyka potwierdziły identyfikator, SKU, nazwę, ilość, cenę, walutę PLN, brak rabatu i dodatkowych opłat, kod pocztowy, usługę kurierską oraz metodę przedpłaty Przelewy24. Osobne wybranie kuriera zachowało sumę 157,99 zł. Nie podano danych klienta, nie akceptowano regulaminu i nie składano zamówienia. [Warunki dostawy Budshop24](https://budshop24.pl/dostawy/) są informacją pomocniczą; cena w rankingu pochodzi z koszyka, a nie ze stawki „od”.

W tym samym dniu [Adamex](https://eadamex.pl/grunty-uniwersalne/14763-masa-podkladowa-atlas-cerplast-15kg-5905400530032.html) pokazał 138,90 zł za produkt, ale na etapie zamówienia wymaga e-maila, imienia, nazwiska, telefonu i pełnego adresu przed wyborem dostawy. [Ekobud](https://ekobudsklep.pl/content/1-dostawa) publikuje 21 zł za paczkę do 30 kg, lecz zastrzega ostateczny koszt i ewentualną opłatę za paletę w potwierdzeniu pro forma. Żadnej z tych dwóch cen nie dołączono do potwierdzonego rankingu dostawy.

## Zabezpieczenia i kontrola

Adapter dopuszcza jeden dokładny produkt `4808`, jedną anonimową sesję koszyka, kod pocztowy i konkretną usługę DHL. Sprawdza każdy grosz ceny produktu i koszyka, brak backorderu, stan jednej sztuki, zgodność zdjęcia oraz bezpieczne trasy HTTP. Zmiana ceny, przewoźnika, opakowania, SKU, kodu, waluty, liczby sztuk lub sumy kończy się brakiem potwierdzenia zamiast błędnie taniego wyniku. Replay fixture pochodzi z żywych odpowiedzi sklepu, a testy obejmują także odrzucenie ścieżki checkout. Testy aplikacji: 906/906 bez pominięć; kontrole typów API i mobile przeszły. Dodatkowo wykonano żywy odczyt adaptera z `readRetailSource` i `quoteBudshop` (13900 + 1899 = 15799 gr).
