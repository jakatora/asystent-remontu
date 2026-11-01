# Cztery nowe taśmy i dostawa całego koszyka — wave169, 2026-11-01

Dodano cztery odrębne produkty Blue Dolphin: niebieskie taśmy 25/48 mm i żółte papierowe 38/48 mm. Każda pozycja to jedna rolka 50 m, z dokładnym GTIN, zdjęciem i ofertami Sewery oraz Rab-Dom. Użytkownik znajduje je po kodzie lub nazwie w dodawaniu produktów do wspólnego koszyka. Każdą szerokość i kolor wybiera osobno; stare referencje i zapisane projekty zachowano.

## Pełny koszt zamiast ceny samych materiałów

Rzeczywiste obserwacje z 2026-11-01 dla zapotrzebowania 51 m każdej z czterech taśm, czyli ośmiu rolek:

| Sklep | Materiały | Dostawa | Razem |
| --- | ---: | ---: | ---: |
| Rab-Dom | 91,56 zł | 10,50 zł | **102,06 zł** |
| Sewera | 86,58 zł | 19,90 zł | **106,48 zł** |

Materiały w Sewerze są tańsze o 4,98 zł, lecz pełny potwierdzony koszyk Rab-Dom jest tańszy o **4,42 zł**. Sewera potwierdziła osobno 30-001 i 00-001. Rab-Dom udostępnia krajową taryfę PL, bez indywidualnej wyceny kodowej; aplikacja i plan zakupów wskazują tę podstawę. Przeszukiwanie tego zestawu jest ograniczone i ostrzeżenia zachowano. Nie jest to dowód globalnego minimum.

## Tożsamość i jednostki

| Produkt | GTIN | Rab-Dom | Sewera |
| --- | --- | --- | --- |
| Niebieska 25 mm × 50 m | 5907758507308 | produkt 648 | karta p6965 |
| Niebieska 48 mm × 50 m | 5907758507292 | produkt 548 | karta p6969 |
| Żółta 38 mm × 50 m | 5907758504789 | produkt 3745 | karta p22108 |
| Żółta 48 mm × 50 m | 5907758504581 | produkt 3744 | karta p6963 |

- GTIN 5907758507308: [Rab-Dom](https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-do-wnetrz-i-na-zwenatrz-25mm-x-50m-niebieska/648), [Sewera](https://sklep.sewera.pl/tasma-malarska-niebieska-25mmx50m-p6965).
- GTIN 5907758507292: [Rab-Dom](https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-do-wnetrz-i-na-zewnatrz-48mm-x-50m-niebieska/548), [Sewera](https://sklep.sewera.pl/tasma-malarska-niebieska-48mmx50m-p6969).
- GTIN 5907758504789: [Rab-Dom](https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-38mm-x-50m/3745), [Sewera](https://sklep.sewera.pl/tasma-malarska-papierowa-38mm-x-50m-zolta-blue-dolphin-p22108).
- GTIN 5907758504581: [Rab-Dom](https://www.rabdom.pl/pl/p/BLUE-DOLPHIN-Tasma-malarska-papierowa-48mm-x-50m/3744), [Sewera](https://sklep.sewera.pl/tasma-malarska-papierowa-48mmx50m-p6963).

Każdy wpis w painting-tapes.ts, materials.ts i photos.ts ma dwa niezależne pierwotne źródła: dokładne karty obu sklepów. Zdjęcia pochodzą z kart Sewery dla tych samych kodów. Nie dodano binarnych zdjęć do repo. Metry nie stają się liczbą rolek; 50 m wymaga jednej rolki, 50,00001 m dwóch. Zapotrzebowanie z dwóch prac 20 + 31 m łączy się do dwóch rolek. Nie pomylono 50 m z 50 jardami, kartonem ani innym kolorem/szerokością.

Nowy moduł przypina pełną tożsamość ośmiu źródeł i fizyczne opakowanie. Natywny Shoper Rab-Dom musi potwierdzić dokładny kod, nazwę, jednostkę szt., brak sprzedaży na metry i brak opakowania zbiorczego. Wybrany stan/cena są ponownie potwierdzane w rzeczywistym koszyku sklepu. Zmieniony GTIN, marka, karton, jednostka lub metadata opakowania są odrzucane. Cena referencyjna nie zastępuje ceny koszyka z rabatem; kwoty i dostawy opierają się na faktycznej odpowiedzi sklepu.

Badanie starszych braków nie dało podstaw do aliasowania innych towarów: taśmy Norgips 5907651698851/5907651698004 w Adamex mają OutOfStock; wieszak i pianki HIPPER opisane jako Norgips mają kody przypisane w PSB do SILA. Nie dodano tych sprzecznych ofert i nie zastąpiono produktów zapisanych przez użytkownika. Źródła i surowe odczyty zachowano w katalogu dowodów.

## Weryfikacja

**1877 odrębnych testów PASS, 0 FAIL, 0 SKIP:** 508 aplikacji, 189 pricingu, 116 adapterów/API/relay i 1064 współdzielonego backendu. Dwa nowe testy katalogu aplikacji oraz pięć nowych testów fizycznych jednostek i tożsamości. Root i czysty checkout: testy aplikacji/pricingu, typy mobile/API oraz build pricingu PASS. Receptury, 66 identyfikatorów prac, obmiary, migracje 001–014 i zależności zachowano.

14 rzeczywistych natywnych przypadków integracyjnych PASS: oba pełne koszyki czterech produktów, dwa kody Sewery, porównanie sklepów, łączenie prac, granica jednej rolki oraz siedem wcześniejszych regresji Mapegum/Primer/braku jednego sklepu. **62 lokalne scenariusze przeglądarkowe PASS:** 31 koszyka, trzy rzeczywistego kalkulatora hydroizolacji, 15 wyboru najniższego kosztu/jednego sklepu i 13 nowych produktów. Cztery prawdziwe zdjęcia załadowane, wyszukiwanie po GTIN, dokładna kopia ośmiu rolek i jednej dostawy, zmiana sklepu/kodu oraz zachowanie wszystkich nowych referencji i ilości po eksporcie/importowaniu do drugiego własnego profilu i przeładowaniu. PL, izolacja, 390 px bez overflow, zero JS/429. Zrzuty i kopiowany plan sprawdzono wizualnie. Nie wykonywano prób na fizycznym Androidzie/iOS ani badań z klientami.

**14 publicznych integracji API oraz 62 publiczne scenariusze przeglądarkowe PASS**, bez podmiany odpowiedzi API/sklepów i bez błędów JS/HTTP429. Publiczne nowe próby obejmują cztery fotografie, oba sklepy, dwa kody, osiem rolek, plan zakupów oraz rzeczywisty eksport/import/przeładowanie. Kontrola SHA256 wszystkich 63 plików, dziewięciu tras 200, pięciu brakujących/prywatnych tras 404 i WASM przeszła; niepodpisany relay 401. Zachowano COOP same-origin, COEP credentialless i no-referrer.

## Publikacja

Źródło aplikacji **42fd74d2f6a5fdf7e7e73e996292142512141918**, wypchnięte. Współdzielony backend **b961f1c491b5eec867356304c0f5dd0fce321756**, [PR158](https://github.com/jakatora/przetargai/pull/158) scalony 2026-11-01 o 15:16:34 UTC, merge 98c8a3ba7bd4c63aeb3e21ecb43ccb14b8c70803. Zmieniono tylko wygenerowany moduł Remontu i jego seed. Zachowano wszystkie wcześniejsze 333 obserwacje, dodano osiem; plik ma 341 rekordów. Pozostałe 148 z 150 plików API pozostają identyczne z wdrożoną bazą. Finalny preflight i porównanie po publikacji potwierdzają wszystkie 150 przygotowanych plików.

- API **955a75a0-0d30-468c-a256-5ef2fc56e91f SUCCESS**; runtime SHA256 abb59a21eb271540d799607605ed31bd20df508811a3ff9ac51e39f77b7cf4e7.
- WWW **36f2c4f6-c455-4a79-bd3d-fe1f26bfbd4e SUCCESS**; health wskazuje źródło 42fd74d.

63 pliki WWW, 17 236 957 bajtów. Skan 76 wartości vaulta bez wycieku. Sześć plików serwera/config bez zmian. Relay przebudowano, aby rozpoznawał osiem nowych źródeł i te same zasady walidacji; SHA a2e48c3195c0ea851d3a99f09eeeacbd1a6e0ea706dec89621add9458024559b. Wyceny publiczne nowych źródeł są sprawdzane po publikacji obu części, ponieważ relay poprzedniego WWW nie miał ich w katalogu. Kod i realne natywne koszyki przeszły przed publikacją.

Dowody: G:/Projekty/asystent-remontu-work/wave169-20261101, source/preparation/deployed-verification/shared-pr/progress, native/cloud-proof, {local,production}-{qa,rich-qa,options-qa,tapes-qa}.json, plany, kopie, zrzuty, HTTP, audyt katalogu i logi. Initializery publikacji i profili wykonano; nie ponawiać na tych samych ścieżkach.

## Korekty środowiska i prób

Pierwszy pełny test backendu wskazał brak sąsiednich katalogów mobile/firebase wymaganych przez test SWZ. Dodano junction do istniejącego czystego repo i wykonano pełne 1064 testy ponownie: PASS. Nie poprawiano z tego powodu kodu produkcyjnego. Pierwszy czysty checkout nie znał nowego commitu przed fetch; jego wynik 506 testów zachowano osobno jako previous-source i nie zaliczono do nowych 508.

Helper nowych prób miał początkowo błędne oczekiwania schematu kopii (appPreferences zamiast istniejącego preferences) oraz etykiety importu koszyka bez projektów. Faktyczny produkt poprawnie pokazał cztery pozycje i przycisk Wczytaj koszyk z kopii. Po obejrzeniu eksportu/interfejsu poprawiono wyłącznie helper. W lokalnym r2 wznowiono tylko ostatni scenariusz w istniejącym terminalnym własnym profilu, zachowując dowody 12 wcześniejszych przypadków; finalne local-tapes-qa.json ma continuedFrom. Zasady produktu i porównań nie zostały osłabione.

Publiczny pierwszy przebieg regresji zatrzymał się przed końcowym importem. Diagnostyka tego samego własnego profilu pokazała ekran powitalny zamiast ekranu kopii, bez błędu aplikacji. Helper po 1200 ms sprawdzał obecność przycisku Pomiń warunkowo i mógł uznać chwilowy ekran główny za zakończoną inicjalizację. Poprawiono przygotowanie świeżych profili: zawsze oczekują ekranu powitalnego i kończą go przez istniejący przycisk, a Promise.all przechwytuje również błędy oczekiwania na filechooser. Import w tym samym profilu po ukończeniu powitania przeszedł. Nie zmieniano kodu produktu i nie zaliczono niedokończonego r1 jako 31 ukończonych prób. Dowody: public-import-diagnostic-failure.png/.txt, public-import-after-onboarding.json i pełny przebieg r2.

Końcowy publiczny audyt z 2026-11-01 o 15:31 UTC: **236 referencji, 203 z aktualną ofertą, 302 aktywne oferty**, cztery odrębne SKU bez EAN, zero pominięć i fałszywych potwierdzeń. Wszystkie osiem nowych źródeł jest aktywnych. Względem początku dodano osiem ofert, a wcześniejsze blu-mcalpine-whb132 zwróciło HTTP403, dlatego licznik wynosi 302 zamiast arytmetycznych 303; nie przywracano starej ceny, aby podbić licznik. Pozycja zachowuje inne źródło. Pozostają 33 wcześniejsze braki referencji oraz brak nowego pozytywnego potwierdzenia pełnych dostaw Castoramy/OBI zależnych od kodu i eTak/ABUD. Nie dodano nowego sklepu.

W publicznym teście opcji r2 ujawnił się również błąd pomiaru helpera: po przełączeniu do 485,90 zł dotarła spóźniona odpowiedź starszego żądania dla stałych wiader 5 kg (564,50 zł). Test liczył nadejście odpowiedzi jako nowy request. Zachowany tekst/zrzut interfejsu potwierdził, że suma nadal wynosiła 485,90 zł i stara odpowiedź nie nadpisała wyboru. Helper r3 mierzy rzeczywiste rozpoczęcia POST i ponownie sprawdza wybraną sumę po opóźnieniu; wszystkie 15 scenariuszy przeszło. Dowody production-options-attempt-r2.json oraz production-options-failure-r2.txt/.png. Ukończone 31 i trzy publiczne regresje z r2 zachowano, powtórzono tylko nieukończone opcje.

Obcy WIP ean-overlay.ts, mappings.ts, pnpm-lock.yaml, .atlas/ i PROPOZYCJE-COCKPIT.md nietknięty i niewłączony do wydań. Bez nowego serwera, kluczy, płatnego AI, konta, billing, harmonogramu, wiadomości, zamówienia lub płatności. Punkty checklisty płatności/webhooków nie mają zastosowania; weryfikację pieniędzy oparto na rzeczywistych cenach brutto, opakowaniach, rabatach i pełnych koszykach z potwierdzonymi dostawami. Cel ciągłego rozwoju pozostaje ACTIVE; ta partia jest postępem.
