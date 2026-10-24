# Plan rozwoju Asystenta Remontu

Aktualizacja: 2026-10-24. Cel właściciela: użytkownik ma wiedzieć, ile materiałów potrzebuje i gdzie kupi je najtaniej. Aplikacja ma być prosta w obsłudze i pokazywać zdjęcia rzeczywistych produktów.

## 1. Wiarygodne ilości i porównanie zakupów — backend podłączony, pierwszy katalog rzeczywistych ofert działa

- [x] Wspólna podstawa ilości dla kalkulatora, budżetu i porównania sklepów. Nie traktować metrów kwadratowych jako litrów lub kilogramów. Pozycje bez pewnego dopasowania pokazane jako niewycenione.
- [x] Rozdzielić zapotrzebowanie od ilości zaokrąglonej do opakowań. Do API przekazywać zapotrzebowanie, aby nie zaokrąglać go drugi raz.
- [x] Poprawnie odczytywać liczby z przecinkiem i egzekwować zakresy pomiarów.
- [ ] Jawnie rozróżnić cenę jednostki i opakowania, zachowując zgodność istniejących danych.
- [x] Najtańszy pełny koszyk i zakup w kilku sklepach dostępne z głównej nawigacji; algorytm uwzględnia mieszane wielkości opakowań.
- [x] Niepełna, demonstracyjna, niedostępna lub nieaktualna oferta nie może wygrywać jako najtańsza aktualna oferta. Próg aktualności: 7 dni; nie oznacza gwarancji ceny na kasie.
- [x] Przy porównaniu pokazać zakres: porównane sklepy, daty cen, kompletność koszyka i nieuwzględnioną dostawę/dojazd.
- [x] Podłączyć mobilne porównanie do istniejącego backendu i pierwszych rzeczywistych obserwacji cen. Zakres początkowy: 3 oferty 2 produktów z Castoramy i OBI; jawne daty i linki. Bez cen demonstracyjnych.
- [ ] Najbliższy priorytet: stabilne, regularne odświeżanie przez udostępnione feedy/API sklepów oraz rozszerzenie katalogu. Bezpośredni odczyt kart przez serwer jest blokowany. Błąd odczytu nie zmienia ceny ani daty; po 7 dniach oferta wypada z porównania.
- [ ] Zweryfikować zakres lokalizacji, dostawy i ceny brutto oraz porównanie tej samej specyfikacji produktu. Uwzględnić stan „mam już” i „kupione”.

W pierwszym pakiecie rozdzielono cenę jednostki i opakowania w modelu oraz poprawiono farbę i grunt w malowaniu ścian. Pozostałe dane cenowe wymagają osobnego przeglądu; nie przeliczano całego katalogu automatycznym mnożnikiem.

Odbiór: regresja malowania 40 m² / 1, 2 i 3 warstwy; liczby 2,5 i 0,8; koszt wymaganej liczby opakowań, a nie wyłącznie najniższa cena puszki; niepełny koszyk nie wygrywa z pełnym. Brak ceny pozostaje widoczny. Testy rzeczywistych modułów i kontrola typów.

## 2. Prostszy wygląd i fotografie produktów — rozpoczęcie razem z etapem 1

- [x] Czytelne główne akcje projektu: plan, zakupy i porównanie cen, wykonanie.
- [x] Dodatkowe materiały, narzędzia, budżet i zdjęcia uporządkowane jako drugorzędne widoki, bez utraty funkcji.
- [ ] Karta produktu: rzeczywiste zdjęcie z wiarygodnego źródła, pełna nazwa, wielkość opakowania, liczba opakowań, koszt i przejście do oferty.
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
