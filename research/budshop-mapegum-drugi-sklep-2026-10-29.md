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

Przy dwóch opakowaniach sklep oferował również paczkomat za 19,99 zł. Adapter porównuje wyłącznie wybraną dostawę pod adres; nie zastępuje nią kuriera. Czteroproduktowy koszyk miał także droższą półpaletę 175,00 zł. Kwoty pochodzą z `cart/update-customer` dla kodu oraz `cart/select-shipping-rate`, z kontrolą cen brutto każdej linii, ilości, rabatów, podatków, stawki i końcowego totalu. Nie podano danych osobowych i nie wykonano checkoutu.

## Rozszerzenie wyceny wielu paczek, 2026-10-29 14:33 UTC

Pierwsze wdrożenie rozpoznawało tylko siedem wpisanych na stałe układów paczek. W rzeczywistym koszyku z dwoma średnimi i jedną dużą paczką sklep pokazał kuriera, a aplikacja błędnie zwracała `no_home_delivery`. Reguła wyznacza teraz identyfikator i etykietę kuriera z liczby opakowań i akceptuje stawkę tylko wtedy, gdy dokładnie pasuje do natywnej odpowiedzi sklepu. Limit to 32 paczki; przy innej metodzie lub etykiecie wycena pozostaje niepotwierdzona.

| Natywny koszyk dla `00-001` | Materiały | Kurier | Razem |
| --- | ---: | ---: | ---: |
| Cerplast + Woder Duo + Mapegum, 2 średnie + 1 duża | 636,99 zł | 62,97 zł | 699,96 zł |
| Cerplast + Woder E + Mapegum, 2 średnie + 1 duża | 712,99 zł | 62,97 zł | 775,96 zł |
| 3 × Mapegum, 3 średnie | 746,97 zł | 56,97 zł | 803,94 zł |
| 3 × Woder Duo, 3 duże | 747,00 zł | 74,97 zł | 821,97 zł |
| Mapegum + Woder Duo + 2 × Woder E, 1 średnia + 3 duże | 1 147,99 zł | 93,96 zł | 1 241,95 zł |

Testy odmowy obejmują etykietę innej usługi, zmienioną metodę, zmieniony total, półpaletę, paczkomat i próbę checkoutu.

## Weryfikacja

Żywa próba adaptera 2026-10-29 14:21 UTC potwierdziła cztery produkty i jedną wycenę: `96199 + 8796 = 104995` gr, `retailer_basket_postcode`, `destinationScope=postal_code`. Test HTTP projektu scala cztery prace w ten koszyk. Testy sprawdzają sześć odpowiedzi natywnych koszyków oraz odmowę przy zmianie ceny, sumy, wyborze paczkomatu i próbie checkoutu. Testy aplikacji: **919/919 PASS**, bez pominięć; API i mobile typecheck PASS.

W produkcji po pierwszym wdrożeniu: 248 obserwacji, 242 aktywne oferty, 180 produktów. Dla samego Mapegum i testowego `00-001` Budshop24 kosztuje 267,98 zł z dostawą, WinBud 221,47 zł; WinBud jest tańszy o **46,51 zł**. Dla zestawu czterech produktów Budshop24 wycenia 1 049,95 zł. Porównanie wszystkich sklepów wskazało najtańszy **potwierdzony** podział Sewera + WinBud za 899,17 zł, ale zgłosiło `needs_delivery_costs`, bo inna wycena Sewery przekroczyła czas odpowiedzi, a siedmiowariantowy adapter Budshop odrzucał istniejący układ. Wyniku nie należy przedstawiać jako bezwarunkowo najtańszego zestawu. Ponowny pomiar po poprawce opisano poniżej.

## Produkcja po poprawce

App commit `393b643` na gałęzi `codex/remont-zakupy-20261024`, backend [PR 99](https://github.com/jakatora/przetargai/pull/99), merge `bb5004c89fe2a37ee154885400c4a04daba3695a`, Railway deployment `c7e493fa-0165-4f49-80f5-7b47f16c63c5` zakończony `SUCCESS` 2026-10-29. Po wdrożeniu porównano 148/148 plików produkcji z przygotowaną paczką. Zachowano wszystkie 248 wcześniejszych obserwacji i 147 plików poza modułem wyceny.

Rzeczywisty HTTP produkcyjny, kod testowy `00-001`:

- Cerplast + Woder Duo + Mapegum, tylko Budshop24: 636,99 zł materiałów + 62,97 zł dostawy = **699,96 zł**. `status=compared`, `missing=0`, `basis=retailer_basket_postcode`, bez niedostępnych sklepów.
- Ten sam pełny zestaw, wszystkie sklepy: **602,27 zł** z dostawą, Sewera 380,80 zł i WinBud 221,47 zł. `status=compared`, `missing=0`, bez niedostępnych sklepów. WinBud podał stawkę krajową (`destinationScope=PL`), Sewera stawkę dla kodu.
- 3 × Mapegum w Budshop24: 746,97 zł + 56,97 zł = **803,94 zł**; 3 × Woder Duo: 747,00 zł + 74,97 zł = **821,97 zł**. Obie wyceny mają `status=compared`.

Testy aplikacji po zmianie: **921/921 PASS**, bez pominięć. Testy wspólnego serwera: **1054/1054 PASS**, bez pominięć; mobile i API typecheck PASS. W UI alternatywne zestawy można rozwinąć do listy produktów ze zdjęciami, ilościami i kosztami linii, łączami do sklepów oraz kosztami kuriera dla każdego sklepu. Jeśli zestaw wymaga kilku osobnych zamówień, widok pokazuje ich podział. Przejście przez kreator i ekran „Gdzie najtaniej” sprawdzono w przeglądarce dla przykładowej łazienki; ta konfiguracja miała trzy niewycenione pozycje, więc pełnego porównania na tym ekranie nie potwierdzono. Backend potwierdzono rzeczywistym HTTP.
