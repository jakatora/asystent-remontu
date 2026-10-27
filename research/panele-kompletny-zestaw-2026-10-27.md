# 2026-10-27 — zestaw do paneli i rzeczywiste koszyki sklepów

Katalog ma 146 referencji ze zdjęciami. Audyt produkcyjny z 2026-10-27T08:52:34.475Z: 122 produkty z ofertą, 160 aktywnych ofert, 24 referencje bez potwierdzonej oferty, 181 zarejestrowanych obserwacji, 2 wyłączone źródła i 19 wygasłych ręcznych potwierdzeń. Są 42 zarejestrowane sklepy, 39 z aktywnymi ofertami. To nie liczba wszystkich produktów na rynku ani procent ukończenia aplikacji.

## Nowe produkty i niezależne źródła

- Wolfcraft 6931000, EAN4006885693104: jeden zestaw zawiera dobijak, łyżkę i 20 klinów. [Producent](https://www.wolfcraft.com/products/wolfcraft/pl/EUR/p/P_6931), [niezależna karta Narzędziak](https://www.narzedziak.pl/wolfcraft-narzedzia-do-montazu-paneli-wf-6931.html), [Mensura](https://www.mensura.pl/zestaw-do-ukladania-paneli-wolfcraft-6931000). Natywne API Mensury: produkt17167, stock19590, SKUWF6931000, jednostka szt., cena brutto64,90zł. Nie użyto52,76zł netto. Zakup jednego zestawu nie oznacza zakupu22 zestawów. Fotografia pochodzi z tej samej karty.
- Arbiton Izo Floor Tape 50mm×25m, EAN5905167698778: [producent](https://arbiton.com/pl/podklad-pod-panele/akcesoria/tasma), [niezależna karta OBI](https://www.obi.pl/p/5869029/arbiton-tasma-aluminiowa-izo-floor-50-mm-x-25-mb), [LiderzyCen](https://liderzycen.pl/pl/p/Tasma-aluminiowa-do-laczenia-podkladow-Arbiton-Izo-Floor-Tape-25-m/31334). Natywne API: produkt31334, stock31422, SKUctma_5905167698778, jedna rolka25m, brutto12,33zł. Nie użyto10,02zł netto. Nie zastępujemy taśmą malarską ani nie deklarujemy pełnej hydroizolacji.

## Ilości i dobór

Model laminate-supplies-v1 zachowuje istniejące identyfikatory prac i pomiarów. Użytkownik podaje liczbę zestawów, długość dodatkowej taśmy i liczbę profili oraz potwierdza ich dopasowanie i posiadanie odpowiednich mocowań. Brak danych pozostaje nieznaną ilością; nie przyjmujemy jednego profilu/zestawu na dowolny remont.

Istniejący profil Cezar40mm×1m, EAN5904584845215: [producent](https://cezar.eu/products/listwa-progowa-owalna-aluminiowa-szeroka-40mm-cezar-srebrny-mat-1m), [Castorama](https://www.castorama.pl/departments/profil-progowy-cezar-40mm-srebrny-1m-aluminiowy-1-szt-/5904584845215_CAPL.prd). Nie zakładamy mocowań w komplecie ani ich zgodności z każdym podłożem. Jeśli trzeba je dopiero dobrać, osobny brak blokuje pełną wycenę.

Jawny wybór Arbiton Secura Thermo Aquastop Smart3w1 usuwa drugą folię; [katalog producenta2025](https://arbiton.com/content/uploads/ARBITON-underlayments-2025.pdf), s.33. Nie podajemy sprzecznych wartości SD z innych kart. Dodatkową taśmę po docinkach użytkownik mierzy osobno. Dostawa z Kronodomu dla tego wariantu nadal nie ma automatycznej integracji. Wariant Volden z osobną folią jest badany niezależnie.

Zestaw jest wielokrotnego użytku: użytkownik może wpisać1 przy jednej pracy i0 przy kolejnych wykonywanych tymi samymi narzędziami. Oddzielne ekipy mogą potrzebować więcej. Długości taśmy sumują się przed doborem całych rolek. Nie dublujemy trzech narzędzi zawartych w zestawie; piła i miara pozostają osobno. Historyczne obliczenia wymagają przeglądu. Nowe wymagane wiersze dopisywane są idempotentnie, bez regenerowania SQLite i bez zmiany migracji001–014.

## Dowód dostawy i ograniczenie produkcyjne

Lokalny serwer z identycznym wdrażanym modułem, rzeczywiste anonimowe koszyki, kod00-001 jako przykład QA: 10m², Oakland11m²→5paczek, Volden11m²→2opakowania, Conpar1rolka, profil1szt., zestaw1, taśma7m→1rolka. Materiały686,85zł + dostawa652,97zł =1339,82zł. Dwie prace po5m² z jednym wspólnym zestawem, dwoma profilami i14m taśmy:706,40+652,97=1359,37zł. LiderzyCen zwrócił600,00zł transportu całego koszyka; nie zastąpiono go reklamową stawką pojedynczego produktu. Nie jest to gwarancja najniższej ceny na całym rynku.

Produkcja po wdrożeniu rozpoznaje wszystkie6 produktów. Zestaw Mensury ma potwierdzone64,90+13,99GLS=78,89zł. Jednak pełna wycena podłogi NIE przeszła: połączenie z Folnetem z Railway kończy się UND_ERR_CONNECT_TIMEOUT po około10,5s, również w oddzielnej diagnostyce świeżego procesu. Dlatego API zwraca best=null i quote_unavailable, a UI pokazuje sklep wymagający potwierdzenia. Lokalny wynik nie jest przedstawiany jako dostępna produkcyjna suma. Wybór samej Mensury pokazuje1/6 produktów i5braków, bez fałszywej pełnej sumy.

Backend: [PR52](https://github.com/jakatora/przetargai/pull/52), head2f60f0c010214dc97ee8caa2a97d0457dc2d2129, merge b28f56c2929525bdcd164967bb173f546548c534. Railway be96bc47-8dfc-4342-9700-25890a23f317 SUCCESS. Wszystkie148 plików produkcyjnych odpowiadają sprawdzonemu wydaniu; zmieniono tylko moduł Remont i seed, zachowano179 obserwacji i146 pozostałych plików. Uwierzytelnianie pozostałych aplikacji bez zmian.

## Walidacja i dalsza praca

601 testów kalkulatora/API,4 rzeczywistej SQLite i1054 współdzielonego backendu PASS,0skip. Typecheck mobile iAPI PASS, legacy66 oraz negatywne mutacje PASS. Rejestr laminatu jest jednorodny, bez nowych ostrzeżeń; istniejące8 ostrzeżeń innych prac oraz ich wcześniejsze mieszane definicje wymagają osobnego audytu. Nie ogłaszamy całej aplikacji wolnej od błędów.

UI: własny projekt proj_mvqec9oc87qg6thn4 „Test kompletu — panele10m², profil1m, taśma7m”. Zakupy mają6 materiałów i2 narzędzia, również po odświeżeniu; zdjęcia nowych produktów, wybory paneli i folii oraz braki dostawy są widoczne. Pozostałe17 projektów zachowano. Expo8082 bez restartu.

Te same65 map pomiarów:83/240 wierszy wycenione,157 niewycenionych,8 pełnych scenariuszy MATERIAŁÓW. Dwa nowe wiersze laminatu celowo pozostają nieznane przy dawnych pomiarach bez potwierdzeń. To nie157 nowych SKU. Nadal potrzebne są24 oferty katalogowe, pozostałe zestawy instalacji/GK/tapet/klejów/podłóg, narzędzia, naprawa jednostek winylu, rzeczywiste lokalne zapasy/ceny i dostawy. Cel pozostaje aktywny.

Dowody lokalne: C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/work/catalog-wave54-*.json oraz logi testów. Zrzut UI: C:/Users/Startklaar/Documents/Codex/2026-10-24/prz/outputs/catalog54-delivery-status-20261027.png. Kwoty liczone w groszach z natywnych cen brutto i pełnych zamówień; niezależne sesje bez wysyłki danych klienta, składania zamówień i płatności.
