# Potwierdzone oferty przed dodaniem produktu — 2026-10-31, wave156

Wyszukiwarka dodatkowych materiałów wcześniej pokazywała pełny katalog bez wskazania, które dokładne modele mają potwierdzoną cenę. Użytkownik poznawał brak oferty dopiero po dodaniu. Nowy widok oznacza potwierdzoną cenę i liczbę sklepów oraz pozwala wybrać „Wszystkie produkty” albo „Z potwierdzoną ceną”. Pozostałe pozycje nadal są dostępne i można zachować je w remoncie.

Nie pokazujemy historycznej ceny referencyjnej jako oferty. Oznaczenie dotyczy ceny dokładnego modelu i opakowania. Dostawa, zapas wystarczający dla potrzebnej ilości i końcowy koszt całego koszyka są sprawdzane po dodaniu.

## Dane, zakres i trwałość

Nowe GET `/api/remont/pricing/catalog-availability` korzysta z tych samych dopuszczonych obserwacji i `isComparableOffer` co silnik koszyka. Nie odpytuje sklepów, nie otwiera baz innych aplikacji, nie zapisuje projektów, nie zawiera kwot ani obietnic dostawy. Zwraca kompletny, walidowany snapshot o zakresie online/PLN/deliveryIncluded=false. Pozycje odbierane wyłącznie osobiście nie są ofertą online.

Identyfikacja obejmuje dokładny GTIN, kategorię, jednostkę fizyczną i wielkość opakowania. Cztery referencje bez EAN mają oddzielną, wcześniej zweryfikowaną tożsamość sklepu: kod produktu, pełną nazwę wariantu, adres HTTPS, kategorię i jednostkę. Wykładziny eWinyl 2 m i 4 m pozostają odrębne mimo wspólnej strony. Nie dopisano im EAN-u ani nie zastosowano dopasowania przybliżonego.

Starsza referencja Nati Bianco ma kategorię `tile`, a jej aktualna karta `wall-tile`. W wyszukiwarce ujednolicono wyłącznie rozpoznanie tego jednego dokładnego modelu: ID `mat-tile-wall-paradyz-nati-bianco-25x40`, GTIN 5902610507960 i opakowanie 1,2 m². Nie zmieniono zapisanych materiałów, mapowań prac ani innych kategorii. Inny model, EAN, opakowanie lub kategoria kleju nie otrzymuje potwierdzenia.

Snapshot jest ważny najwyżej 30 sekund, krócej gdy wcześniej wygasa dowód ceny. Cache odejmuje czas trwania żądania i łączy równoległe odczyty. Nie ma odpytywania w pętli ani żądań od każdej litery. HTTP ma `Cache-Control: no-store`; krótki cache istnieje tylko w pamięci klienta, bez zapisu do kopii remontu. GET używa tego samego mechanizmu Retry-After co wyceny i historia; nie ponawia sam żądania.

Przy wygaśnięciu, błędzie lub nieprawidłowej odpowiedzi wraca pełny katalog, filtr potwierdzonych ofert jest niedostępny, a stan jest opisany jako niesprawdzony. Nie oznacza to braku produktu w sklepie. Wybrany model i wpisana ilość pozostają; ponowienie odczytu jest jawne. Stary zegar nie może wyczyścić nowszego odczytu. Po poprawnym ponowieniu nie pozostaje komunikat o wygaśnięciu.

## Weryfikacja

- 438/438 testów mobile, bez pominięć. Obejmuje walidację kompletności, tożsamości, zakresu i czasu; dokładne jednostki i opakowania; osobne warianty SKU; Nati; deduplikację, opóźnioną odpowiedź, wygaśnięcie, błąd, odzyskanie oraz wspólny 429 dla GET i POST.
- 30/30 testów regresji API/Certusoft/AKS/g-k, w tym pięć nowych testów katalogu. Rzeczywisty lokalny HTTP potwierdza brak żądań do sklepów, `no-store`, pominięcie wygasłej ceny i odpowiednią jednostkę. Warianty o tym samym URL nie łączą się.
- 1064/1064 testów współdzielonego backendu, 0 pominięć, końcowo z `--test-concurrency=1`. Pierwszy równoległy przebieg trafił na blokadę inicjalizacji SQLite w niezmienionym teście kopii zapasowej. Zachowano log błędu; nie zmieniono produkcyjnego modułu DB. Pełny przebieg sekwencyjny zakończył się poprawnie.
- Typecheck mobile, API i czystego checkout PASS; 66 legacy IDs bez zmiany. Brak nowych zależności, migracji i zmian obmiarów.
- Pełny audyt wszystkich 222 referencji z publicznym snapshotem oraz aktualnymi dopuszczonymi źródłami: **189 rozpoznanych, 0 pominiętych i 0 błędnie potwierdzonych**. Dane z 2026-10-31T16:44:18.521Z: 207 pozycji snapshotu (różne opakowania/tożsamości), cztery warianty bez EAN, 280 ofert i 189 produktów. To nie jest 207 nowych produktów.

Audyt został poszerzony po znalezieniu czterech referencji bez EAN, a następnie Nati. Wcześniejsze porównanie powielało warunek kategorii i nie wykrywało tej różnicy. Końcowe oczekiwanie dla GTIN odpowiada rzeczywistemu rozpoznawaniu kodu przez koszyk; nie porównuje wyłącznie kopii reguły filtra. Nie ukryto rozbieżności przez zmianę dat obserwacji lub poszerzenie dopasowania na inne modele.

W końcowym lokalnym pakiecie i publicznym wydaniu **937ad36** przetestowano: jeden odczyt podczas wyszukiwania; zero żądań wyceny podczas edycji samego formularza; brak oferty starego dziesięciopaku, cenę dokładnej rolki, cztery SKU, Nati, rzeczywiste wygaśnięcie snapshotu oraz jeden kontrolowany HTTP 503 wyłącznie dla pomocniczych informacji katalogowych. Wybór i ilość przetrwały błąd; jawne ponowienie otrzymało prawdziwe dane i usunęło komunikat wygaśnięcia. Udane ceny i dostawy nigdy nie były podmieniane. Dalszy koszyk potwierdził **64,88 zł** za dwie siatki, **258,86 zł** za cztery rolki i **447,86 zł** z przewodem 25 m, w tym **18,90 zł** transportu. Ponowne otwarcie zachowało trzy pozycje i kod 30-001. PL, 390 px bez przepełnienia, crossOriginIsolated=true, 0 błędów strony, 0 odpowiedzi 429. Publiczny przebieg łącznie wykonał trzy GET katalogu: pierwszy oraz dwa jawne ponowienia, bez żądań od pisania i bez automatycznego odpytywania.

Pierwszy test UI zatrzymał się na zbyt wczesnym sprawdzeniu asynchronicznego rejestru odpowiedzi 503; dodano oczekiwanie na ten konkretny wynik. Osobna kontrola obrazu wykryła pozostający komunikat wygaśnięcia po udanym ponowieniu; poprawiono obsługę starych timerów i dodano jawne sprawdzenie braku komunikatu po odzyskaniu danych. Nie zmieniono cen ani stawek, aby dopasować wyniki testów.

## Wdrożenie i zachowanie pozostałych aplikacji

Backend source `241bea488fd342d3d71f80760b1a2ad547533f37`, końcowy web `937ad362727f83c510c6237c8e5286302b40cb6d`. Po drodze osobne commity 674640d (funkcja), 241bea4 (dokładne SKU), 68bd930 (stare timery) i 937ad36 (kategoria Nati). Zachowano poprzednie artefakty i dowody zamiast ich nadpisywania.

Zmienia się tylko `src/services/remont-pricing.cjs`; pozostałe **149 ze 150** plików żywego snapshotu, w tym seed 315, router, CORS Retry-After i limiter, są identyczne bajtowo. Przed wdrożeniem ponowny snapshot nie wykazał zmian. SHA256 modułu `53c118704b21623fe910e0b63df61c18df4ed9bf6fa42aeb134106d0efdb1402`. Wdrożony snapshot ma 150/150 plików zgodnych z przygotowanym pakietem. PR [145](https://github.com/jakatora/przetargai/pull/145), końcowy head `bceed08fe7bacea540eacd225b50517ea8553311`, MERGED `cc6214a575b99ad23e1c091f9cbf5774f6eb8eb8`.

API `6f619662-3ee6-40ea-a5f2-0389fc270882` SUCCESS, utworzone 2026-10-31T16:38:04.734Z. Dotychczasowy web68bd930 `acf1b28d-2ac9-4b1f-a64b-eb36ae988417` SUCCESS, utworzone 2026-10-31T16:40:03.788Z, z publicznym przepływem PASS; jest zastąpiony końcowym web937ad36 `c1f3aca5-2ec5-439f-90f8-1c9b7022e559` SUCCESS, utworzonym 2026-10-31T16:48:27.858Z. Końcowy pakiet ma 63 zasoby / 17157817 B, zgodne SHA i 76 wartości vaulta bez wycieku. Publiczne HTTP dla source937ad36: 63 SHA zgodne, dziewięć tras 200, brakujące zasoby i prywatne pliki 404, niepodpisany relay POST 401, quoteRelayReady=true/missingAssetCount=0, COOP same-origin/COEP credentialless/Referrer-Policy no-referrer. Końcowy test UI na publicznym adresie PASS.

Prywatny relay pozostaje poza zasobami przeglądarki. SHA256 `48eb6aba6415a6e7502f06d6ca6516afa270f69e7407c22434422cc11c217e99` identyczny z wave155; kod wycen i protokół podpisanej dostawy bez zmiany. Diff241bea4→937ad36 dla API, biblioteki pricing-service i shared deploy jest pusty, więc nie ponawiano wdrożenia backendu ani jego testów po końcowych poprawkach frontendu.

Dowody poza repo: `work/catalog-search-{local,production}-qa-wave156-r4.json`, `catalog-search-{local,production}-{mobile,basket,hint-error}-wave156-r4.png`, `catalog-identity-audit-wave156-r4.json`, `catalog-identity-production-audit-wave156-r4.json`, `mobile-tests-wave156-r4.log`, `certusoft-regression-wave156-r2.log`, `shared-tests-wave156-r2-serial.log`, `typecheck-wave156-r4.log`, `api-typecheck-wave156-r2.log`, `catalog-preparation-wave156-r2.json`, `web-release-integrity-wave156-r4.json`, `web-production-http-wave156-r4.json`, `web-deploy-wave156-r4.json`.

Katalog pozostaje 222 referencje / 222 wpisy zdjęć / 315 źródeł / 280 aktywnych ofert dla 189 produktów, 33 wcześniejsze referencje bez aktywnej oferty. Ta partia poprawia wybieranie istniejących produktów; nie zwiększa licznika produktów. Cel dalszego rozwoju pozostaje ACTIVE.
