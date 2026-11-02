# Jedna wycena wybranego sklepu — 2026-11-02

Status: opublikowane i zweryfikowane publicznie 2026-11-02. Poprzednia i bieżąca tura = postęp. Cel całej aplikacji pozostaje aktywny.

## Problem potwierdzony w rzeczywistości

Publiczna wave191, dwa wejścia do koszyka czterech materiałów z zapisaną preferencją Decowant: cztery POST pricing/project, kolejno wszystkie sklepy / Decowant / wszystkie sklepy / Decowant. Kontrolny rzeczywisty UI RED w wave192 zakończył się 4 != 2; ceny, zdjęcia, kopia i wynik wybranego sklepu były poprawne. Artefakt production-hydroband-attempt-red-r1.json zachowuje żądania i odpowiedzi.

Pierwsza hipoteza o braku bariery odczytu preferencji była nieprawidłowa. CostEstimateTab już sprawdza loadedScope i gotowość wyborów. Dodatkowe zapytanie jest celowym pobraniem porównania innych sklepów przed wyceną wskazanego sklepu. Używa jednak tego samego kosztownego porównania transportu wszystkich sklepów, którego wynik nie służy do tego wyboru.

## Zmiana

Opcjonalne includeStoreChoices pozwala w jednym żądaniu wybranego sklepu otrzymać pomocnicze storeChoiceComparison: ceny materiałów, dostępność, braki i pełne alternatywy obliczone z tego samego snapshotu katalogu. Backend nie wywołuje dla nich wyceny transportu. Główna wycena zachowuje wybrany sklep, ilości, grosze i potwierdzone dostawy. Dodatkowe dane nie stają się koszykiem do zakupu ani historią cen widzianych w wybranym sklepie.

Wybór innego sklepu, najtańszego zestawu, odbioru, odświeżenie i anulowanie starszej odpowiedzi pozostają wymagane. Starszy serwer bez opcjonalnego pola zachowuje ograniczony fallback dwóch żądań. Nie zmieniamy cen, dat obserwacji, katalogu, seed, opakowań lub wymagań projektu.

Kontrolowany test HTTP używa oryginalnej wyceny Decowant z 03:54:14.037 UTC i zegara 03:58:00 UTC, bez odnowienia dat i bez sieci sklepów. Porównuje główny wynik z dotychczasowym kontraktem, pomocnicze dane z niezależną pełną wyceną materiałów i potwierdza brak wycen innych sprzedawców. Siedem testów klienta obejmuje jeden request, odświeżanie, brak potrzeby nowych alternatyw, zgodność ze starszym API, anulowanie, obcy sklep i izolację historii cen.

Artefakty G:/Projekty/asystent-remontu-work/wave192-20261102. Nie traktować pojedynczej poprawki jako końca ciągłego celu.

## Dowód po wdrożeniu

Publiczny GREEN: dwa wejścia na ten sam koszyk z zapisaną preferencją Decowant dały dwa POST, oba z właściwym sklepem i żądaniem danych alternatyw. RED sprzed zmiany: cztery POST dla tych samych czynności, wszystkie sklepy / Decowant / wszystkie sklepy / Decowant. Redukcja liczby tych zapytań o 50% nie jest pomiarem przyspieszenia p50/p95 ani spadku wszystkich HTTP do sklepów.

Po dwóch wejściach sprawdzono odświeżenie, wybór częściowo dostępnego Lobo, świadome porównanie najtańszego zestawu, powrót do Decowant, odbiór i ponowną dostawę. Łącznie osiem zamierzonych wejść/czynności i osiem POST; ilości 12,5 / 4 / 1 / 7 oraz kod 30-001 zachowane. Trzy braki w Lobo pozostają widoczne. Dwa pełne scenariusze UI lokalnie i publicznie: 18/18, zero błędów stron i API 429, fotografie, kopia i 320/390 px również PASS.

Trzy scenariusze rzeczywistego API lokalnie i publicznie PASS: wybrany sklep z alternatywami dla kodu 00-001, cały remont i częściowo dostępny wybrany sklep dla tego remontu. Pełny remont zachował 19 wymagań i 18 połączonych produktów. Niekompletny Decowant ma nieznaną pełną sumę i 15 brakujących wejściowych pozycji, mimo dostępnego materiałowego porównania innych sklepów; nie powstaje pozorny darmowy transport.

Czyste grupy 562 mobile / 237 pricing / 160 API lib / 159 adapters / 1064 shared PASS, bez fail/skip; grupy częściowo się pokrywają. Typy API/mobile i 66 legacy PASS. Pierwsze typy API wskazały błąd asercji w teście: dostęp do celowo nieobecnego pola po zawężeniu typu. Poprawiono asercję na sprawdzenie obecności klucza; api-types-first-attempt.log zachowany, pełne ponowne kontrole przeszły. Statusy GitHub puste, bez deklaracji zielonego CI.

Runtime/WWW source `bd82ac3618c4172d4e48f954fefea361d0ee6a6a`. [PR174](https://github.com/jakatora/przetargai/pull/174), head `9b246bfc0c0d33cb1c2187896b871cdf567ab8b8`, scalony z kontrolą SHA jako `c68933896aa4d06711d7f015226eedce8c3fbfd9`. API `6b880c17-ca05-468f-b9eb-30a38ea11364` SUCCESS 04:20:59.982 UTC; WWW `a729c4bc-1c9d-4e81-a050-74b268f0a9cd` SUCCESS 04:23:55.208 UTC.

Rzeczywisty snapshot: 150 zgodnych plików, jedynie bundle zmieniony, 149 innych plików i seed 361 zachowane bajtowo. SHA256 bundle `6d81b33f68d0714e8113d9e4df3119b84e6f1009c0b79d87b5ac77371eca4569`. Wszystkie 9 plików hostingu/relay bajtowo niezmienionych. WWW 63 zasoby / 17 296 916 B, sprawdzone SHA256, 77 wartości vaulta bez wycieku, prywatny POST 401, prywatne pliki 404 i trasy aplikacji 200.

Katalog nadal 247 referencji / 215 potwierdzonych / 322 ofert / 32 braki, zero fałszywych dopasowań. Bez zmian produktów, stawek, zależności, migracji i pozostałych aplikacji współdzielonego backendu. Foreign WIP ean-overlay/mappings/lock/.atlas/PROPOZYCJE nietknięte.

Konkretne publiczne próby: wybrany Decowant 563,61 zł (543,62 materiały + 19,99 krajowa dostawa), pełny remont 3709,50 zł (3119,01 + 590,49). Inne niepotwierdzone koszyki: ABUD retailer_connection_unavailable i Realbud retailer_transport_quote_required. Lokalne 3647,12 zł pochodziło z innej chwili i dostępnych koszyków; nie porównywać tych cen jako przyczynowego wyniku nowego kodu. Dowodem niezmienności kwot jest kontrolowany replay na tych samych danych. Wyszukiwanie nadal ograniczone, bez deklaracji globalnego minimum rynku.

Końcowy final-proof.json 04:26:11.267 UTC: 77 wystąpień nadal ważnych rzeczywistych wycen, bez korekty dat i syntetycznej historii. Dowód nie przedłuża ich ważności. Cache przed publikacją 359 obserwacji / 11 929 punktów, po 359 / 12 237. Zachowane 11 926 starych punktów, trzy prawidłowo usunięte istniejącą retencją 60/ofertę, odtworzoną rzeczywistą klasą. Kontrolowane oferty Decowant mają rzeczywistą zmianę 0 gr. Dane alternatyw nie są zapisywane jako wcześniejsze ceny oglądanych ofert wybranego sklepu.

Własny serwer PID 57212 / sesja 81193 zatrzymany exit 0 (726 HTTP łącznie wszystkich lokalnych scenariuszy, nie pojedynczego koszyka). Native 92596/72126 i UI 84835/68408 zakończone 0; RED 19528 zakończony 1 zgodnie z odtworzonym problemem. Wszystkie przeglądarki zamknięte, końcowy odczyt nie znalazł node wave192. Localhost:8082 i dane użytkownika nietknięte.

Następny krok: sprawdzić kompletność pierwszych ścieżek malowania, podłogi i hydroizolacji oraz ich aktualnych wariantów. Katalogowe 32 braki i stabilne dostawy Castoramy/OBI pozostają do rozwiązania; nie zastąpić tego wyłącznie dalszymi optymalizacjami. Cel ACTIVE.
