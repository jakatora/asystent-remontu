# Plan rozwoju Asystenta Remontu

Aktualizacja: 2026-10-25. Cel właściciela: użytkownik ma wiedzieć, ile materiałów potrzebuje i gdzie kupi je najtaniej. Aplikacja ma być prosta w obsłudze i pokazywać zdjęcia rzeczywistych produktów.

## 1. Wiarygodne ilości i porównanie zakupów — backend podłączony, pierwszy katalog rzeczywistych ofert działa

- [x] Wspólna podstawa ilości dla kalkulatora, budżetu i porównania sklepów. Nie traktować metrów kwadratowych jako litrów lub kilogramów. Pozycje bez pewnego dopasowania pokazane jako niewycenione.
- [x] Rozdzielić zapotrzebowanie od ilości zaokrąglonej do opakowań. Do API przekazywać zapotrzebowanie, aby nie zaokrąglać go drugi raz.
- [x] Poprawnie odczytywać liczby z przecinkiem i egzekwować zakresy pomiarów.
- [ ] Jawnie rozróżnić cenę jednostki i opakowania, zachowując zgodność istniejących danych.
- [x] Najtańszy pełny koszyk i zakup w kilku sklepach dostępne z głównej nawigacji; algorytm uwzględnia mieszane wielkości opakowań.
- [x] Niepełna, demonstracyjna, niedostępna lub nieaktualna oferta nie może wygrywać jako najtańsza aktualna oferta. Próg aktualności: 7 dni; nie oznacza gwarancji ceny na kasie.
- [x] Przy porównaniu pokazać zakres: porównane sklepy, daty cen, kompletność koszyka i nieuwzględnioną dostawę/dojazd.
- [x] Podłączyć mobilne porównanie do istniejącego backendu i rzeczywistych cen. Stan 2026-10-25: 7 ofert 4 produktów z Castoramy, OBI, Sewery i Realbudu; jawne daty i linki. Wszystkie cztery materiały przykładowego malowania mają ofertę. Bez cen demonstracyjnych.
- [x] Uruchomić automatyczny odczyt 4 kart Sewery/Realbudu przy starcie i co 6 godzin; rzeczywiste odświeżenie po wdrożeniu potwierdzone. Cena brutto i dokładny wariant wymagane. Wygaśnięcie lub potwierdzony brak dostępności usuwa ofertę, także po restarcie.
- [ ] Poszerzyć katalog i zapewnić stabilne feedy/API sklepów. Castorama/OBI nadal blokują bezpośredni odczyt serwerowy. Błąd nie zmienia ceny ani daty; po 7 dniach oferta wypada z porównania.
- [x] Umożliwić wybór liczby rolek taśmy 50 m i opakowań folii 20 m² w nowym projekcie; 0 oznacza brak potrzeby zakupu. Starsze projekty zachowują liczbę rolek i opakowanie folii po przeliczeniu jednostek.
- [ ] Zweryfikować zakres lokalizacji, dostawy i ceny brutto oraz porównanie tej samej specyfikacji produktu. Uwzględnić stan „mam już” i „kupione”.

W pierwszym pakiecie rozdzielono cenę jednostki i opakowania w modelu oraz poprawiono farbę i grunt w malowaniu ścian. Pozostałe dane cenowe wymagają osobnego przeglądu; nie przeliczano całego katalogu automatycznym mnożnikiem.

Odbiór: regresja malowania 40 m² / 1, 2 i 3 warstwy; liczby 2,5 i 0,8; koszt wymaganej liczby opakowań, a nie wyłącznie najniższa cena puszki; niepełny koszyk nie wygrywa z pełnym. Brak ceny pozostaje widoczny. Testy rzeczywistych modułów i kontrola typów.

## 2. Prostszy wygląd i fotografie produktów — rozpoczęcie razem z etapem 1

- [x] Czytelne główne akcje projektu: plan, zakupy i porównanie cen, wykonanie.
- [x] Dodatkowe materiały, narzędzia, budżet i zdjęcia uporządkowane jako drugorzędne widoki, bez utraty funkcji.
- [x] Karta produktu w porównaniu: rzeczywiste zdjęcie z wiarygodnego źródła, pełna nazwa, wielkość opakowania, liczba opakowań, koszt i link do oferty. Pierwszy zakres: cztery materiały malowania.
- [x] Większe pola dotykowe głównych akcji i zakupów, czytelne etykiety oraz ciemniejszy akcent i tekst; zachowane PL/EN.
- [x] Pierwsze 5 fotografii konkretnych produktów, dopasowywanych po ID, EAN lub dokładnym URL źródła. Brak zdjęcia i błąd pobrania mają widok zastępczy.
- [ ] Uzupełnić fotografie pozostałych produktów i sprawdzić rzeczywisty build na telefonie.

Odbiór: kontrola na szerokości telefonu; widoczność ceny, opakowań i głównej akcji; przejście do właściwego sklepu; brak nieprawidłowych fotografii i rozjechanego układu po błędzie obrazu.

## 3. Krótszy kreator i pomiary

- [ ] Start od celu, np. „Odświeżam pokój”, zamiast wymagania znajomości branżowej nazwy pracy.
- [ ] Pytania o stan i efekt faktycznie zmieniają plan. Zapis odpowiedzi oraz wariantu jakości per projekt.
- [ ] Obliczanie ścian z wymiarów pokoju, z odjęciem okien i drzwi; możliwość podania znanego metrażu.
- [ ] Użyteczny wynik przed opcjonalnymi szczegółami; zachowanie i wznowienie szkicu.

Odbiór: dwa różne stany powierzchni dają odpowiedni zakres; budżet i pomieszczenie zachowane po ponownym otwarciu; testy pomiarów oraz startu z wybranego rodzaju pracy.

## 4. Wspólne zakupy dla całego remontu

- [ ] Jeden remont z kilkoma pracami i pomieszczeniami.
- [ ] Użyć istniejącej konsolidacji backendu, przekazując wszystkie etapy i ilości przed zaokrągleniem.
- [ ] Odjąć posiadane ilości materiałów, nie dublować narzędzi ani opakowań.
- [ ] Porównać ten sam kompletny koszyk w sklepach. Różnicę cen produktów oddzielić od kosztu dostaw i odbioru.

Odbiór: wspólny grunt/farba dla dwóch pomieszczeń zaokrąglone raz; własne materiały zmniejszają zakup; zmiana wymiaru aktualizuje wszystkie widoki bez kasowania ręcznych oznaczeń zakupów.

## 5. Prowadzenie przez pracę i kontakt z fachowcem

- [ ] Następna czynność, przygotowanie, lista potrzebnych produktów i kontrola zakończenia etapu.
- [ ] Czas schnięcia zgodny z wybranym produktem; istniejące checklisty i ostrzeżenia wykorzystane w kontekście zadania.
- [ ] Koszt robocizny z obmiaru i stawki, bez mnożnika ceny materiałów.
- [ ] Status zapytania do fachowca odzwierciedla rzeczywiste doręczenie; do tego czasu możliwość udostępnienia przygotowanej treści do własnego wykonawcy.

## 6. Kontrola kosztów, trwałość i weryfikacja z użytkownikami

- [ ] Planowane, wydane i pozostałe; rzeczywiste wydatki i zdjęcia rachunków.
- [ ] Kopia i odtworzenie projektów ze zdjęciami oraz opcjonalne współdzielenie listy.
- [ ] Pięć testów użyteczności i wywiady o rzeczywistych remontach.
- [ ] Mierzyć czas do poprawnej listy, kompletność cen, przejścia do ofert, ukończenie zakupów i powroty do kolejnego etapu.

Publikacja aktualizacji dopiero po sprawdzeniu nowego buildu: utworzenie projektu, porównanie cen, otwarcie oferty, zakupy offline i ponowne uruchomienie. iOS przez Codemagic.

## Weryfikacja pierwszego pakietu 2026-10-24

100 testów logiki i HTTP przeszło, bez pominięć. Kontrolowane ceny i DAO w testach HTTP nie są dowodem aktualnych cen produkcyjnych sklepów. W rzeczywistej aplikacji Expo uruchomionej lokalnie sprawdzono utworzenie projektu z powierzchnią 40,5 m², zapis, ponowne wejście, nawigację, zdjęcia i opakowania. Kontrola typów mobile, pricing-service oraz API przeszła.

Kontrola zachowania identyfikatorów: `node scripts/check-content-identifiers.cjs` — 741 ID zachowanych w 15 plikach. Stary skrypt bash nie działa na tym komputerze z powodu braku dystrybucji WSL; przenośna kontrola porównuje identyfikatory z HEAD.

Pierwszy pakiet był lokalny. Wcześniejsze niezacommitowane zmiany mapowań, EAN i lockfile pozostawiono poza nim. Aktualny stan integracji poniżej.

## Podłączenie rzeczywistych ofert — 2026-10-24

Istniejący wspólny backend otrzymał moduł `/api/remont/*`, bez nowego serwera i bez zmian baz pozostałych aplikacji. Deployment Railway `4ce626e9-6bac-4331-925a-3c09d542ef53` ma status SUCCESS. Mobilny klient domyślnie wskazuje ten moduł.

Pierwsze obserwacje pochodzą z faktycznego odczytu kart 2026-10-24: farba Śnieżka Barwy Natury biała 5 l w Castoramie i OBI oraz grunt Knauf 5 l w Castoramie. Każda ma oryginalny czas, URL i skrót treści źródła. Skrypty testowe i demonstracyjne feedy są jawnie oznaczone i nie mogą odświeżać się jako rzeczywiste oferty. Próba pobrania co 6 godzin nie gwarantuje odświeżenia: obecnie sklepy blokują fetch serwera. Nadal potrzebna stabilna integracja sklepowa.

Dowód produkcyjny przez rzeczywistego klienta aplikacji: `/health` 200, `/auth/me` bez tokenu 401, 3 oferty dostępne. Dla malowania 40,5 m² wyceniona część zakupów kosztuje 255,46 zł w dwóch sklepach wobec 271,48 zł w Castoramie — różnica 16,02 zł, bez dostaw. Taśma i folia pozostają jawnie niewycenione. Nie jest to pełny koszt remontu ani dowód najniższej ceny na całym rynku.

162 testy kalkulacji, kolektora, parsera, serializacji i HTTP PASS (0 pominiętych), dodatkowo 68 testów dotychczasowych tras wspólnego backendu PASS. Typecheck mobile, API i price-collector PASS. Podgląd porównania uproszczono do materiałów: bez powtórzonych sum robocizny i podwójnych kart produktów. Kosztorys pozostaje oddzielnym widokiem. Aktualizacja Android/iOS nie została jeszcze opublikowana.

Instrukcja odtworzenia integracji i granice danych: `deploy/shared-backend/README.md`.

## Pełne materiały malowania i odświeżanie — 2026-10-25

Dodano rzeczywiste oferty farby, taśmy i folii w Sewerze oraz gruntu w Realbudzie. Katalog obejmuje 7 ofert, 4 produkty i 4 sklepy. Nowe źródła zostały odczytane automatycznie na serwerze 2026-10-25 o 09:54:26–09:54:30 UTC, po wdrożeniu `48d46563-366d-43bf-ae4c-f877c7e21091` (SUCCESS). Zachowano aktualny backend PrzetargAI 1.1.6 z deploymentu `28e56cec-c10a-4735-8d08-f3008c09c138`. Nie wdrażano starego lokalnego checkoutu.

Odbiór przez rzeczywisty klient mobilny po HTTPS: wspólne `/health` 200, `/auth/me` bez tokenu 401. Dla 40,5 m², 2 warstw, wydajności 10 m²/l, 1 rolki taśmy 50 m i 1 folii 20 m² wszystkie 4 materiały mają ofertę, brak niewycenionych pozycji. Znaleziony zestaw: 2 puszki farby 197,00 zł, grunt 35,48 zł, taśma 14,72 zł, folia 8,45 zł; razem **255,65 zł** (Sewera 220,17 zł i Castorama 35,48 zł). Żaden pojedynczy sklep nie pokrywa całej listy. Dostawy, narzędzia i robocizna są poza sumą; to zakres pilotażowy, nie dowód najniższej ceny na całym rynku.

W podglądzie 390 × 844 sprawdzono nowy projekt `proj_mvnnone1288u42uor`, polski przecinek, nowe liczby taśmy/folii, zapis i ponowne otwarcie, wszystkie cztery karty oraz faktycznie załadowane zdjęcia taśmy i folii. Sumę z rozbiciem po sklepach przeniesiono nad tabelę; daty pokazują zakres 24–25.10.2026. Natywne wydanie Android/iOS nadal wymaga odbioru i publikacji.

169 testów modułów kalkulatora, kolektora, parserów, cache, serializacji i HTTP PASS, 0 pominiętych; 68 regresji dotychczasowego backendu PASS. Typecheck API i mobile oraz kontrola 741 ID w 15 plikach PASS. Dodano przypadki cen netto/brutto, różnych wymiarów produktu, wygaśnięcia w strefie Warszawy, niedostępności i restartu cache, materiałów posiadanych oraz zgodności starych projektów.

Następne kroki: rozszerzyć realny katalog i liczbę ofert dla każdego produktu, uwzględnić koszt dostaw/lokalny odbiór, edycję pomiarów istniejącego projektu oraz posiadane ilości wszystkich materiałów. Potem wspólny koszyk wielu prac i pomieszczeń zgodnie z etapem 4.
