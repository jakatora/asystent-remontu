# Kopia wspólnego koszyka i wyborów produktów — 2026-10-31, wave154

Naprawiono pomijanie globalnych wyborów paneli, folii, umywalki, płytek i kleju podczas tworzenia kopii remontu. Wcześniejsze prefiksy działały dla rzeczywistych projektów, lecz `renovation-basket` nie jest wierszem projektu w SQLite. Nowa kopia przenosi sześć rodzajów wyborów, razem z opakowaniem puszek dodanym w wave153. Jeden rejestr dozwolonych parserów definiuje walidację i klucze eksportu dla projektów oraz wspólnego koszyka.

Można również pobrać i odtworzyć sam koszyk, gdy nie utworzono jeszcze projektu. Plik zachowuje dodatkowe materiały, dokładne modele i opakowania, kod pocztowy, tryb odbioru/dostawy oraz sposób porównania zamówień. Nowy podgląd pokazuje liczbę dodatkowych produktów, a po imporcie udostępnia przejście do wspólnego koszyka.

## Łączenie danych

- Dodanie projektów zachowuje istniejące ustawienia wspólnego koszyka, także gdy na urządzeniu jest koszyk bez projektów. Wybrane modele i kod pocztowy nie są zastępowane danymi z innego remontu.
- Kopia zawierająca sam koszyk jest przywracana w pustej aplikacji. Przy istniejących danych import zatrzymuje się przed zapisem i pokazuje konkretny komunikat. Nie zgłasza sukcesu po pominięciu jedynej zawartości pliku.
- Domyślnie puste ustawienia nie są traktowane jak remont. Własny kod pocztowy, wybrany model, odbiór własny lub sposób zamawiania są danymi do zachowania.
- Nieprawidłowy model w dowolnym z sześciu selektorów odrzuca cały plik. Nie pomija się uszkodzonych wyborów ani nie wraca po cichu do innego produktu.
- Zachowano format pliku v1, wszystkie siedem dotychczasowych tabel, oryginalne ID i obsługę zdjęć. Nie utworzono sztucznego projektu dla samego koszyka. Dawne stawki ręczne i historyczne wyceny dostawy nadal nie stają się potwierdzoną ceną.

Pliki utworzone wcześniej mogą nie zawierać pominiętych wtedy wyborów. Nową, pełną kopię należy utworzyć w aktualnej aplikacji z pierwotnymi danymi.

## Weryfikacja

428/428 testów aplikacji, 0 pominięć. Siedem nowych rzeczywistych testów SQLite obejmuje eksport→plik→import wszystkich sześciu wyborów, zachowanie obecnych wyborów przy dodawaniu projektów, sam koszyk bez projektu, istniejący koszyk bez projektów, konflikt przed zapisem, puste i świadomie zmienione ustawienia oraz nieprawidłowe tożsamości produktów. Dotychczasowe testy rollbacku, błędu zapisu preferencji i utraconej odpowiedzi po COMMIT również przechodzą. Typecheck głównego i czystego checkout oraz 66 legacy IDs PASS.

Lokalny gotowy pakiet web, dwa osobne profile przeglądarki, rzeczywisty pobrany i wybrany plik JSON: źródło i cel mają 0 projektów; zachowano 3 dodatkowe pozycje, sześć wyborów oraz 30-001. Po otwarciu odtworzonego koszyka publiczne API i sklep potwierdziły **14 puszek PRO + 2 pierścienie = 24,04 zł materiałów + 18,90 zł dostawy = 42,94 zł**. Ponowny eksport zachował dokładnie wybory, materiały i ustawienia dostawy. Konflikt i plik z uszkodzonym wyborem nie zmieniły zapisanych danych. Brak przechwytywania cen lub dostaw, brak błędów strony i 429, PL, 390 px bez przepełnienia, crossOriginIsolated=true.

Inicjalizacja pięciu dodatkowych, poprawnych preferencji w profilu źródłowym była kontrolowanymi danymi testowymi. Sam transfer odbył się przez przyciski pobrania, wyboru pliku i importu. Profile należą wyłącznie do QA; nie użyto projektów użytkownika.

Nie zmieniono API, katalogu produktów, formuł kalkulatora ani stawek dostawy. Diff do wave153 dla `artifacts/api-server`, `lib/pricing-service` i `deploy/shared-backend` jest pusty. Prywatny relay web153 i web154 ma identyczny SHA256 `d0ef651bd57cb9a565e42b1ac4625cf6d2687dc46fd6841ca6eb24c9f8b2e8ad`. API pozostaje na wdrożeniu wave152 `2b17206f-9f05-440d-9ef8-ad88af96e1ca`.

Source aplikacji `c7f6357b6565e0863ff16fa4a222f0822530c5c3`. Pakiet web: 63 zasoby / 17147150 B, zgodne SHA, 76 wartości vaulta bez wycieku. Web deployment `3f9d7fbd-d57b-418e-b734-a0f185954aba` SUCCESS, utworzone 2026-10-31T15:44:36.128Z. Publiczny test ponownie potwierdził transfer przez plik: 0 projektów, 3 dodatkowe pozycje, sześć wyborów, kod 30-001 oraz rzeczywistą wycenę 42,94 zł. Ponowny eksport zachował dane; konflikt i nieprawidłowy model nie zmieniły koszyka. Brak błędów strony i 429, PL, 390 px bez przepełnienia, crossOriginIsolated=true.

Publiczne HTTP: wszystkie 63 SHA zasobów zgodne, dziewięć tras 200, brakujące zasoby i prywatne pliki 404, niepodpisany relay POST 401, quoteRelayReady=true, missingAssetCount=0. COOP same-origin, COEP credentialless, Referrer-Policy no-referrer. API potwierdza 278 ofert i 187 produktów.

Dowody poza repo: `work/basket-backup-{local,production}-qa-wave154.json`, `basket-transfer-{local,production}-wave154.json`, `basket-transfer-{local,production}-restored-wave154.json`, `basket-backup-{local,production}-restored-wave154.png`, `basket-backup-{local,production}-mobile-wave154.png`, `mobile-tests-wave154.log`, `typecheck-wave154.log`, `web-release-integrity-wave154.json`, `web-production-http-wave154.json`.

Katalog bez zmiany: 220 referencji / 220 wpisów zdjęć, 313 źródeł, 278 aktywnych ofert dla 187 produktów, 33 wcześniejsze pozycje bez aktywnej oferty. Cel dalszego rozwoju pozostaje ACTIVE.
