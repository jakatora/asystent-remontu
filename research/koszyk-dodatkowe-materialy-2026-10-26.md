# Dodatkowe materiały we wspólnym koszyku

2026-10-26. Katalog sklepów nadal obejmuje 75/103 referencji, 101 aktywnych ofert, 33 sklepy i 18 automatycznych integracji dostawy. Pozostało 28 referencji. Ta zmiana rozwija wspólny koszyk i nie zwiększa licznika potwierdzonych ofert.

## Zachowanie aplikacji

Użytkownik może dodać do koszyka produkt z istniejącego katalogu 103 referencji albo własną pozycję. Wyszukiwanie działa po nazwie bez polskich znaków, marce lub EAN. Karty katalogu mają rzeczywiste zdjęcia i podają zawartość opakowania. Nie pokazują starej referencyjnej ceny jako bieżącej oferty.

Ilość oznacza fizyczne zapotrzebowanie w podanej jednostce, np. 375 ml, 2,5 kg lub 12 m². Backend łączy dodatkowe zapotrzebowanie z wybranymi pracami i dopiero wtedy dobiera pełne opakowania oraz dostawę. Można edytować lub usunąć każdą dodatkową pozycję. Koszyk działa również bez zaznaczania prac, wyłącznie z dodatkowymi materiałami. Zapis jest lokalny, osobny od istniejących projektów; bez migracji bazy.

Dodatkowe materiały są trwale zapisywane. Odczyt uszkodzonego zapisu lub nieznanej referencji wstrzymuje pełną wycenę zamiast po cichu usuwać pozycje. Nieudany zapis pokazuje komunikat. Do 50 dodatkowych pozycji; dodatnie, skończone ilości do 100 000, maksymalnie sześć cyfr po przecinku w formularzu.

Uwzględniono także materiały dopisane w Zakupach wybranych prac: rzeczywiste `customQuantity` ma pierwszeństwo przed `quantity`; narzędzia, rzeczy posiadane lub kupione oraz dane innego projektu nie wchodzą do zapotrzebowania. Brak poprawnej ilości staje się jawną pozycją „ilość do ustalenia”. Ceny użytkownika nie stają się ofertami sklepów.

## Ważna weryfikacja z rzeczywistym API

Pierwszy test ujawnił, że API nie wyszukuje samej nazwy z pustą kategorią (`reason: no-query`). Naprawa uzupełnia EAN/kategorię wyłącznie dla jednej dokładnej pełnej nazwy katalogowej w zgodnej jednostce. Nie ma przybliżonego dobierania produktu, zamiany litrów na mililitry ani podmiany pojemności. Inna jednostka, ogólna nazwa i brak ilości pozostają nierozpoznane.

Rzeczywiste produkcyjne HTTPS, z wybranym Folnet i kodem 00-001:

| Przypadek | Wynik |
| --- | --- |
| 375 ml z pracy + 375 ml dopisane z katalogu | 750 ml łącznie, jedna puszka 750 ml |
| Cena jednej puszki + kurier | 39,30 + 13,99 = **53,29 zł** |
| Ten sam produkt dopisany w Zakupach, `quantity=200`, `customQuantity=750`, `customPrice=1` | Potrzeba 750 ml; rzeczywista oferta z dostawą **53,29 zł** |
| Edycja dodatkowej pozycji do 751 ml | Dwie puszki, 78,60 + 13,99 = **92,59 zł** |
| Dodanie nieznanego materiału 2,5 kg | Jedna brakująca oferta, status `partial`, pełny koszyk `best=null` |

To potwierdza sumowanie przed zaokrąglaniem, wycenę rzeczywistego całego zamówienia i oddzielenie wpisanej ceny od ofert.

## Weryfikacja w aplikacji

W prawdziwym widoku `/renovation-basket` tymczasowo odznaczono pierwotne trzy prace. Dodanie Soudal 375 ml pokazało jedną puszkę i 53,29 zł. Własny materiał 2,5 kg pozostał widoczny, a aplikacja przestała podawać sumę całego zestawu. Po odświeżeniu obie pozycje i ilości pozostały zapisane. Edycja Soudal do 751 ml i usunięcie nieznanej pozycji dały dwie puszki i 92,59 zł.

Następnie usunięto obie własne pozycje testowe i przywrócono pierwotne trzy prace, jedną posiadaną pozycję, poziom Standard, brak filtra sklepu i kod 00-001. Pierwotna wycena nadal wynosi **790,83 zł = 637,43 zł materiałów + 153,40 zł dostaw**. Projekty testowe nie zostały dołączone.

**328 testów PASS, zero pominięć**, typecheck mobile i weryfikacja chronionych ID z mutacjami negatywnymi. Nie zmieniano backendu, migracji, definicji prac ani cudzych plików WIP. Frontend sprawdzony lokalnie Expo; bez nowego wydania Android/iOS.

Dowody w `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/`:

- `work/basket-extras-production-proof-20261026.json` i skrypt `verify-basket-extras-production-20261026.cjs`;
- `work/basket-extras-core-tests-20261026.log`, `work/basket-extras-typecheck-20261026.log`;
- `outputs/koszyk-dodatkowe-brak-oferty-20261026.txt`, `koszyk-dodatkowe-po-odswiezeniu-20261026.txt`, `koszyk-dodatkowe-edycja-751ml-20261026.txt`;
- `outputs/koszyk-dodatkowe-materialy-20261026.png`.

## Dalsze oferty

Nowy kandydat producenta: https://kronosfera.pl/k/listwa-przypodlogowa-lk100f24-9002,2068 — HTTP 200, native Product/Offer, SKU LK100F24-9002, KronoOriginal, 2400 × 100 × 14 mm, 31,99 zł brutto/szt., bez GTIN. Nie podpięto go automatycznie pod referencyjny EAN 5907555424969. Wymaga potwierdzenia relacji SKU i prawdziwego koszyka.

https://www.bricomarche.pl/tasma-brzegowa-5-mm-x-100-mm-x-50-m zwrócił HTTP 403. https://klink.pl/umywalka-cersanit-facile-50.html zwrócił HTTP 200, ale `OutOfStock` / archiwum; jego pole GTIN zawiera błędnie lokalny SKU zamiast kodu. Nie dodano tych cen do porównania. Dowody: `work/catalog-wave16-research/proof.json` i zapisane pierwotne HTML.

Cel nadal aktywny: 28 brakujących referencji, dostępność i ceny lokalne, dostawy Castorama/OBI, dalszy dobór zgodnych produktów w kalkulatorach i częściowo posiadane ilości. Dodana obsługa własnych materiałów nie zastępuje uzupełnienia ofert sklepów.
