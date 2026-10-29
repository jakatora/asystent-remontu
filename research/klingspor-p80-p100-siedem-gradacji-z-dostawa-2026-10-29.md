# Klingspor P80 i P100: siedem gradacji w jednym koszyku

Data obserwacji: 2026-10-29. Kod `00-001` służy wyłącznie do testu dostawy zależnej od lokalizacji; aplikacja pobiera kod od własnego użytkownika.

## Dokładne produkty i zdjęcia

| Gradacja | Sklep i jednostka zakupu | EAN | Cena brutto | Dowód |
| --- | --- | --- | ---: | --- |
| P80 | [Sewera, jeden arkusz](https://sklep.sewera.pl/papier-scierny-gr-80-arkusz-230x280mm-p6906) | 5907560017637 | 1,94 zł | `25b32c434b8df09c9b49d2f7f11c53dd64a4295eca22ca245f011c438e735063` |
| P80 | [Matiw, paczka 50 arkuszy](https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P80-50szt/25767) | 5907560017637 | 42,00 zł | `9957682dc1eaf6649d1eb66f3440dd73c4b21bb528d0b3a21ca891f392933c12` |
| P100 | [Sewera, jeden arkusz](https://sklep.sewera.pl/papier-scierny-gr-100-arkusz-230x280mm-p6898) | 5907560023546 | 1,67 zł | `8c99a3b7529a06200cc446547e28f3b407152ee112388531f264b01d19d1ac7a` |
| P100 | [Matiw, paczka 50 arkuszy](https://matiw.pl/pl/p/Arkusz-papier-scierny-Klingspor-230x280mm-PL28C-P100-50szt/25768) | 5907560023546 | 36,00 zł | `030fd6ce9f823ebc9908fe6142c0ae314255b9fce0edd6af1e886cc15479f097` |

Wszystkie cztery natywne odczyty API zwróciły `in_stock`; obserwacje zapisano w `deploy/shared-backend/verified-offers.json` z czasem i SHA surowych odpowiedzi. Matiw potwierdza natywne ID `25767`/`25768`, kody `000615`/`000618`, jednostkę `szt.` oraz opis `50szt`. `szt.` oznacza tu jedną paczkę. Walidator wiąże te pola z dokładnym EAN, nazwą, producentem i rozmiarem opakowania.

Zdjęcia [P80](https://sklep.sewera.pl/photo/56987/papier-scierny-gr-80-arkusz-230x280mm.webp) i [P100](https://sklep.sewera.pl/photo/56969/papier-scierny-gr-100-arkusz-230x280mm.webp) z kart Sewery zwróciły HTTP 200 WebP i zostały obejrzane. Matiw pokazuje tę samą ogólną grafikę paczki przy wielu gradacjach, a URL P80 wskazuje nawet nazwę P40. Dlatego aplikacja używa fotografii z kart dokładnych EAN Sewery; gradację i wielkość paczki rozpoznaje z tekstu oferty, nie z miniatury.

## Cały zestaw z natywną dostawą

Dla P80, P100, P120, P150, P180, P220 i P240 lokalny serwer wyceny z prawdziwymi anonimowymi koszykami sklepów zwrócił:

| Potrzeba | Najtańszy potwierdzony zestaw | Materiały | Dostawa | Razem | Status |
| --- | --- | ---: | ---: | ---: | --- |
| Po 1 arkuszu z każdej gradacji | Sewera | 11,65 zł | 19,90 zł | **31,55 zł** | `compared`, braków 0 |
| Po 50 arkuszy z każdej gradacji | Matiw | 260,24 zł | 19,00 zł | **279,24 zł** | `compared`, braków 0 |

Każdy zestaw ma jeden sklep i jedną dostawę. Sewera zwróciła wycenę dla `00-001`, Matiw stawkę krajową `PL`. Nie jest to gwarancja ceny dla innych kodów ani minimum całego rynku.

## Weryfikacja

API i mobile typecheck PASS. Test tożsamości opakowań i rankingu 3/3 PASS, wszystkie testy mobilne 370/370 PASS, kontrola historycznych ID PASS. Cztery nowe adresy produktów i dwa zdjęcia zostały sprawdzone bezpośrednio. Szeroki walidator wszystkich historycznych linków uruchomiono, lecz przerwano po wykryciu wcześniejszych błędów 404 w niepowiązanych źródłach; nie jest podstawą do stwierdzenia, że wszystkie linki katalogu działają.
