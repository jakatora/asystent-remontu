# Ceresit CT17 — jawny dobór opakowań i koszt remontu, wave175, 2026-11-01

## Wynik

Użytkownik może osobno włączyć dobór kanistrów Ceresit CT17 PROFI 5/10 l oraz Transparent 5/10 l. Domyślnie zostają zapisane produkty i pojemności. Rodziny nie są zamienne. Zapotrzebowanie pozostaje w litrach, zapas dokładnego SKU jest odliczany przed doborem. Wybory projektów i wspólnego koszyka mają osobne ustawienia.

## Tożsamość produktów

Tabela producenta (strona 4): https://dm.henkel-dam.com/is/content/henkel/Cennik-Henkel-ACB-17-03-2025. Dokument służy wyłącznie potwierdzeniu produktu, litrów i GTIN; nie jest źródłem bieżących cen. PROFI: 5900089617050 / 5900089617081; Transparent: 5900089218653 / 5900089218677. Bieżące ceny i transport pochodzą z konkretnych kart i anonimowych koszyków sklepów.

## Rzeczywiste porównania z dostawą

Kod testowy 30-001; taryfa Buduj24 potwierdzona krajowo dla PL, Sewera dla kodu. Trzy dodatkowe pozycje, po 6 l każda: 287,06 zł ze stałymi opakowaniami oraz 234,62 zł przy doborze, różnica 52,44 zł. Dostawa zestawu 15,00 zł.

Pełny remont: trzy zachowane formularze (malowanie 35 m², podłoga 20 m²/Oakland, hydroizolacja 17 m²) i powyższe dodatki: 2531,42 zł → 2478,98 zł. Materiały 2162,08 zł, dostawy 316,90 zł. Z 13 linii wejściowych powstaje 12 skonsolidowanych wymagań (rodzinę Transparent łączymy w 12 l). Wybrany koszyk obejmuje 13 różnych SKU, ponieważ Transparent wymaga zarówno kanistra 5 l, jak i 10 l. Licznik API productCount dotyczy wymagań, nie liczby różnych zakupionych GTIN.

Wynik jest najtańszym potwierdzonym planem w ograniczonym przeszukiwaniu, bez gwarancji globalnego minimum. Ostrzeżenia o niepotwierdzonych alternatywach pozostają. W lokalnej próbie zimnego koszyka 74 plany dały 2485,75 zł; 132 plany w rozgrzanym porównaniu dały 2478,98 zł. Pojedyncze rzeczywiste odświeżenie UI potwierdziło niższy wynik. Nie zmieniono stawek ani oczekiwanej kwoty, nie ukryto quote_limit/searchLimited.

## Weryfikacja

- mobile-tests.log: 528 PASS, 0 FAIL, 0 SKIP.
- pricing-tests.log: 194 PASS, 0 FAIL, 0 SKIP.
- api-lib-tests.log: 90 PASS, 0 FAIL, 0 SKIP.
- adapter-regression.log: 121 PASS, 0 FAIL, 0 SKIP.
- shared-tests.log: 1064 PASS, 0 FAIL, 0 SKIP.
- Typy mobile/API, build pricing i 66 legacy ID: PASS. Zestawy testów częściowo się pokrywają, nie sumować ich jako unikalnych.
- Historyczna surowa grupa API/test miała 28 błędów na bazie wave174; nie uruchamiano jej tutaj ponownie i nie deklarujemy pełnej zielonej surowej grupy.
- Przeglądarka lokalna: 16 scenariuszy Ceresit i 3 regresje Mapei. Publiczna: 16 + 3. Osobno 6 lokalnych i 6 publicznych rzeczywistych porównań. Brak błędów strony/HTTP429 w pozytywnych scenariuszach.
- Spacja/strzałki, potwierdzony zapis, błąd zapisu bez nowej wyceny, uszkodzony rekord wstrzymujący HTTP, jawne odzyskiwanie z archiwum, realny SQLite/eksport/import/reload, 320/390 px, kopia linków i suma, cały remont, zapas 1 l odjęty raz i izolacja projektu/koszyka.
- Pierwsza asercja kopii używała nieistniejącego pola offer.productUrl zamiast publicznego url — poprawiono wyłącznie verifier. Testowa pozycja SQLite z null estimated_price została prawidłowo odrzucona; poprawiono fixture na wymagane 0. Izolowany test zapasu wybiera malowanie i hydro; panel Toledo z osobną kontrolą ilości pozostaje poza tym scenariuszem. Lokalne 16 przypadków składa się z 14 zachowanych i 2 wznowionych na tym samym buildzie; continuedFrom wskazuje wcześniejsze dowody.

## Wdrożenie i integralność

Źródło aplikacji cdd24fc7aa57228751368cd8901b93dcfd95e01c. PR 160: https://github.com/jakatora/przetargai/pull/160, scalony 80608b88e10e3d7b22bec33f05928d3ca7e3ad54.

API db7b0f4e-6c65-4a56-ad55-00cb36a8744f; WWW 07ada0b7-46e0-4c48-b697-f8e081ea8e4a. Końcowe statusy Railway odczytane oddzielnie.

Backend: 150 plików, zmieniony tylko src/services/remont-pricing.cjs; 149 zachowanych. Wszystkie 345 obserwacji i trasa remontu zachowane. SHA-256 modułu 22d57fe39a1fd15222c9ab6f363cbe3e3894e4932d75e2448fada7a4390fe5b7. Powdrożeniowy snapshot zgodny.

WWW: 63 zasoby sprawdzone SHA lokalnie i publicznie; skan 76 wartości vaulta bez wycieku, PL/WASM/COOP/COEP/no-referrer, 9 tras 200 + 5 kontroli 404, niepodpisany relay 401. Siedem plików serwera i konfiguracji WWW identycznych z wave174.

## Katalog i dalsza praca

Katalog 239 referencji, 206 potwierdzonych, 306 ofert; braków 33. W tej turze nie dodano nowych SKU, zdjęć ani sklepów. Audyt tożsamości: zero fałszywych i pominiętych potwierdzeń.

Nadal otwarte: braki katalogu i dostaw Castorama/OBI, skuteczność ograniczonego porównania przy zimnych koszykach, badania klientów i pomiar dojścia do zakupów. Cel rozwoju pozostaje ACTIVE. Nie aktywowano płatności, analityki, afiliacji ani nowych kont. Brak zmian 66 ID, migracji 001–014 i zależności; obcy WIP nietknięty. Eksperyment 170 nadal HOLD.

Dowody: G:/Projekty/asystent-remontu-work/wave175-20261101.
