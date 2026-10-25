# Bricomarché — badanie ceny i dostawy, 2026-10-25

Status katalogu pozostaje 73/103 produktów z potwierdzonymi ofertami, 30 brakujących. Poniższe badanie nie zwiększa licznika i nie jest działającą integracją automatycznej dostawy.

## Cena produktu i zakres sklepu

Główna karta: https://www.bricomarche.pl/gladz-pod-walek-gw-20-kg-kreisel

W rzeczywistym interfejsie oraz danych Product/Offer karty potwierdzono Kreisel GW180, EAN 5907418038791, 20 kg, 49,99 zł za opakowanie, SKU 000000001000162583. To cena całego wiadra, nie reklamowa cena kilograma.

Zdjęcie głównego produktu z DOM: https://api.bricomarche.pl/api/images/gallery_545_400/thumbnails/images/87/871549/gladz-pod-walek-gw-20-kg-kreisel-662748.png

Do zakupu wymagany jest wybór oddziału. Badano Bricomarché Poznań (Al. Solidarności), Al. Solidarności 47. Okno sklepów wskazywało dostępność w 44 z 236 sklepów i rozróżniało dostępność wysyłkową oraz lokalną. Nie wolno uogólniać stanu tego oddziału na całą sieć.

## Rzeczywisty koszyk i ograniczenie dowodu

Po przeliczeniu własnego anonimowego koszyka potwierdzono jedną paczkę za 49,99 zł. Formularz dostawy oferował odbiór osobisty 0 zł, Kurier XL 49,99 zł i firmę spedycyjną 199 zł. Wybrany Kurier XL dawał razem 99,98 zł. Koszyk z dwiema paczkami również był badany, następnie przywrócono jedną i przeliczono.

Kod 00-001 był kodem testowym, ale bez pozostałych danych adresowych formularz nie potwierdził obsługi tego kodu. Nie jest to dowód dostawy dla konkretnego kodu ani taryfa do zakodowania na stałe. Nie podano imienia, nazwiska, telefonu, e-maila ani adresu. Nie zaakceptowano regulaminu, nie kliknięto „Zamawiam z obowiązkiem zapłaty”, nie złożono zamówienia.

Na zakończenie 2026-10-25 usunięto wyłącznie własne testowe wiadro. Po zakończeniu ładowania interfejs potwierdził „Twój koszyk jest pusty”.

## Automatyczny odczyt nadal zablokowany

Zwykłe żądania HTTP z lokalnego środowiska i rzeczywistego serwera Railway zwróciły 403 dla obu kart produktów, /api/pos/list i /route-api/find. Publiczny plik aplikacji jest dostępny, ale to nie potwierdza dostępu do cen, stanów lub koszyka z backendu. Nie przenoszono ciasteczek ani tokenów sesji przeglądarki i nie obchodzono blokady.

Nowy adapter nie został dodany. Nie importowano ręcznie ceny jako automatycznie odświeżanej oferty. Stawki 49,99 zł nie podstawiono jako wyceny dla dowolnego kodu, ilości lub zestawu.

Dowody w katalogu czatu C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/: work/catalog-wave11-research/railway-api-proof.json i outputs/bricomarche-kreisel-jedna-paczka-dostawa-20261025.png. Publiczne skrypty i badania zapisano w work/catalog-wave11-research/.

## Pozostałe wskazówki

- https://www.bricomarche.pl/ksztaltownik-sufitowy-ud30-300-cm-srebrny — kandydat Budmat 3 m, EAN 5907738940163; wymaga odrębnej weryfikacji ceny i koszyka.
- https://www.bricomarche.pl/wezyk-w-oplocie-ze-stali-nierdzewnej-z-dluga-koncowka-3-8-x-m10-30-cm-gw-gz-invena — karta wskazuje EAN 5907798716258; brak nowego potwierdzenia ceny/koszyka.
- https://knauf.com/pl-PL/p/produkt/knauf-mp-75-10256_0120 — aktualna główna karta producenta potwierdza MP75, nr 00179035, EAN 5902367206352, worek 25 kg. To potwierdzenie tożsamości, nie nowa oferta sklepowa.
- work/shoper-search-coverage-wave11.json potwierdza, że wyszukiwanie znanego EAN działa w siedmiu wcześniej badanych sklepach. Nie powtarzać wszystkich brakujących wyszukiwań pod założeniem, że poprzedni endpoint był błędny.
