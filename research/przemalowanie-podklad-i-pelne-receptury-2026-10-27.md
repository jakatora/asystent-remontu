# Przemalowanie: podkład, osłony i rzeczywiste pokrycie receptur — 2026-10-27

## Pełniejszy zakres braków

Przed zmianą katalog zawierał 112 referencji, 106 z ofertą i 6 historycznych braków. Ten wskaźnik nie opisywał kompletności całej aplikacji. Audyt objął **66 zarejestrowanych prac**, z czego **65 miało niepusty materiałowy scenariusz testowy**. Przy syntetycznych, zapisanych obmiarach i poziomie Standard serwer wycenił **46 z 226 wierszy**. Pozostało 180 wierszy bez wyceny, w 173 unikalnych zapytaniach; są wśród nich brakujące produkty, niepodłączone istniejące referencje, jednostki do korekty i ilości do ustalenia. Nie jest to liczba unikalnych produktów do dokupienia ani audyt wszystkich wariantów wymiarów i poziomów.

Po tej zmianie próba ma **51 wycenionych z 227 wierszy**, 176 bez wyceny i 4 w pełni wycenione scenariusze materiałowe. Szczegóły i obmiary: `recipe-coverage-2026-10-27.json`. Nie deklarować kompletności aplikacji na podstawie 107/113 referencji katalogu. Pełny cel nadal wymaga wszystkich potrzebnych materiałów, porównań całych koszyków i sklepów, rzeczywistej dostawy, pobliskiego odbioru, cen i stanów lokalnych oraz użytecznego interfejsu.

## Działające zestawy i ilości

W przemalowaniu „grunt kryjący” był opisany jako penetrujący Dragon, a żadna z trzech pozycji nie była połączona z cenami. Wprowadzono odrębny podkład **Śnieżka Grunt, biała lateksowa emulsja podkładowa 5 l, EAN5903973000235**. Receptura, wszystkie poziomy cenowe i API zachowują ten typ produktu. Farba nawierzchniowa, podkład, taśma i folia tworzą cztery rozpoznawane pozycje. Model Standard farby to Śnieżka Barwy Natury 173 biały/Majowa Konwalia; inne poziomy jawnie zmieniają referencję.

Podkład ma jedną warstwę i własną wydajność, niezależną od liczby warstw i wydajności farby. Producent podaje do10m²/l, karta sklepu9; jawne założenie9m²/l +5% zapasu daje dla10m² **1,1667l**, zaokrąglane do pełnego wiadra dopiero w wspólnym koszyku. Można wybrać brak potrzeby/posiadanie podkładu, liczbę rolek50m i opakowań folii4×5m; zera są jawną decyzją. Ułamkowe lub błędne ilości pozostają nieznane. Wymaganie nie udaje darmowej pozycji.

Taśma nadal liczy się w rolkach w przepisie, a wycena dostaje metry. Konwersja50m jest ograniczona do znanej referencji, jednostki i opisanej długości; nieznana długość nie jest zgadywana. Stare JSON-y zachowują swoje3rolki/150m i dotychczasowy raw podkładu1,3l. Starszy projekt bez decyzji o folii ma „ilość do ustalenia”, nie automatyczny zakup lub zero. Odczyty nie przepisują bazy ani użytkownikowych wierszy zakupowych.

Grunt do sufitu otrzymał brakującą referencję Knauf Universalgrund5l oraz własne zużycie, wcześniej błędnie współdzielone z wydajnością farby. Jawne0,15l/m² to założenie z karty dla ściany; użytkownik ma sprawdzić chłonność sufitu próbą i etykietą. Dla40m² to6l, dwa opakowania5l; zmiana liczby warstw/wydajności farby nie zmienia gruntu. Historyczny zbyt mały zapas „Mam” nie usuwa skorygowanej ilości. Odrębny wybór pozwala pominąć niepotrzebny/posiadany grunt.

## Produkty, zdjęcie i transport

Rzeczywiste strony/API z2026-10-27: Sewera56,10zł, Rab-Dom59,90zł za ten sam pełny podkład5l. Natywne koszyki i produkcyjny HTTPS potwierdzają **Sewera56,10+19,90=76,00zł**, **Rab-Dom59,90+10,50=70,40zł** dla próby00-001. Droższy produkt jest tańszy po dostawie. Nie użyto teaserów „od” ani zer placeholderów. Powiązaną kartę Sewery8105 odrzucono — to PPG/EAN5904000016748, mimo rekomendacji podobnego produktu. Poprawna karta Śnieżki6153 ma EAN5903973000235.

Dodano jedną referencję, dwie obserwacje i dokładne zdjęcie; stary porządek tablic zachowany. Folia Blue Dolphin: świeży odczyt7,90zł zastąpił zapis8,45zł, o55gr mniej. Pozostałe135 poprzednich obserwacji zachowane. Łącznie138obserwacji,136aktywnych ofert,107/113referencji z ofertą,38sklepów. To ceny internetowe, nie potwierdzone ceny stanów oddziałów.

Rzeczywisty bundle, produkcja oraz projekt UI: materiały do przemalowania10m² **177,22+23,90=201,12zł**, jeden koszyk Sewery, InPost do30kg dla00-001. Dwie prace: **322,24zł**, nadal jedno wiadro podkładu5l, razem2,3334l zapotrzebowania. Sufit40m²: **150,94zł w odbiorze**, bez dojazdu i potwierdzenia stanu placówki. Stary projekt z nieznaną folią ma1brak i best:null.

Połączenie nowego przemalowania z3pierwotnymi pracami daje13poprawnie rozpoznanych wierszy i **867,22zł z dostawą**, wobec osobnych790,83+201,12=991,95zł. Różnica **124,73zł** wynika ze wspólnych opakowań i zamówień. Serwer potwierdził ilości i ich pokrycie, nie pominął materiałów. UI ma osobną, węższą oszczędność98,50zł wynikającą z samych opakowań; poprawiono etykietę na „Oszczędność na opakowaniach materiałów: … (bez dostawy)” wPL/EN, aby nie mylić podstaw porównania. Pełne867,22 i nowa etykieta przetrwały ponowne otwarcie widoku. Wyniki są najtańszymi z potwierdzonych wariantów objętych ograniczonym porównaniem; Castorama/OBI i inne niepotwierdzone kombinacje mogą zmienić minimum.

## UI i walidacja

Utworzono tylko własny projekt QA **Test kompletu — przemalowanie10m²,podkład i osłony**, ID `proj_mvpyf61w91cjewt7h`. Poprzednie9projektów zachowano. Pełny kreator zapisuje10m²,2warstwy,wydajność8,podkład włączony/9m²/l,1rolkę i1folię,Standard,Zrobięsam. Zakupy mają4materiały i4narzędzia, wszystkie0z8niekupione. Materiały wstępnie174,49zł, narzędzia oddzielnie; brak wyceny narzędzi nie jest pełnym kosztem całej realizacji. Porównanie sklepów ma rzeczywiste201,12zł.

Próba1,5rolki ujawniła zatrzymanie formularza bez komunikatu: pole było opcjonalne, a niewypełnione inne opcjonalne domyślne pola ukrywały globalny błąd. UI korzysta teraz z tych samych błędów parseMeasurements, podświetla właściwe pole i pokazuje wymaganie liczby całkowitej oraz alert także przy domyślnych wartościach. Test w prawdziwym formularzu potwierdził komunikat. Przejście po poprawieniu do1 działa. Fast Refresh po edycji formularza wrócił do kroku1, zachowując draft; nie restartowano Expo.

511testów core/kalkulator/pricing/API PASS0skip, w tym7nowych testów produkcyjnych funkcji;1054testy wspólnego backendu PASS0skip, typecheck API/mobile,66chronionychID i negatywne mutacje,diffPASS. Początkowy import umieścił nowe źródła na początku, co wykryło5regresji starszych fixture'ów; zachowano poprzednią kolejność i dopisano wpisy. Testy nie zostały osłabione. Pierwszy typecheck wskazał nieistniejący typ inputu decimal i mutowanie readonly w fixture'ach; poprawiono typ coverage i konstrukcję historycznych kopii, nie typy aplikacji. Pierwsze wywołanie starego wrappera testowego nadpisało log42; jego błędny przebieg43 przeniesiono do `catalog-wave43-first-core-tests.log`. Oryginalny wynik42 pozostaje w zapisie narzędzi/pamięci, nie podrobiono jego logu.

Ścieżka pieniędzy: dokładna tożsamość, faktyczne brutto i grosze, niezależne ilości, pełne opakowania i kompletne wyceny dostaw. Nieznane ilości/fracht nigdy nie są zerem w pełnej sumie. Brak płatnego AI, zamówień, zgód regulaminowych i ruchów pieniędzy. Dowód: rzeczywiste anonimizowane koszyki sklepów, gotowy bundle, produkcyjny HTTPS i zapisany projekt UI.

## Wydanie i dalsze prace

Backend: świeża migawka148plików SHA256`536c311683349be0cdb8cf381c2dfcb6cf099f4e643c2b9465028b9667794051`; brak dryftu2026-10-27T00:37:32.790Z. Tylko bundle i obserwacje remontu, pozostałe146plików bez zmian; manifesty i migracje zachowane. Source`a04528bc5920dad28b489a27b0ed272f6aabda8c`, [PR43](https://github.com/jakatora/przetargai/pull/43) scalony/przypięty, merge`11ea611e81c2d60233ed50feb71da2210083b37b`. Railway`93bf5456-f2ab-4f6a-b56e-28675739c171` SUCCESS2026-10-27T00:39:12.297Z. Brak checks/statuses CI, nie zieloneCI. Anonimowy auth/me401 po wdrożeniu.

Dowody w katalogu czatu: `work/catalog-wave43-{recipe-audit,local,production,collector,photos,predeploy-baseline,legacy-mutation}-proof.json` (audyt przed to `catalog-wave43-recipe-audit.json`), `core/shared-tests.log`, strony i oryginalne API w `catalog-wave43-research/`. UI `outputs/catalog43-{wizard-fraction-rejected,shopping,repaint-shipping}-20261027.txt`, `catalog43-repaint-products-20261027.png`.

Następne priorytety wynikają z całych receptur: pozostałe176wierszy bez wyceny, poprawne systemy i akcesoria, starsze nieznane decyzje, narzędzia, 6historycznychmodeli, Castorama/OBI/ABUD transport, lokalne ceny/stany i łatwość obsługi. Nie zawężać pełnego celu do nowej referencji, 6braków, testów lub działającego jednego koszyka.

Źródła: [Śnieżka Grunt i wydajność](https://www.sniezka.pl/produkt/sniezka-grunt/), [Śnieżka173 i przygotowanie](https://www.sniezka.pl/produkt/sniezka-barwy-natury/173-majowa-konwalia), [Sewera podkład5l](https://sklep.sewera.pl/sniezka-grunt-5l-p6153), [Rab-Dom ten sam5l](https://www.rabdom.pl/pl/p/Sniezka-Grunt-biala-farba-podkladowa-5l/97), [Knauf produkt](https://knauf.com/pl-PL/p/produkt/knauf-universalgrund-22064_0120), [Knauf karta i0,15l/m²](https://knauf.com/api/download-center/v1/assets/3ed7306f-27be-4d9d-a14d-388477a68c24?country=pl&download=true), [folia](https://sklep.sewera.pl/folia-malarska-gruba-4x5m-cfep2004932-blue-dolphin-p21034).
