# Sewera: rzeczywisty zapas oddziału i koszyk — W199, 2026-11-02

## Wykryty problem i zmiana

Anonimowy koszyk Sewery przyjął jedną listwę Profigips 34×34 mm / 2,5 m, pokazał prawidłową cenę 5,73 PLN i sumę, lecz w wybranym oddziale Katowice zgłosił brak towaru. Pole ilości miało `max="0,0000"`, a wiersz `basket-no-product` zawierał „Towar nie może zostać zamówiony - brak w magazynie!”. Karta bez wybrania tego oddziału pokazywała 37 sztuk.

Dotychczas `confirmSeweraBasket` rozpoznawał tylko komunikat o częściowym niedoborze „W magazynie znajdują się jedynie ...”. Pełny brak przechodził kontrolę, po czym `/zamowienie` przekierowywało do strony głównej, bez formularza dostawy. To nie dowodziło darmowego transportu ani możliwości zakupu.

Poprawka sprawdza także rzeczywisty limit ilości w potwierdzonym wierszu oraz jawny komunikat pełnego braku. Zero jest brakiem zapasu; nie jest kosztem dostawy. Zwracany jest dotychczasowy błąd `insufficient_stock` z `maxPackages:0`. Istniejący adapter wiąże ten limit z ofertą, oddziałem, ilością, ceną i kodem pocztowym. Kontrola całej sumy nadal następuje przed przekazaniem niedoborów. Sprzeczne komunikaty, nieprawidłowe limity, inne SKU, kwoty lub oddział wymagają ponownego sprawdzenia; nie otrzymują potwierdzonej wyceny.

Źródło rzeczywistego koszyka: https://sklep.sewera.pl/naroznik-do-mokrych-tynkow-34x34mm-2-5m-profigips-p16477 , kod sprzedawcy 427185. To nie jest EAN.

Fixture zawiera jedynie publiczny wiersz/tabelę koszyka i nazwę wybranego oddziału, bez cookies, identyfikatorów sesji i danych klienta. Cztery nowe testy importują rzeczywisty parser; trzy testy wykazały błąd przed zmianą. Osobno poprawiono konstrukcję kontrolowanej zmiany sumy w teście: natywny HTML zawiera `<strong>`, więc pierwotna podmiana bez tego tagu niczego nie zmieniała. Kontrolowane mutacje nie są obserwacjami cen rynkowych.

## Weryfikacja kandydatów produktów

- Adamex: https://eadamex.pl/narozniki-i-listwy-do-styropianu/29826-naroznik-z-siatka-alu-25m-7-7cm-zolty-budmat-5900308102411.html — dokładny GTIN 5900308102411, natywnie stan 0, `allow_oosp:0`, brak przycisku kupna; tylko kontakt z konsultantem.
- BMB: https://bmbtechnologie.pl/produkt/naroznik-aluminiowy-z-siatka-7x7-25-mb.html — ten sam GTIN, produkt 12865, niedostępny, brak kupna.
- Realbud: trop GTIN 5902114832438 / SKU 56654 z wyników wyszukiwania nie istnieje już w bieżącym API produktu 6595 (404), a natywne wyszukiwanie sklepu zwróciło 0 produktów. Nie importowano starej ceny.
- Sewera: Profigips 34×34 mm / 2,5 m kod 427185, 5,73 PLN/szt. i 50×50 mm / 2,5 m kod 399955, 4,43 PLN/szt. mają widoczne karty i zdjęcia, ale wymagają potwierdzenia zapasu i transportu danego oddziału. Nie dodano ich jako czynnych zamienników tynków gipsowych.

Ważne ustalenie techniczne: [deklaracja producenta SMT 09/2023](https://profigips.com/wp-content/uploads/2023/04/DWU-09_2023-Stalowe-narozniki-do-tynkow_SMT.pdf) rekomenduje stalowe profile wyłącznie do tynków cementowo-wapiennych wewnątrz. Przeczytano skan strony deklaracji, ponieważ warstwa tekstowa PDF była pusta. Opis sklepu wspominający również gips nie rozszerza zastosowania określonego przez producenta. [Karta Profigips 34 mm](https://profigips.com/produkt/naroznik-do-mokrych-tynkow-34-mm/) potwierdza długości i typ SMT. Nie zastąpiono automatycznie profilu aluminiowego stalowym.

Osobny trop do gipsu: [Profigips PMT](https://profigips.com/produkt/naroznik-profigips-do-tynkow/), 6 mm / 2,5 lub 3 m. Bieżąca kategoria producenta [eBardo](https://ebardo.pl/pl/c/Naroznik-do-tynkow-mokrych-PCV/238) nie udostępniła produktów do kupienia. Dalsze poszukiwanie aktywnej oferty pozostaje otwarte.

## Stan odbioru

Cztery nowe regresje przechodzą po poprawce. Zakończono opisany poniżej odbiór i wdrożenie. Katalog i seed nie zostały rozszerzone ofertami niedostępnymi. Artefakty: `G:/Projekty/asystent-remontu-work/wave199-20261102`.

## Wdrożenie i końcowe dowody

- Źródło aplikacji `93c263c9bba31083d166aaf0b4114c7d67c0e032` wypchnięte na `codex/remont-zakupy-20261024`.
- [PR współdzielonego backendu nr 179](https://github.com/jakatora/przetargai/pull/179), head `72b1db814ffe9b0945259cd3366221e8b193e4f3`, scalony jako `2b5e3a90a3150c464f4d1e94d02b30e5b46fcbc6`. Statusy GitHub były puste; to nie jest dowód zielonego CI.
- API Railway `1c4f4d40-2868-488b-8144-3881e968a3bb`: SUCCESS 2026-11-02T09:29:21.062Z. SHA256 bundle `242bdd5ee69e205212e4bbf4a03241a18e3b3af5d08b71fab8fefb5353de40a4`.
- Pobrane po wdrożeniu wszystkie 150 plików odpowiadają dokładnie przesłanej paczce. Zmieniono jeden bundle, zachowano pozostałe 149 plików i wszystkie 373 obserwacje seeda. Pierwszy lokalny weryfikator błędnie porównał paczkę z katalogiem testowym zawierającym dodatkowo testy, bazę testową i junction zależności. Poprawiono porównanie do rzeczywistych 150 plików uploadu; ponownie wykorzystano już poprawnie pobrany snapshot, bez ponownego wdrożenia.
- WWW pozostaje na źródle `4ad7867515dda6676b08279032ffc83009e34497` i dotychczasowym wdrożeniu. Sewera nie korzysta z relaya WWW, którego lista obejmuje ABUD, ChemiaDoParkietu25 i eTak. Zmiana nie wymagała nowego buildu interfejsu.
- Kontrole typów i 237 testów cen, 165 API-lib, 238 adapterów (w tym 11 dotychczasowych checkoutów i 4 nowe), 1064 współdzielonego backendu PASS, bez pominięć. Grupy częściowo się pokrywają. Całe mobile i pricing-service są identyczne ze sprawdzonym źródłem W198; nie przypisuje się tej zmianie nowego wydania Android/iOS.

Rzeczywiste ponowienie koszyków narożników o 09:18:24–27 UTC: zarówno kod 427185, jak i 399955 mają w Katowicach `maxPackages:0`; po poprawce kontrola kończy się potwierdzonym niedoborem, przed zapytaniem o dostawę. Osobne dostępne koszyki taśmy 30 mm × 50 m i folii 20 m² potwierdzono prawdziwym adapterem oraz publicznym API po wdrożeniu: po jednej sztuce / 30-001 = 22,62 + 19,90 = 42,52 PLN; dwie taśmy i folia / 00-001 = 37,34 + 19,90 = 57,24 PLN. To zakup wskazanych akcesoriów, nie cała receptura malowania.

Lokalnie i publicznie: po 7 rzeczywistych scenariuszy HTTP receptury tynkowania oraz po 18 scenariuszy UI / 8 rzeczywistych odpowiedzi API, 0 błędów strony i 0 odpowiedzi 429. Publiczne UI korzystało bezpośrednio z publicznego API. Obejrzano nowe publiczne zrzuty 320/390 px: pełna kwota i jawne niepełne porównanie zachowane. Nie jest to pełny audyt WCAG. Pełna receptura z czterema dodatnimi materiałami: 494,73 + 133,01 = 627,74 PLN. Dwie pełne prace wspólnie: 517,19 + 133,01 = 650,20 PLN; porównanie nadal niepełne ze względu na niepotwierdzony alternatywny transport Kowalczyk. Nie zerowano siatki i narożników, aby domknąć wynik.

Końcowy dowód `final-proof.json`: 2026-11-02T09:32:24.232Z. Ostatni widoczny pełny wynik miał oryginalne terminy wycen do 09:40:43–45 UTC. Późniejszy zakup wymaga odnowienia wycen; dat nie przedłużano w plikach. Historia przed/po: 370/370 obserwacji, wszystkie wcześniejsze zachowane, 13 531 → 13 831 punktów; zachowano 13 521 starych, dziesięć najstarszych usunięto zgodnie z limitem 60 na serię, bez innych strat. Nie tworzono fikcyjnych zmian cen.

Kontrola ścieżki pieniędzy obejmuje rzeczywistą cenę brutto i sumę całego koszyka, tożsamość SKU oraz oddziału, rzeczywiste ilości, rozróżnienie zerowego zapasu od zerowej dostawy, nieznane transporty i zachowanie historii. Dowodem są opisane rzeczywiste HTTP/UI i porównanie wdrożonych plików, oprócz testów jednostkowych.

## Dalsze prace

Próba domyślnego malowania w wariancie standard z rzeczywistego kalkulatora ujawniła dwa nadal nierozpoznane materiały: „Farba lateksowa Śnieżka Barwy Natury biała 5 l” i „Grunt uniwersalny Knauf 5 l”. Rzeczywiste żądanie i częściowy wynik zapisano w `local-paint-http.json`; nie uznano tej próby za poprawną pełną wycenę i nie obniżono wymagań testu. Taśma i folia pozostają rozpoznane. Następny priorytet: zweryfikować tożsamości, zastosowanie, jednostki i aktywne oferty tych domyślnych materiałów oraz umożliwić użytkownikowi świadomy dobór potwierdzonego zestawu. Nie aliasować innej farby ani 5 kg gruntu jako 5 l. Osobno pozostaje właściwy do gipsu profil narożnikowy sprzedawany na sztuki. Niedostępne Adamex/BMB oraz usunięty Realbud nie wymagają ponawiania bez nowej przesłanki.

Cel rozwoju pozostaje aktywny.
