# Produkty bez wyceny, wybór sklepu i kod pocztowy

Stan katalogu sprawdzony na produkcyjnym `/api/remont/health` 2026-10-26: **75/103 produktów, 28 brakujących, 101 aktywnych ofert, 33 sklepy, 18 integracji dostawy**. Ta zmiana nie dodaje nowych zweryfikowanych ofert. Pełny cel pozostaje otwarty.

## Zmiana dostępna w lokalnej aplikacji Expo

Pozycja bez oferty pokazuje dokładną nazwę, zdjęcie, EAN i link do referencyjnej strony sklepu, jeżeli można jednoznacznie ustalić referencję. Dopasowanie wymaga zgodnej kategorii i jednostki oraz dokładnego kodu lub pełnej znormalizowanej nazwy. Brak, sprzeczne kody i niejednoznaczne dopasowania pozostają nierozpoznane. Pomocnicza karta nie dostarcza ceny, zapasu ani kosztu dostawy i nie zmienia kompletności koszyka.

Przyciski mają role i stany dostępności; długie etykiety mogą się zawijać.

Rzeczywisty test wykazał błędny wynik ogólnego wyszukiwania `LiderzyCen sklep punkt odbioru 00-001 Polska`: Google wskazał sklep odzieżowy w Tarnowskich Górach. Dlatego wyszukiwanie lokalne jest dostępne tylko dla potwierdzonych sieci Castorama, OBI, Bricoman, Mrówka i Sewera. Dla Folnet otwiera dokładny magazyn odbiorów w Batorowie, również bez kodu użytkownika. Inni sprzedawcy mają informację o konieczności potwierdzenia adresu bezpośrednio w sklepie. Nie podmieniamy adresu odbioru adresem biura firmy.

Dodano bezpośrednie linki do oficjalnych katalogów placówek:

- Castorama: https://www.castorama.pl/find-a-store
- OBI: https://www.obi.pl/stores
- Mrówka: https://mrowka.com.pl/sklepy-psb-mrowka
- Sewera: https://sklep.sewera.pl/miejsca-odbioru

Podstawa sieci Bricoman: https://www.bricoman.pl/regulamin-zakupow.html. Folnet: https://folnet.pl/Odbior-osobisty-ccms-pol-30.html. Linki mapy są wyszukiwaniem, nie potwierdzeniem lokalnego zapasu, ceny, odległości ani dostępności odbioru.

## Naprawiony rzeczywisty błąd adresu

Wcześniej usunięcie kodu zmieniało tylko lokalny tekst pola. Zmiana sklepu odmontowywała sekcję, a zapisany `00-001` wracał. Teraz opuszczenie pola zatwierdza zmianę lub usuwa niepełny/stary kod. Poprawny kod nadal uruchamia automatyczne sprawdzenie po 650 ms. Bieżąca wartość jest synchronizowana przed zapisem preferencji sklepu, a ponowny odczyt czeka na wcześniejsze zapisy. Użytkownik nie traci wpisywanych cyfr wskutek zapytania po każdej cyfrze.

W prawdziwym UI projektu `proj_mvocoxcs1z9wqksmw` sprawdzono: usunięcie `00-001` → zmiana na Folnet → ponowne wczytanie → pole nadal puste; szybkie wpisanie `30001` → wybór najtańszego zestawu → `30-001`. Następnie przywrócono pusty kod i brak filtra sklepu. Zapisane osiem pozycji zakupów i dobór drzwi zachowane.

Przycisk z aplikacji otworzył oficjalny lokalizator Castoramy z polem wyszukiwania. Poprawione wyszukiwanie Castorama/Warszawa zwróciło rzeczywiste placówki m.in. Głębocka 15a, Bartycka 26 i Grochowska 21. Nie włączano geolokalizacji urządzenia.

## Weryfikacja i ograniczenia

- **322 testy PASS, 0 pominięć**, w tym dokładne linkowanie wszystkich 103 referencji, odmowa błędnego wariantu i brak wymyślonej ceny.
- Typecheck mobile i kontrola chronionych ID z mutacjami negatywnymi.
- Wspólny koszyk po zmianie: te same trzy prace, jedna posiadana pozycja, kod `00-001`; **637,43 zł materiałów + 153,40 zł dostaw = 790,83 zł**. Pięć wycenionych pełnych kombinacji; interfejs nadal informuje o ograniczeniu wyszukiwania i niewycenionych alternatywach.
- Dowody w katalogu czatu `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/`: `work/catalog-wave15-core-tests.log`, `outputs/kod-pocztowy-i-karty-weryfikacja-20261026.txt`, `outputs/mapy-castorama-warszawa-20261026.txt`, `outputs/produkty-bez-wyceny-zdjecia-linki-20261026.png`.
- Bez zmian backendu, wdrożenia Railway, migracji ani nowego wydania Android/iOS. Obcy WIP zachowany.

Przegląd ścieżki pieniędzy: kwoty nadal pochodzą z API w groszach; brakująca oferta nie staje się zerową ceną. Preferencje adresu są przypisane do projektu. Dowodem działania są powyższe rzeczywiste testy UI i wycena z produkcyjnego HTTPS, obok testów logiki.

## Dalsze badanie brakujących produktów

Wyszukiwania natywne 28 EAN w pięciu sklepach nie dały nowej oferty możliwej do zakupu: LiderzyCen zwrócił pięć zgodnych, lecz `can_buy=false`; Realbud, Rab-Dom, Zino i Plus-Market nie zwróciły zgodnych kodów. Budmat UD27 w Centrobud i IzoSystems nie ma potwierdzonego dokładnego GTIN. MyBudio używa tego samego kodu przy innym producencie i długości, więc nie jest zgodną ofertą.

Nowy kandydat Sewera: https://sklep.sewera.pl/profil-sufitowy-przyscienny-ud-27-l-3m-gr-0-5mm-budmat-p11764 — rzeczywiste HTTP 200, 7,68 zł brutto za sztukę, 3 m, 0,5 mm, Budmat, ID 11764, lecz bez kodu EAN w danych karty. Nie powiązano go automatycznie z `5907738940163`; wymagane dalsze potwierdzenie identyfikacji. Plik `work/catalog-wave15-research/sewera-ud27.html`.

Knauf potwierdza MP75 25 kg, numer 00179035, EAN 5902367206352: https://knauf.com/pl-PL/p/produkt/knauf-mp-75-10256_0120. Kandydat https://www.leroymerlin.pl/produkty/tynk-gipsowy-maszynowy-mp-75-25kg-knauf-85097036.html zwrócił rzeczywiste HTTP 403; cena z wyszukiwarki nie została zaimportowana. MP75 L ma inny kod i zużycie. Nati w LazienkiABC jest archiwalne, a Elazienki i Super Łazienki podają zapas 0; tych cen również nie dodano do rankingu.

Następne prace obejmują 28 nieuzupełnionych referencji, rzeczywiste lokalne stany i ceny, dostawy Castorama/OBI, zgodny dobór ogólnych materiałów w kalkulatorach oraz ręczne pozycje i częściowe zapasy we wspólnym koszyku.
