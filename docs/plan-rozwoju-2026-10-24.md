# Plan rozwoju Asystenta Remontu

Aktualizacja: 2026-10-24. Cel właściciela: użytkownik ma wiedzieć, ile materiałów potrzebuje i gdzie kupi je najtaniej. Aplikacja ma być prosta w obsłudze i pokazywać zdjęcia rzeczywistych produktów.

## 1. Wiarygodne ilości i porównanie zakupów — pierwszy pakiet wykonany lokalnie, integracja rzeczywistych ofert jest kolejnym priorytetem

- [x] Wspólna podstawa ilości dla kalkulatora, budżetu i porównania sklepów. Nie traktować metrów kwadratowych jako litrów lub kilogramów. Pozycje bez pewnego dopasowania pokazane jako niewycenione.
- [x] Rozdzielić zapotrzebowanie od ilości zaokrąglonej do opakowań. Do API przekazywać zapotrzebowanie, aby nie zaokrąglać go drugi raz.
- [x] Poprawnie odczytywać liczby z przecinkiem i egzekwować zakresy pomiarów.
- [ ] Jawnie rozróżnić cenę jednostki i opakowania, zachowując zgodność istniejących danych.
- [x] Najtańszy pełny koszyk i zakup w kilku sklepach dostępne z głównej nawigacji; algorytm uwzględnia mieszane wielkości opakowań.
- [x] Niepełna, demonstracyjna, niedostępna lub nieaktualna oferta nie może wygrywać jako najtańsza aktualna oferta. Próg aktualności: 7 dni; nie oznacza gwarancji ceny na kasie.
- [x] Przy porównaniu pokazać zakres: porównane sklepy, daty cen, kompletność koszyka i nieuwzględnioną dostawę/dojazd.
- [ ] Najbliższy priorytet: podłączyć mobilne porównanie do istniejącego backendu oraz rzeczywistych, regularnie odświeżanych ofert sklepów. W bieżącym lokalnym podglądzie brak adresu API. Nie uruchamiać porównania na seedach.
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

Zmiany są lokalne; nie opublikowano aktualizacji sklepowej ani nie potwierdzono działania feedów produkcyjnych. Wcześniejsze niezacommitowane zmiany mapowań, EAN i lockfile pozostawiono poza tym pakietem.
