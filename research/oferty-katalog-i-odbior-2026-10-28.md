# Aktualne oferty i potwierdzanie odbioru — 28.10.2026

Przywrócono 27 istniejących ofert po ponownej kontroli dokładnego EAN, ceny brutto pełnego opakowania i możliwości zakupu. Katalog ma obecnie **159/166 pozycji z aktywną ofertą**, **204 aktywne oferty w 48 sklepach/kanałach sprzedaży**. Nie dodawano nowych SKU, źródeł ani zdjęć; wszystkie 166 referencji ma już przypisane zdjęcie (167 wpisów).

Kontrola objęła 21 ofert na platformie Castoramy (w tym osobno sprzedawcę Corksystem) i 6 ofert Leroy Merlin. Ceny wszystkich 27 pozostały takie same jak w poprzednich obserwacjach tych samych sprzedawców, więc nie powstaje komunikat o podwyżce lub obniżce. Zapisano nowe rzeczywiste terminy sprawdzenia; weryfikacja przeglądarkowa wygasa po 24 godzinach. Nieudany automatyczny odczyt nadal nie odnawia terminu.

## Pełne opakowania i dostawa

- [Arilla 2,5 m²](https://www.castorama.pl/panele-podlogowe-winylowe-goodhome-spc-arilla-dark-grey-2-5-m2/5059340969756_CAPL.prd): 132,45 zł/paczkę. Zapotrzebowanie 2,51 m² wymaga 2 paczek za 264,90 zł. Cena 52,98 zł/m² nie jest ceną paczki.
- [Taśma papierowa Norgips 75 m](https://www.leroymerlin.pl/produkty/tasma-papierowa-50mm-75-mb-norgips-43912694.html): 54,99 zł/rolkę. Dane z karty zestawiono z aktualną pozycją w anonimowym koszyku Leroy Merlin.
- Produkty sprzedawcy Corksystem zachowują oddzielny koszyk i warunki dostawy. Baner Castoramy nie wyznacza opłaty tego sprzedawcy.
- HTTP na produkcji potwierdził ceny materiałów kompletu 20 produktów Castoramy (3391,97 zł) i 6 produktów Leroy Merlin (203,44 zł). Są to zestawy kontrolne katalogu, nie zalecenie zakupu wszystkich tych materiałów do jednego remontu. Bez potwierdzonego transportu aplikacja nie pokazuje ich jako kompletnej wyceny z dostawą.
- Test istniejącej receptury okna SWS + Tytan nadal zwraca dla 00-001: materiały 167,80 zł, dostawy Izosystems i Sewery 34,90 zł, razem 202,70 zł. To wybrany zakres naprawy przy potwierdzonym przygotowaniu i posiadanych materiałach pomocniczych, nie pełny montaż okna.

## Usunięty błąd odbioru osobistego

Test produkcyjny ujawnił, że internetowe ceny Castoramy mogły utworzyć zwycięski koszyk odbioru z transportem 0 zł bez wybranej placówki. Dla wszystkich 22 definicji własnych ofert internetowych Castoramy włączono istniejącą zasadę potwierdzania odbioru. Ceny nadal działają dla materiałów i zakupów z dostawą. Ranking odbioru wymaga potwierdzonej ceny i zapasu placówki.

UI pokazuje „Castorama: wybierz sklep do odbioru” oraz wyjaśnia potrzebę sprawdzenia ceny, zapasu i terminu. Nie przenosimy lokalnych zapasów widocznych na karcie produktu do zapasu krajowego. Zachowano oddzielne, wcześniej zweryfikowane oferty konkretnych punktów Bricomarché i reguły sprzedawców oferujących tylko wysyłkę.

## Pozostałe 7 referencji

| Produkt | Powód braku aktywnej dokładnej oferty |
|---|---|
| Profil Norgips UD30 0,6 mm, 3 m, EAN 5907651698905 | Karta Leroy 44604343 obecnie identyfikuje EAN 5907651691197. Oferta starego EAN nie została odnowiona ani automatycznie zastąpiona. |
| Cersanit Facile 50, EAN 5907720650025 | Brak potwierdzonej aktywnej polskiej oferty dokładnego SKU. |
| Kronospan Toledo AC4 2,22 m², EAN 5907555422774 | Brak potwierdzonej aktywnej oferty. |
| Diall PE 20 m², EAN 5059340141428 | Brak potwierdzonej aktywnej oferty. |
| Paradyż Petro Grey 60×60, gatunek 2, EAN 5904584161544 | Dawna karta neoCeramik przekierowuje na nieistniejącą stronę; stare wyniki wyszukiwarki nie potwierdzają sprzedaży. |
| Paradyż Nati Bianco Struktura 25×40, EAN 5902610507960 | eLazienki: 89,86 zł za paczkę 1,2 m², stan magazynowy 0, realizacja na zamówienie. Nie traktujemy BackOrder jako dostępności magazynowej. „Kurier od 129 zł” nie jest wyceną całego koszyka. |
| Archi 80 białe, EAN 5903917782364 | Brak potwierdzonej aktywnej oferty starego SKU; nowe drzwi OPP Archi mają inną tożsamość. |

## Weryfikacja i dalsza praca

699 testów koszyka/API, 1054 testy współdzielonego backendu, TypeScript aplikacji i API: PASS, bez pominiętych testów. Nowy test HTTP rozdziela dostawę i odbiór dla 12 produktów z rzeczywistych zapisanych kart. Istniejące testy opakowań zachowano w kanale internetowym zamiast przypisywać im niepotwierdzony odbiór.

Produkcja: 27 dokładnych ofert i 6 przypadków HTTP; kontrola 166 referencji oraz tych samych 65 map obmiarów. W tych obmiarach wyceniono 85/250 wymagań materiałowych (wcześniej 72), 11 kompletnych scenariuszy materiałowych. Pozostałe 165 wymagań obejmują 90 bez zapytania, 74 bez produktu i 1 bez oferty; nie są to dodatkowe unikalne SKU ani procent ukończenia aplikacji.

Przeglądarka: sprawdzono komunikat Castoramy, brak pozornej pełnej kwoty odbioru i przywrócenie najtańszego zestawu z dostawą 202,70 zł. Edycję projektu QA anulowano; nie zmieniono obmiarów ani danych pozostałych projektów. Dowody sesji: `catalog-wave69-ui-pickup.txt`, `catalog-wave69-ui-final.txt`, `catalog-wave69-delivered-basket.jpg`.

Wdrożenia: PR [68](https://github.com/jakatora/przetargai/pull/68) odświeża tylko dane 27 ofert; PR [69](https://github.com/jakatora/przetargai/pull/69) poprawia odbiór. Oba scalone i wdrożone. Ostatnie wdrożenie Railway: `febfc0be-c3c2-4a22-992b-d71da4138084`, SUCCESS; wszystkie 148 plików zgodne ze sprawdzonym pakietem, 210 obserwacji zachowanych.

Dalej: rozwiązać 7 braków poprzez bieżące dokładne oferty lub jawny wybór właściwego następcy, uzupełnić wymagania receptur i pozyskać rzeczywiste wyceny dostaw oraz dane konkretnych placówek. Automatyczny transport Castoramy, OBI i Leroy Merlin pozostaje zależny od dostępu do ich integracji. Cały cel pozostaje aktywny.
