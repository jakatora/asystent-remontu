# Punkty odbioru i wybór sklepu w okolicy

Stan 2026-10-26: produkcyjny katalog nadal **78/103 referencje z ofertą, 25 braków, 104 aktywne oferty, 35 sklepów i 20 integracji dostawy**. Ta zmiana rozwija wybór odbioru osobistego; nie podbija licznika produktów.

## Zmiana w aplikacji Expo

Wspólny komponent wyboru sklepu w projektach i koszyku remontu pokazuje 9 potwierdzonych adresów: 7 punktów Sewery, magazyn Folnet w Batorowie oraz Centrum Matbud w Poznaniu. Karty zawierają adres, telefon, opublikowane godziny, dokładny odnośnik mapy i źródłową stronę sklepu. Domyślnie widoczne trzy punkty, pozostałe po rozwinięciu. Wyszukiwanie miejscowości działa bez polskich znaków.

Dla pełnego kodu pocztowego aplikacja opcjonalnie ustala środek miejscowości i sortuje dostępne punkty wybranej sieci według orientacyjnej odległości w linii prostej. Wyraźnie opisuje tę podstawę; nie jest to trasa samochodowa, dokładne położenie użytkownika, koszt dojazdu ani potwierdzenie ceny/zapasu oddziału. Pole wyszukiwania placówek jest odróżnione od kodu wyceny dostawy.

Potwierdzone źródła adresów, telefonów, godzin i identyfikatorów miejsc:

- https://sklep.sewera.pl/miejsca-odbioru — Katowice, Chrzanów, Dąbrowa Górnicza, Gliwice, Oświęcim, Sosnowiec, Tarnowskie Góry. Współrzędne są środkami opublikowanych map, nie pomiarem wejścia.
- https://folnet.pl/pl/cms/odbior-osobisty-30.html — ul. Stefana Batorego 97, 62-081 Batorowo; wydawanie wcześniej zamówionych towarów po potwierdzeniu gotowości. Bez sprzedaży stacjonarnej. Godziny magazynu 7:00–20:00 i BOK 8:00–15:00 rozróżnione. Stary odnośnik mapy z tej strony prowadzi gdzie indziej: nie przypisano jego współrzędnych do obecnego magazynu i nie wyświetlamy dla niego wymyślonej odległości.
- https://centrummatbud.pl/contact — jeden punkt, Pokrzywno 21, 61-315 Poznań; bez sugerowania filii w mieście użytkownika. Nie wpisywano niepotwierdzonych godzin otwarcia.

Geokodowanie: https://api.zippopotam.us/ (dane GeoNames, https://www.geonames.org/). W UI klikalne przypisanie źródła. Nie jest to urzędowy ani kompletny wykaz Poczty Polskiej. Wymagane PL, zgodny kod i jedna jednoznaczna miejscowość z poprawnymi współrzędnymi. Dwa miejsca, błędny kod, obcy kraj, niefinitywne dane, błąd sieci/JSON lub brak kodu nie tworzą odległości. Adresy nadal dostępne. Zapytania bez cookies i danych klienta, limit 6 s, cache maksymalnie 64 pozycje z TTL 24 h; stare/anulowane odpowiedzi nie trafiają do nowego wyboru.

## Dowód rzeczywistego działania

- Rzeczywisty HTTP dostawcy: 00-001 → Warszawa, 40-001 → Katowice; CORS `*`. Kod 99-999 nie został zlokalizowany. Wyszukiwanie dotyczy wyłącznie wybranej sieci, nie wszystkich sklepów w kraju.
- UI Sewera/40-001: Katowice około 6 km, Sosnowiec około 7 km, Dąbrowa Górnicza około 19 km. Widoczne adresy, telefony i godziny. Koszt dostępnej części materiałów 540,63 zł opisany jako część zestawu, bez obietnicy ceny stacjonarnej lub pełnej sumy.
- UI nierozpoznanego kodu 99-999: komunikat o braku położenia, adresy/mapy nadal dostępne, bez starych odległości. Wpisanie „tarnowskie” ograniczyło listę do Nakielskiej 24 w Tarnowskich Górach; kod dostawy 00-001 pozostał bez zmian.
- Test mapy wykrył dwa wpisy pod Kościuszki 326, w tym stary zamknięty duplikat. Karty wykorzystują teraz dokładne identyfikatory miejsc z oficjalnych map sklepu. Przycisk z aplikacji otworzył właściwe SEWERA KATOWICE, Kościuszki 326, z witryną sklep.sewera.pl, zamiast wyszukiwania duplikatów. Dla Folnetu pozostaje wyszukiwanie pełnego prawidłowego adresu magazynu, bo brak potwierdzonego identyfikatora obecnego punktu.
- UI Folnet: Batorowo, Batorego 97, osobno godziny BOK, warunek zamówienia internetowego i brak sprzedaży na miejscu; bez przypisania odległości Katowic albo starego biura. Nie wykonywano połączeń telefonicznych ani zamówień.
- Po testach przywrócono pierwotne trzy prace, Standard, jedną posiadaną pozycję, 00-001 i porównanie wszystkich sklepów; 790,83 zł. Mapy testowe zamknięte; brak dodatkowych materiałów testowych. Dowód `outputs/pickup-original-basket-restored-20261026.txt`.
- **368 testów PASS, 0 skip**, mobile typecheck i kontrola chronionych 66 ID z negatywnymi mutacjami PASS. Nowe testy dotyczą danych punktów, błędnej/niejednoznacznej lokalizacji, starych odpowiedzi, awarii sieci i izolacji cache, a nie kopii obliczeń ceny.
- Bez zmian backendu, cen, seedów, migracji lub manifestów; nie wykonano nowego deployu Railway ani wydania iOS/Android. Cudzy WIP zachowany. Zmiana dostępna w uruchomionym lokalnie Expo.

Dowody w `C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/`: `work/catalog-wave21-research/{pickup-directory.log,postcode-live-proof.json}`, `work/pickup-wave21-{core-tests,mobile-typecheck}.log`; `outputs/pickup-{near-katowice,unknown-postcode,city-filter,folnet-collection-only,map-from-app}-20261026.txt` i `pickup-near-katowice-20261026.png`.

## Nowe badanie brakujących produktów

Kandydat Domo-Hurt: https://www.domo-hurt.pl/panele-podlogowe/krono-original/panele-podlogowe-dab-toledo-dab-credenza-k338-8mm-ac4-v-fuga — HTTP 200, J2Store 476, paczka 2,22 m², K338/AC4/8 mm/1285 × 192 mm, 9 desek, 99,90 zł brutto/paczka. Własny świeży anonimowy koszyk potwierdził jedną paczkę i 99,90 zł, wyraźnie bez kosztów wysyłki. Wyświetlane ogólne 60 zł kurier / od 190 zł paleta nie potwierdzają dostawy tego koszyka. Brak GTIN i jednoznacznego fabrycznego profilu BEC84-K338V na karcie; nie utożsamiono go automatycznie z EAN 5907555422774. Aktualna inna wersja K338 1288 × 195 mm / 2,26 m² też istnieje — nie mieszać. Dalszy krok: jednoznaczny profil/GTIN i natywny wybór dostawy, zanim oferta trafi do rankingu. Dowód `work/catalog-wave21-research/domo-cart-proof.json` i zapisane strony. Brak danych klienta, zgód lub zamówienia.

Allegro Invena 17495774241 zwróciło rzeczywiste HTTP 403; nie importowano ceny z indeksu. Stara karta Seno w sklep473140.shoparena.pl nie ma aktualnego produktu pod ID 351215 (API Not Found). Nati w LazienkiABC pozostaje archiwalne, Elazienki/Super Łazienki podają zapas 0. Te obserwacje nie są aktywnymi ofertami.

Pełny cel aktywny: nadal 25 referencji, szersze pokrycie cen i zdjęć, rzeczywiste wyceny dostaw Castorama/OBI oraz lokalne ceny i stany. Lista adresów i orientacyjna odległość nie zamykają tych wymagań.
